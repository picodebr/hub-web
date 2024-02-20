import React from 'react';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { AddButton } from './components/AddButton';
import { FilterSelect } from '../FilterSelect';

import { ICardListingPageProps } from './interfaces';

import {
  Container,
  Content,
  FiltersContainer,
  FilterMessage,
  FilterMessageFilter,
  FilterMessageStart,
  TopContainer,
  Message,
  MessageIconContainer,
  MessageContainer,
} from './styles';
import { TextInput } from '../Inputs/Text';

export const CardListingPage: React.FC<ICardListingPageProps> = ({
  search,
  filters,
  filterOptions,
  showMessageInstead,
  onSearch,
  onNew,
  onFilterChange,
  children,
  childrenRef,
  newButtonLabel,
  ...rest
}) => {
  const filterMessages = [];
  if (filters.visibility) filterMessages.push(filters.visibility);

  const filterMessage = filterMessages.join(', ');

  return (
    <Container {...rest}>
      <TopContainer>
        <TextInput value={search} onInputChange={onSearch} />
        <FiltersContainer>
          {filterOptions.visibility && (
            <FilterSelect
              label="visibilidade"
              filterOptions={filterOptions.visibility}
              selectedFilter={filters.visibility}
              allFiltersLabel="Todos"
              onSelect={(visibility) => onFilterChange({ ...filters, visibility })}
            />
          )}
        </FiltersContainer>
        <FilterMessage>
          {filterMessage && <FilterMessageStart>Filtrando por: </FilterMessageStart>}
          <FilterMessageFilter>{filterMessage}</FilterMessageFilter>
        </FilterMessage>
        {onNew && <AddButton label={newButtonLabel || 'Adicionar'} onButtonClick={onNew} />}
      </TopContainer>
      {showMessageInstead ? (
        <MessageContainer>
          <MessageIconContainer>
            <AiOutlineFileSearch />
          </MessageIconContainer>
          <Message>{showMessageInstead}</Message>
        </MessageContainer>
      ) : (
        <Content ref={childrenRef as React.Ref<HTMLDivElement>}>{children}</Content>
      )}
    </Container>
  );
};
