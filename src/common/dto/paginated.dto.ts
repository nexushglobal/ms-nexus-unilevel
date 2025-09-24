export class Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export class PaginationMeta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export class PaginatedNexus<T> {
  items: T[];
  pagination: PaginationNexusMeta;
}

export class PaginationNexusMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
