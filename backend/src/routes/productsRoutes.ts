import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Product } from '../entities/Product';
import { ILike } from 'typeorm';

const router = Router();

interface IFilters {
  fromDate: string;
  toDate: string;
  minPrice: number;
  maxPrice: number;
  ratingAbove: number;
  category: string;
  orderBy: string;
  orderDirection: 'ASC' | 'DESC' | undefined;
}

router.get('/', async (req: Request, res: Response) => {
  const {
    offset: offsetString,
    limit: limitString,
    productName,
    category,
    filters: filtersString,
    ids: idsString,
    orderBy: orderByString,
    orderDirection
  } = req.query as {
    offset: string;
    limit: string;
    productName: string;
    category: string;
    filters: string;
    ids: string;
    orderBy: string;
    orderDirection: 'ASC' | 'DESC' | undefined;
  };

  const productRepository = AppDataSource.getRepository(Product);

  let ids: number[] = [];
  let offset: number = 0;
  let limit: number | undefined;
  let orderBy = orderByString;
  let filters: IFilters | undefined = undefined;

  // Parse orderBy
  if (orderBy && orderBy.length > 0) {
    const productPropsArray = Object.getOwnPropertyNames(
      productRepository.metadata.propertiesMap
    );
    if (!productPropsArray.includes(orderBy)) {
      return res.status(400).send({ message: 'Invalid orderBy format' });
    }
  } else {
    orderBy = 'id';
  }

  // Parse filters
  if (filtersString && filtersString !== '') {
    try {
      filters = JSON.parse(filtersString);
    } catch (error) {
      return res.status(400).send({ message: 'Invalid filters JSON format' });
    }
  }

  // Parse IDs
  if (idsString && idsString !== '') {
    try {
      ids = JSON.parse(idsString);
      if (!Array.isArray(ids)) {
        throw new Error('IDs must be an array');
      }
    } catch (error) {
      return res.status(400).send({ message: 'Invalid product IDs format' });
    }
  }

  // Parse offset
  try {
    offset = parseInt(offsetString) || 0;
    if (isNaN(offset)) {
      throw new Error('Offset must be a number');
    }
  } catch (error) {
    return res.status(400).send({ message: 'Offset must be a number' });
  }

  // Parse limit
  try {
    if (limitString) {
      limit = parseInt(limitString);
      if (isNaN(limit)) {
        throw new Error('Limit must be a number');
      }
    } else {
      limit = undefined;
    }
  } catch (error) {
    return res.status(400).send({ message: 'Limit must be a number' });
  }

  if (isNaN(offset) && (limit !== undefined && isNaN(limit))) {
    return res
      .status(400)
      .send({ message: 'Offset and limit must be numbers' });
  }

  if (offset < 0 || (limit !== undefined && limit < 0)) {
    return res
      .status(400)
      .send({ message: 'Offset and limit must not be negative' });
  }

  if (orderDirection) {
    if (!orderDirection.match(/\b(?:ASC|DESC)\b/)) {
      return res
        .status(400)
        .send({ message: 'Order direction must be either ASC or DESC' });
    }
  }

  const queryBuilder = productRepository.createQueryBuilder('product');

  if (idsString && idsString.trim() !== '') {
    queryBuilder.andWhereInIds(ids);
  }

  if (filters) {
    if (filters.fromDate && filters.toDate) {
      const fromDate = new Date(filters.fromDate);
      const toDate = new Date(filters.toDate);
      queryBuilder.andWhere(
        'product.release_date BETWEEN :fromDate AND :toDate',
        {
          fromDate,
          toDate
        }
      );
    }
    if (!isNaN(filters.minPrice) && !isNaN(filters.maxPrice)) {
      console.log('filters', filters);

      const minPrice = Number(filters.minPrice);
      const maxPrice = Number(filters.maxPrice);
      queryBuilder.andWhere(
        'product.product_price BETWEEN :minPrice AND :maxPrice',
        {
          minPrice,
          maxPrice
        }
      );
    }
    if (!isNaN(filters.ratingAbove)) {
      const ratingAbove = Number(filters.ratingAbove);
      queryBuilder.andWhere(
        'product.product_rating BETWEEN :ratingAbove AND 5',
        {
          ratingAbove
        }
      );
    }
  }

  if (category && category.trim() !== '') {
    queryBuilder.andWhere({ product_category: ILike(`%${category}%`) });
  }

  if (productName && productName.trim() !== '') {
    queryBuilder.andWhere({ product_name: ILike(`%${productName}%`) });
  }

  const count = await queryBuilder.getCount();

  const products = await queryBuilder
    .orderBy(`product.${orderBy}`, orderDirection)
    .skip(offset)
    .take(limit)
    .getMany();

  return res.json({ products, count });
});

router.get('/all', async (req: Request, res: Response) => {
  const productRepository = AppDataSource.getRepository(Product);
  const products = await productRepository.find();
  return res.json(products);
});

router.get('/one/:productId', async (req: Request, res: Response) => {
  const productRepository = AppDataSource.getRepository(Product);

  try {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await productRepository.findOneBy({ id: productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: 'Error fetching product' });
  }
});

router.get('/categories', async (req: Request, res: Response) => {
  const productRepository = AppDataSource.getRepository(Product);
  const queryBuilder = productRepository.createQueryBuilder('product');
  const categoriesRaw = await queryBuilder
    .select(`DISTINCT product.product_category`)
    .getRawMany();

  const categories = categoriesRaw.map(value => value['product_category']);
  return res.json(categories);
});

export default router;
