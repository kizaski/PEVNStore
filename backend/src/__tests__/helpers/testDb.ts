import { DataSource } from 'typeorm';
import { Product } from '../../entities/Product';
import { User } from '../../entities/User';
import { Favourite } from '../../entities/Favourite';
import { CartProduct } from '../../entities/CartProduct';

let _dataSource: DataSource | null = null;

export function getTestDataSource(): DataSource {
  if (!_dataSource) {
    _dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [Product, User, Favourite, CartProduct],
      subscribers: [],
      migrations: []
    });
  }
  return _dataSource;
}

export async function initTestDb(): Promise<DataSource> {
  const ds = getTestDataSource();
  if (!ds.isInitialized) {
    await ds.initialize();
  }
  return ds;
}

export async function closeTestDb(): Promise<void> {
  if (_dataSource?.isInitialized) {
    await _dataSource.destroy();
    _dataSource = null;
  }
}

export async function clearAllTables(): Promise<void> {
  const ds = getTestDataSource();
  if (!ds.isInitialized) return;
  await ds.createQueryBuilder().delete().from(CartProduct).execute();
  await ds.createQueryBuilder().delete().from(Favourite).execute();
  await ds.createQueryBuilder().delete().from(Product).execute();
  await ds.createQueryBuilder().delete().from(User).execute();
}
