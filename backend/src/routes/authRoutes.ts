import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import passport from 'passport';
import argon2 from 'argon2';
import { Strategy as LocalStrategy } from 'passport-local';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { CartProduct } from '../entities/CartProduct';
import { CartItem } from '../types/types';
import dotenv from 'dotenv';

dotenv.config();

// const google_client_id = process.env.GOOGLE_CLIENT_ID!;
// const google_secret = process.env.GOOGLE_CLIENT_SECRET!;

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { username: username }
      });

      if (!user) {
        return done(null, false, {
          message: 'Incorrect username or password.'
        });
      }

      const isValid = await argon2.verify(user.password_hash, password);
      if (!isValid) {
        return done(null, false, {
          message: 'Incorrect username or password.'
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: google_client_id,
//       clientSecret: google_secret,
//       callbackURL: 'http://localhost:3001/auth/google/callback'
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const userRepository = AppDataSource.getRepository(User);
//         let user = await userRepository.findOne({
//           where: { googleId: profile.id }
//         });

//         if (user) {
//           return done(null, user);
//         }

//         user = new User();
//         user.googleId = profile.id;
//         user.email = profile.emails?.[0].value;
//         user.displayName = profile.displayName;
//         await userRepository.save(user);

//         done(null, user);
//       } catch (err) {
//         done(err);
//       }
//     }
//   )
// );

passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

const router = Router();

const saveCartToDb = async (cart: CartItem[], user: User) => {
  if (cart && cart.length > 0) {
    const cartRepository = AppDataSource.getRepository(CartProduct);
    for (const item of cart) {
      const cartProduct = cartRepository.create({
        user: user,
        product: { id: item.product_id },
        quantity: item.quantity
      });
      await cartRepository.save(cartProduct);
    }
  }
};

router.post('/login/password', (req, res, next) => {
  passport.authenticate('local', async (err: any, user: User, info: any) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Login failed' });
    }

    await saveCartToDb(req.session.cart!, user);

    req.login(user, err => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }

      return res.status(200).json({
        message: 'Login successful',
        user: { id: user.id, username: user.username }
      });
    });
    return res.status(404);
  })(req, res, next);
});

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    // res.redirect('/');
    return res.status(200).json({
      message: 'Logout successful'
    });
  });
});

router.post('/signup', async (req, res, next) => {
  try {
    const userRepository = AppDataSource.getRepository(User);

    if (!req.body.username || !req.body.email) {
      return res.status(409).json({ message: 'Email or username missing' });
    }

    const existingUser = await userRepository.findOne({
      where: { username: req.body.username }
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const existingEmail = await userRepository.findOne({
      where: { email: req.body.email }
    });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    if (req.body.password.length <= 6) {
      return res
        .status(409)
        .json({ message: 'Password must be longer than 6 characters' });
    }

    const hashedPassword = await argon2.hash(req.body.password, {
      timeCost: 3,
      memoryCost: 1024 * 64
    });

    const newUser = userRepository.create({
      username: req.body.username,
      email: req.body.email,
      password_hash: hashedPassword
    });

    const savedUser = await userRepository.save(newUser);

    await saveCartToDb(req.session.cart!, savedUser);

    return req.login(savedUser, err => {
      if (err) {
        return next(err);
      }

      return res.status(200).json({
        message: 'Signup successful',
        user: { id: savedUser.id, username: savedUser.username }
      });
    });
  } catch (err) {
    next(err);
  }
});

router.get('/sessionStatus', async (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ status: 'Authorized', session: req.session });
  }
  return res.status(200).json({ status: 'Unauthorized' });
});

// router.get(
//   '/google',
//   passport.authenticate('google', { scope: ['email', 'profile'] })
// );

// router.get(
//   '/google/callback',
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   (req, res) => {
//     return res.send(req.user);
//   }
// );

export default router;
