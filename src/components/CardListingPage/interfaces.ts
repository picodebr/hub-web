import { HTMLAttributes, MutableRefObject } from 'react';

export interface ICardListingPageProps extends HTMLAttributes<HTMLElement> {
  search: string;
  filters: IFilterSelected;
  filterOptions: IFilterOptions;
  onSearch: (value: string) => void;
  showMessageInstead: string;
  onFilterChange: (selectedFilters: IFilterSelected) => void;
  onNew?: () => void;
  newButtonLabel?: string;
  cardWidth?: string;
  childrenRef?: MutableRefObject<Element | undefined>;
}

export interface IFilterSelected {
  visibility?: string;
}

export interface IFilterOptions {
  visibility?: string[];
}
