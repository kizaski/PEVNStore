import 'reflect-metadata';
import express, { Express } from 'express';
import passport from 'passport';
import session from 'express-session';
import cartRoutes from '../../routes/cartRoutes';
import productsRoutes from '../../routes/productsRoutes';
import authRoutes from '../../routes/authRoutes';
import favouritesRoutes from '../../routes/favouritesRoutes';
import paymentRoutes from '../../routes/paymentRoutes';
import './testDb';

export function createTestApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/cart', cartRoutes);
  app.use('/products', productsRoutes);
  app.use('/auth', authRoutes);
  app.use('/favourites', favouritesRoutes);
  app.use('/payment', paymentRoutes);

  return app;
}
