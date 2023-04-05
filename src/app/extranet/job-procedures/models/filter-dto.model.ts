export interface FilterDto {
  search: string;
  page: number;
  pageSize: number;
  sortList: FilterDtoSort[];
}

export interface FilterDtoSort {
  field: string;
  direction: string;
}
