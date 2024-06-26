import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Product } from '../entities/Product';

export default class ProductsSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const productFactory = await factoryManager.get(Product);

    await productFactory.saveMany(90);
  }
}
