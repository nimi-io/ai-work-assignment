import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import appConfig from './index.config';
import { ConfigService } from '@nestjs/config';

const db = appConfig().database();

export const dbDataSourceOptions: DataSourceOptions = {
  type: db.type,
  ssl: db.ssl,
  host: db.host,
  port: db.port,
  username: db.username,
  password: db.password,
  database: db.database,
  synchronize: db.synchronize,
  logging: db.logging,

  entities: [path.join(__dirname, '../../**/*.entity.{ts,js}')],

  migrations: [path.join(__dirname, '../../database/migrations/*.{ts,js}')],
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const dataSource = new DataSource(dbDataSourceOptions);
export default dataSource;
