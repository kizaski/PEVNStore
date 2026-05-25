import { getTestDataSource, initTestDb, clearAllTables } from './helpers/testDb';

jest.mock('../data-source', () => ({
  AppDataSource: getTestDataSource()
}));

import { createTestApp } from './helpers/testApp';
import request from 'supertest';
import { Product } from '../entities/Product';
import { Express } from 'express';

let app: Express;
let productId1: number;
let productId2: number;

beforeAll(async () => {
  await initTestDb();
  app = createTestApp();
  await clearAllTables();

  const ds = getTestDataSource();
  const productRepo = ds.getRepository(Product);
  const [p1, p2] = await productRepo.save([
    {
      product_name: 'Cart Product 1',
      product_description: 'First cart test product',
      product_category: 'Toys',
      product_price: 15.99,
      release_date: new Date('2024-01-01'),
      manufacturer: 'ToyCorp',
      product_rating: 4.0,
      customer_reviews: 30,
      product_image_url: 'http://example.com/toy1.jpg',
      product_website: 'http://example.com'
    },
    {
      product_name: 'Cart Product 2',
      product_description: 'Second cart test product',
      product_category: 'Toys',
      product_price: 25.99,
      release_date: new Date('2024-02-01'),
      manufacturer: 'ToyCorp',
      product_rating: 4.5,
      customer_reviews: 60,
      product_image_url: 'http://example.com/toy2.jpg',
      product_website: 'http://example.com'
    }
  ]);
  productId1 = p1.id;
  productId2 = p2.id;
});

describe('Cart routes', () => {
  describe('GET /cart', () => {
    it('returns empty cart initially', async () => {
      const res = await request(app).get('/cart');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /cart', () => {
    it('adds an item to cart', async () => {
      const agent = request.agent(app);
      const res = await agent
        .post('/cart')
        .send({ product_id: productId1, quantity: 2 });
      expect(res.status).toBe(201);
      expect(res.body.message).toContain('Item added to cart');

      const getRes = await agent.get('/cart');
      expect(getRes.body).toHaveLength(1);
      expect(getRes.body[0].product_id).toBe(productId1);
      expect(getRes.body[0].quantity).toBe(2);
    });

    it('rejects duplicate item', async () => {
      const agent = request.agent(app);
      await agent
        .post('/cart')
        .send({ product_id: productId2, quantity: 1 });

      const res = await agent
        .post('/cart')
        .send({ product_id: productId2, quantity: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('duplicate');
    });

    it('rejects non-existent product', async () => {
      const res = await request(app)
        .post('/cart')
        .send({ product_id: 99999, quantity: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('doesnt exist');
    });

    it('rejects missing product_id', async () => {
      const res = await request(app)
        .post('/cart')
        .send({ quantity: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('missing');
    });
  });

  describe('PUT /cart', () => {
    it('updates item quantity', async () => {
      const agent = request.agent(app);
      await agent
        .post('/cart')
        .send({ product_id: productId1, quantity: 1 });

      const res = await agent
        .put('/cart')
        .send({ product_id: productId1, quantity: 5 });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('updated');

      const getRes = await agent.get('/cart');
      const item = getRes.body.find((i: any) => i.product_id === productId1);
      expect(item.quantity).toBe(5);
    });

    it('rejects updating non-existent cart item', async () => {
      const res = await request(app)
        .put('/cart')
        .send({ product_id: 88888, quantity: 2 });
      expect(res.status).toBe(406);
      expect(res.body.message).toContain('not in cart');
    });

    it('rejects missing fields', async () => {
      const res = await request(app)
        .put('/cart')
        .send({ product_id: 1 });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('missing');
    });
  });

  describe('DELETE /cart', () => {
    it('removes an item from cart', async () => {
      const agent = request.agent(app);
      await agent
        .post('/cart')
        .send({ product_id: productId1, quantity: 1 });

      const res = await agent
        .delete('/cart')
        .send({ product_id: productId1 });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('removed');

      const getRes = await agent.get('/cart');
      expect(
        getRes.body.find((i: any) => i.product_id === productId1)
      ).toBeUndefined();
    });

    it('rejects removing non-existent item when cart exists', async () => {
      const agent = request.agent(app);
      await agent
        .post('/cart')
        .send({ product_id: productId1, quantity: 1 });

      const res = await agent
        .delete('/cart')
        .send({ product_id: 99999 });
      expect(res.status).toBe(406);
      expect(res.body.message).toContain('not in cart');
    });

    it('rejects missing product_id', async () => {
      const res = await request(app)
        .delete('/cart')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('missing');
    });
  });

  describe('DELETE /cart/clear', () => {
    it('clears the cart', async () => {
      const agent = request.agent(app);
      await agent
        .post('/cart')
        .send({ product_id: productId1, quantity: 1 });
      await agent
        .post('/cart')
        .send({ product_id: productId2, quantity: 1 });

      const res = await agent.delete('/cart/clear');
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('cleared');

      const getRes = await agent.get('/cart');
      expect(getRes.body).toEqual([]);
    });
  });
});
