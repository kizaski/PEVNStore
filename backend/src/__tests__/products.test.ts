import { getTestDataSource, initTestDb, clearAllTables } from './helpers/testDb';

jest.mock('../data-source', () => ({
  AppDataSource: getTestDataSource()
}));

import { createTestApp } from './helpers/testApp';
import request from 'supertest';
import { Product } from '../entities/Product';
import { Express } from 'express';

let app: Express;

beforeAll(async () => {
  await initTestDb();
  app = createTestApp();
  await clearAllTables();
});

describe('GET /products', () => {
  beforeAll(async () => {
    const ds = getTestDataSource();
    const productRepo = ds.getRepository(Product);
    await productRepo.save([
      {
        product_name: 'Test Widget',
        product_description: 'A test widget',
        product_category: 'Electronics',
        product_price: 29.99,
        release_date: new Date('2024-01-01'),
        manufacturer: 'TestCorp',
        product_rating: 4.5,
        customer_reviews: 100,
        product_image_url: 'http://example.com/img1.jpg',
        product_website: 'http://example.com'
      },
      {
        product_name: 'Another Widget',
        product_description: 'Another test widget',
        product_category: 'Clothing',
        product_price: 49.99,
        release_date: new Date('2024-02-01'),
        manufacturer: 'OtherCorp',
        product_rating: 3.0,
        customer_reviews: 50,
        product_image_url: 'http://example.com/img2.jpg',
        product_website: 'http://example.com'
      },
      {
        product_name: 'Cheap Item',
        product_description: 'A cheap item',
        product_category: 'Electronics',
        product_price: 9.99,
        release_date: new Date('2024-03-01'),
        manufacturer: 'BudgetCorp',
        product_rating: 2.0,
        customer_reviews: 10,
        product_image_url: 'http://example.com/img3.jpg',
        product_website: 'http://example.com'
      }
    ]);
  });

  it('returns products with count', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(res.body).toHaveProperty('count');
    expect(res.body.count).toBe(3);
    expect(res.body.products).toHaveLength(3);
  });

  it('returns products filtered by category', async () => {
    const res = await request(app).get('/products?category=Electronics');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.products).toHaveLength(2);
    expect(
      res.body.products.every((p: Product) => p.product_category === 'Electronics')
    ).toBe(true);
  });

  it('returns products filtered by name', async () => {
    const res = await request(app).get('/products?productName=Widget');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  it('supports pagination with offset and limit', async () => {
    const res = await request(app).get('/products?offset=0&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.count).toBe(3);
  });

  it('returns empty for non-matching category', async () => {
    const res = await request(app).get('/products?category=Nonexistent');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(0);
    expect(res.body.count).toBe(0);
  });

  it('returns products by IDs', async () => {
    const allRes = await request(app).get('/products?limit=10');
    const ids = [allRes.body.products[0].id, allRes.body.products[2].id];
    const res = await request(app).get(
      `/products?ids=${JSON.stringify(ids)}`
    );
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(2);
  });

  it('rejects invalid orderBy', async () => {
    const res = await request(app).get('/products?orderBy=zzz');
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid orderBy');
  });

  it('rejects negative offset', async () => {
    const res = await request(app).get('/products?offset=-1&limit=10');
    expect(res.status).toBe(400);
  });

  it('rejects invalid filters JSON', async () => {
    const res = await request(app).get('/products?filters=not-json');
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid filters');
  });
});

describe('GET /products/all', () => {
  it('returns all products', async () => {
    const res = await request(app).get('/products/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
  });
});

describe('GET /products/categories', () => {
  it('returns distinct categories', async () => {
    const res = await request(app).get('/products/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toContain('Electronics');
    expect(res.body).toContain('Clothing');
    expect(res.body.length).toBe(2);
  });
});

describe('GET /products/one/:productId', () => {
  it('returns a product by valid ID', async () => {
    const allRes = await request(app).get('/products?limit=1');
    const productId = allRes.body.products[0].id;

    const res = await request(app).get(`/products/one/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.product_name).toBe('Test Widget');
  });

  it('returns 400 for invalid ID', async () => {
    const res = await request(app).get('/products/one/abc');
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid product ID');
  });

  it('returns 404 for non-existent product', async () => {
    const res = await request(app).get('/products/one/99999');
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Product not found');
  });
});
