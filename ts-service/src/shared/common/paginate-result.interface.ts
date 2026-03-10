/* eslint-disable prettier/prettier */
export interface PaginateResult {
  data: any[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

export interface IPaginateResult<T> {
  // [x: string]: any;
  // sort(arg0: () => number): unknown;
  data: T;
  meta: IMeta;
}

export interface IDefaultOptions {
  limit: number;
  page: number;
}

export interface IMeta {
  totalItems: number;
  count: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface IGetMetaProps {
  total: number;
  data: any[];
  limit: number;
  page: number;
}
