type FuncType = <T>(array: T[], pageInfo: IPageInfo) => T[];

interface IPageInfo {
  page: number;
  pages: number;
  pageSize: number;
}

export const getPageSlice: FuncType = (array, pageInfo) => {
  const start = (pageInfo.page - pageInfo.pages) * pageInfo.pageSize;
  const end = start + pageInfo.pageSize * pageInfo.pages;

  return array.slice(start, end);
};
