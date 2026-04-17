// FBA unified response body
export interface ResponseModel<T = any> {
  code: number;
  msg: string;
  data: T;
}

// FBA pagination data
export interface PageData<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Pagination query params
export interface PageParams {
  page?: number;
  size?: number;
}

// Status enum (0=disable, 1=enable)
export enum StatusType {
  DISABLE = 0,
  ENABLE = 1,
}

// Menu type enum
export enum MenuType {
  DIRECTORY = 0,
  MENU = 1,
  BUTTON = 2,
  EMBEDDED = 3,
  LINK = 4,
}
