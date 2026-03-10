import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  Not,
  IsNull,
  Repository,
  DeepPartial,
  UpdateResult,
  DeleteResult,
  FindOneOptions,
  FindManyOptions,
  FindOptionsWhere,
} from 'typeorm';
import {
  IMeta,
  IGetMetaProps,
  IPaginateResult,
  IDefaultPaginationOptions,
} from '../../interface/index.interface';

export abstract class AbstractRepository<
  TSchema extends { id: string; deletedAt?: Date; createdAt: Date },
> {
  constructor(readonly schemaModel: Repository<TSchema>) {}

  async findOne(
    schemaFilterQuery: FindOptionsWhere<TSchema>,
    options?: FindOneOptions<TSchema>,
  ): Promise<TSchema | null> {
    return this.schemaModel.findOne({ where: schemaFilterQuery, ...options });
  }

  async findWithDeleted(id: string): Promise<TSchema | null> {
    return this.schemaModel.findOne({
      where: { id: id as unknown as any },
      withDeleted: true,
    });
  }

  async findWithRelations(
    schemaFilterQuery: FindOptionsWhere<TSchema>,
    relations: string[],
  ): Promise<TSchema | null> {
    return this.schemaModel.findOne({
      where: schemaFilterQuery,
      relations,
    });
  }

  async find(
    schemaFilterQuery: FindOptionsWhere<TSchema>,
    options?: FindManyOptions<TSchema>,
  ): Promise<TSchema[]> {
    return this.schemaModel.find({ where: schemaFilterQuery, ...options });
  }

  async findAllDeleted(): Promise<TSchema[]> {
    return this.schemaModel.find({
      where: { deletedAt: Not(IsNull()) } as FindOptionsWhere<TSchema>,
    });
  }

  async create(createSchemaData: DeepPartial<TSchema>): Promise<TSchema> {
    const entity = this.schemaModel.create(createSchemaData);

    return this.schemaModel.save(entity);
  }

  async createMany(
    createSchemaData: DeepPartial<TSchema>[],
  ): Promise<TSchema[]> {
    const entities = this.schemaModel.create(createSchemaData);
    return this.schemaModel.save(entities);
  }

  async count(schemaFilterQuery: FindOptionsWhere<TSchema>): Promise<number> {
    return this.schemaModel.count({ where: schemaFilterQuery });
  }

  async findAndPaginate(
    schemaFilterQuery: FindOptionsWhere<TSchema>,
    options: IDefaultPaginationOptions = this.DEFAULTPAGINATIONOPTIONS,
    relations?: string[],
  ): Promise<IPaginateResult<TSchema[] | null>> {
    const [data, total] = await this.schemaModel.findAndCount({
      where: schemaFilterQuery,
      skip:
        options.page && options.limit ? (options.page - 1) * options.limit : 0,
      take: options.limit,
      order: options.sort,
      relations,
      ...options,
    });

    const meta = this.getMeta({
      total,
      limit: options.limit,
      page: options.page,
    });
    return { data, meta };
  }

  async findOneAndUpdate(
    schemaFilterQuery: FindOptionsWhere<TSchema>,
    updateData: Partial<TSchema>,
  ): Promise<TSchema | null> {
    const entity = await this.schemaModel.findOne({ where: schemaFilterQuery });
    if (!entity) return null;

    Object.assign(entity, updateData);
    return this.schemaModel.save(entity);
  }

  async update(
    id: string,
    updateSchemaData: QueryDeepPartialEntity<TSchema>,
  ): Promise<UpdateResult> {
    return await this.schemaModel.update(id, updateSchemaData);
  }

  async updateMany(
    schemaFilterQuery: FindOptionsWhere<TSchema>,
    updateData: QueryDeepPartialEntity<TSchema>,
  ): Promise<UpdateResult> {
    return this.schemaModel.update(schemaFilterQuery, updateData);
  }

  async findOneAndDelete(
    schemaFilterQuery: FindOptionsWhere<TSchema>,
  ): Promise<DeleteResult> {
    return this.schemaModel.delete(schemaFilterQuery);
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.schemaModel.delete(id);
  }

  async deleteMany(
    schemaFilterQuery: FindOptionsWhere<TSchema>,
  ): Promise<DeleteResult> {
    return this.schemaModel.delete(schemaFilterQuery);
  }

  async increment(
    schemaFilterQuery: FindOptionsWhere<TSchema>,
    propertyPath: string,
    value: number,
  ): Promise<UpdateResult> {
    return this.schemaModel.increment(schemaFilterQuery, propertyPath, value);
  }

  protected getMeta({ total, limit, page }: IGetMetaProps): IMeta {
    const totalPages = Math.ceil(total / limit);
    return {
      total,
      limit,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  protected DEFAULTPAGINATIONOPTIONS: IDefaultPaginationOptions = {
    limit: 10,
    page: 1,
    sort: { field: 'createdAt', order: 'desc' },
    // relations?: [] as string[],
  };
}
