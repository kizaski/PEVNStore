import Stripe from 'stripe';
import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { CartProduct } from '../entities/CartProduct';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const stripe_secret = process.env.STRIPE_API_KEY!;
const stripe = new Stripe(stripe_secret, {
  apiVersion: '2024-04-10'
});

const extractCallerUrl = (req: Request, res: Response, next: any) => {
  const fullUrl = req.get('referer');
  if (fullUrl) {
    const { origin } = new URL(fullUrl);
    req.frontendBaseUrl = origin;
  } else {
    req.frontendBaseUrl = '';
  }
  return next();
};

router.use(extractCallerUrl);

router.post('/create-checkout-session', async (req: Request, res: Response) => {
  const cartRepository = AppDataSource.getRepository(CartProduct);
  const cart = await cartRepository.find({ relations: ['product'] });

  if (cart.length === 0) {
    // return res.status(400).json({ message: 'Cart is empty' });
    return res.status(303).redirect(`${req.frontendBaseUrl}/cart/?empty=true`);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: cart.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.product_name
          },
          unit_amount: item.product.product_price * 100
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: `${req.frontendBaseUrl}/successful-payment`,
      cancel_url: req.get('referer') || `${req.frontendBaseUrl}/cart`
    });

    // must use webhooks to delete on payment status successful
    await cartRepository.delete({});

    return res.status(303).redirect(session.url!);
  } catch (error) {
    console.error(error);
  }
});

export default router;
