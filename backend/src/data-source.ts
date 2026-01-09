import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
// import { runSeeders } from 'typeorm-extension';
import { Product } from './entities/Product';
import { User } from './entities/User';
import { Favourite } from './entities/Favourite';
import { CartProduct } from './entities/CartProduct';
import dotenv from 'dotenv';

dotenv.config();

const db = process.env.POSTGRES_DB;
const dbuser = process.env.POSTGRES_USER;
const dbpass = process.env.POSTGRES_PASSWORD;
const dbhost = process.env.DB_HOST;

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: dbhost,
  port: 5432,
  username: dbuser,
  password: dbpass,
  database: db,
  synchronize: true,
  logging: true,
  entities: [Product, User, Favourite, CartProduct],
  subscribers: [],
  migrations: [],
  seeds: ['src/seeders/**/*{.ts,.js}'],
  factories: ['src/factories/**/*{.ts,.js}']
};

export const AppDataSource = new DataSource(options);

// to initialize the initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(async dataSource => {
    // await runSeeders(dataSource);
  })
  .catch(error => console.log(error));
