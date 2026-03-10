/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  EntityTarget,
  FindOptions,
  FindManyOptions,
  FindOneOptions,
  Repository,
  SaveOptions,
  RootFilterOperators,
  QueryBuilder,
} from 'typeorm';
import {
  IDefaultOptions,
  IGetMetaProps,
  IMeta,
  IPaginateResult,
} from '../paginate-result.interface';

@Injectable()
export class AbstractService<T> {
  protected constructor(
    private readonly repository: Repository<T>,
    private readonly entityClass: EntityTarget<T>,
    protected readonly entityName?: string,
  ) {}

  protected DEFAULTOPTIONS: IDefaultOptions = { limit: 10, page: 1 };

  protected getMeta({ total, data, limit, page }: IGetMetaProps): IMeta {
    let meta: Partial<IMeta> = { totalItems: total, count: data?.length };
    meta = { ...meta, itemsPerPage: limit, currentPage: page };
    meta = { ...meta, totalPages: Math.ceil(total / limit) };
    return meta as IMeta;
  }

  async findAll(
    condition?: FindManyOptions<T>,
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<T[]> {
    return await this.repository.find(condition);
  }

  async create(
    data: DeepPartial<T>,
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<T> {
    const newRecord = this.repository.create(data);
    try {
      return await this.repository.save(newRecord as DeepPartial<T>);
    } catch (e) {
      console.error(e);
    }
  }

  async save(
    data: DeepPartial<T>,
    // @TransactionManager() transactionManager?: EntityManager,
  ) {
    return await this.repository.save(data as DeepPartial<T>);
  }
  async createMany(
    data: DeepPartial<T>[],
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<T[]> {
    const newRecords = this.repository.create(data);
    return await this.repository.save(newRecords as DeepPartial<T[]>);
  }

  async findOne(
    condition: FindOneOptions<T>,
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<T> {
    try {
      return await this.repository.findOne(condition);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async findOneOrFail(
    condition: FindOneOptions<T>,
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<T> {
    return await this.repository.findOneOrFail(condition);
  }

  async findByIds(
    condition: string[] | number[],
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<T[]> {
    return await this.repository.findByIds(condition);
  }

  async count(
    condition: FindManyOptions<T>,
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<number> {
    return await this.repository.count(condition);
  }

  async find(
    condition: FindManyOptions<T>, //| RootFilterOperators<T>,
    options = this.DEFAULTOPTIONS,
  ): Promise<IPaginateResult<T[]>> {
    const { limit = 100, page = 1 } = options;
    const query = { ...condition, take: limit, skip: (page - 1) * limit };
    const [data, total] = await this.repository.findAndCount(query);
    const meta = this.getMeta({ total, data, limit, page });
    return { data, meta };
  }

  // async find(
  //   condition: FindManyOptions<T>,
  //   options: { limit?: number; page?: number } = this.DEFAULTOPTIONS,
  // ): Promise<IPaginateResult<T[]>> {
  //   const limit = options.limit ?? 10;
  //   const page = options.page ?? 1;
  //   //console.log(options)
  //   const query = {
  //     ...condition,
  //     take: limit,
  //     skip: (page - 1) * limit,
  //   };
  //   const [data, total] = await this.repository.findAndCount(query);
  //   const meta = this.getMeta({ total, data, limit, page });
  //   return { data, meta };
  // }
  async update(
    id: any, // string | number,
    data: DeepPartial<T>,
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<T> {
    const exists = await this.repository.findOne(id);
    if (!exists)
      throw new Error(`${this.entityName || 'Record'} Does Not Exist`);
    return await this.repository.save({ id, ...exists, ...data });
  }

  async updateWhere(
    condition: FindOneOptions<T>,
    data: DeepPartial<T>,
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<T> {
    const exists = await this.repository.findOne(condition);
    if (!exists)
      throw new Error(`${this.entityName || 'Record'} Does Not Exist`);
    return await this.repository.save({ ...exists, ...data });
  }

  async updateManyWhere(
    condition: RootFilterOperators<T> | FindOneOptions<T>,
    data: DeepPartial<T>,
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<T[]> {
    const exists = await this.repository.find(
      condition.where ? condition.where : condition,
    );
    if (!exists)
      throw new Error(`${this.entityName || 'Record'} Does Not Exist`);
    if (exists.length === 0) return exists;
    const updateData = exists.map((item) => ({ ...item, ...data }));
    return await this.repository.save(updateData);
  }

  async softRemove(
    condition: FindOneOptions<T>,
    saveOptions?: SaveOptions,
    // @TransactionMan .ager() transactionManager?: EntityManager,
  ): Promise<{ message: string }> {
    const exists = await this.repository.findOne(condition);
    if (!exists)
      throw new Error(`${this.entityName || 'Record'} Does Not Exist`);
    const record = this.repository.create(exists as DeepPartial<T>);
    await this.repository.softRemove(record as DeepPartial<T>, saveOptions);
    return { message: `${this.entityName || 'Record'} Deleted Successfully` };
  }

  async delete(
    id: string | number | string[] | number[],
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<DeleteResult> {
    return await this.repository.delete(id);
  }

  async deleteWhere(
    condition: RootFilterOperators<T>,
    // @TransactionManager() transactionManager?: EntityManager,
  ): Promise<DeleteResult> {
    const { where } = condition; // Assuming where is the deletion criteria

    return await this.repository.delete(where);
  }

  async query(query: string, id: string): Promise<T[]> {
    return await this.repository.query(query, [id]);
  }
  async queryArr(query: string, id: string[]): Promise<T[]> {
    return await this.repository.query(query, [...id]);
  }

  // async sqlQuery(query: string): Promise<T[]> {
  //   return this.repository.query(query);
  // }

  // async beginTransaction(): Promise<EntityManager> {
  //   return await this.repository.manager.transaction(
  //     async (transactionManager) => {
  //       return transactionManager;
  //     },
  //   );
  // }

  // async commitTransaction(): Promise<void> {
  //   let queryRunner;
  //   try {
  //     queryRunner = this.repository.manager.connection.createQueryRunner();
  //     await queryRunner.startTransaction();

  //     // Your code inside the transaction

  //     await queryRunner.commitTransaction();
  //   } catch (error) {
  //     // Handle transaction errors here
  //     console.error('Error during transaction:', error);
  //     await queryRunner.rollbackTransaction(); // Rollback on error
  //     throw error; // Re-throw the error to propagate it
  //   } finally {
  //     await queryRunner.release(); // Release the query runner
  //   }

  //   return Promise.resolve(); // Explicitly return a Promise that resolves to void
  // }
  // async rollbackTransaction(): Promise<void> {
  //   let queryRunner;

  //   try {
  //     const connection = this.repository.manager.connection; // Get the connection
  //     queryRunner = connection.createQueryRunner();
  //     await queryRunner.startTransaction();

  //     // Your code inside the transaction

  //     // ...
  //   } catch (error) {
  //     // Handle transaction errors here
  //     console.error('Error during transaction:', error);
  //     await queryRunner.rollbackTransaction(); // Rollback on error
  //     throw error; // Re-throw the error to propagate it
  //   } finally {
  //     await queryRunner.release(); // Release the query runner
  //   }

  //   return Promise.resolve(); // Explicitly return a Promise that resolves to void
  // }
  // async isInTransaction(manager: EntityManager): Promise<boolean> {
  //   const connection = manager.connection; // Get the connection
  //   const queryRunner = connection.createQueryRunner(); // Create a query runner
  //   const hasActiveQueryRunner = await queryRunner.hasActiveTransaction(); // Check for active transaction
  //   await queryRunner.release(); // Release the query runner
  //   return hasActiveQueryRunner;
  // }
}
