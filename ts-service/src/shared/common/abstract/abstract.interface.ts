export interface IPaginateResult<T> {
  data: T;
  meta: IMeta;
}

export interface IDefaultPaginationOptions {
  limit: number;
  page: number;
  sort: any;
}

export interface IMeta {
  total: number;
  limit: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IGetMetaProps {
  total: number;
  limit: number;
  page: number;
}
