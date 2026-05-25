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
import dotenv from 'dotenv';

dotenv.config();

const createApp = (): Express => {
  const app: Express = express();
  const session_secret = process.env.SESSION_SECRET || 'test-secret';

  app.use(express.json());

  const allowedOrigins = [
    /^https?:\/\/(?:[^:]+\.)?localhost(?::\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(?::\d+)?$/,
    /^https?:\/\/\[::1\](?::\d+)?$/,
    /^https?:\/\/pevnstore\..*onrender\.com\/?$/
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(new Error('CORS not allowed'));
        for (let i = 0; i < allowedOrigins.length; i++) {
          if (allowedOrigins[i].test(origin)) return callback(null, true);
        }
        return callback(new Error('CORS not allowed'));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
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

  return app;
};

export default createApp;
export { createApp };
