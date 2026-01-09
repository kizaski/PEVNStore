import express, { Express, Request, Response } from 'express';
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { Product } from './entities/Product';
import passport from 'passport';
import session from 'express-session';
import cartRoutes from './routes/cartRoutes';
import productsRoutes from './routes/productsRoutes';
import authRoutes from './routes/authRoutes';
import favouritesRoutes from './routes/favouritesRoutes';
import paymentRoutes from './routes/paymentRoutes';
import cors from 'cors';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app: Express = express();
const port = parseInt(process.env.PORT!, 10) || 3001;
const session_secret = process.env.SESSION_SECRET!;

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173'
  })
);

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 2
      // maxAge: 1000 * 10
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use('/cart', cartRoutes);
app.use('/products', productsRoutes);
app.use('/auth', authRoutes);
app.use('/favourites', favouritesRoutes);
app.use('/payment', paymentRoutes);

app.get('/', async (req: Request, res: Response) => {
  const productRepository = AppDataSource.getRepository(Product);
  const savedProducts = await productRepository.find();
  const user = req.user ? req.user : 'No user logged in';

  res.json({
    loggedUser: user,
    products: savedProducts
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
});
