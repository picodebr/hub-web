import React, { useRef, useState } from 'react';
import { AiOutlineCheck } from 'react-icons/ai';
import { MdKeyboardArrowDown } from 'react-icons/md';

import {
  Container,
  Button,
  List,
  ListItem,
  ButtonIconContainer,
  ListHeader,
  ListMask,
} from './styles';

interface IProps {
  label: string;
  filterOptions: string[];
  selectedFilter?: string;
  allFiltersLabel?: string;
  showAllFilter?: boolean;
  openLeftIndexOnMobile?: number;
  onSelect: (selectedOption: string) => void;
}

export const FilterSelect: React.FC<IProps> = ({
  label,
  filterOptions,
  selectedFilter,
  allFiltersLabel,
  showAllFilter,
  openLeftIndexOnMobile,
  onSelect,
}) => {
  const [showList, setShowList] = useState(false);
  const listMaskRef = useRef<HTMLDivElement>(null);

  const handleListMaskClick: React.MouseEventHandler<HTMLDivElement> = e => {
    if (e.target === listMaskRef.current) setShowList(false);
  };

  return (
    <Container
      data-show-list={showList}
      openLeftIndexOnMobile={openLeftIndexOnMobile}
    >
      <Button onClick={() => setShowList(!showList)}>
        {label}{' '}
        <ButtonIconContainer>
          <MdKeyboardArrowDown />
        </ButtonIconContainer>
      </Button>
      <List>
        <ListHeader>Selecione</ListHeader>
        {(showAllFilter || showAllFilter === undefined) && (
          <ListItem selected={!selectedFilter} onClick={() => onSelect('')}>
            <AiOutlineCheck />
            {allFiltersLabel || 'Todos'}
          </ListItem>
        )}
        {filterOptions.map(option => (
          <ListItem
            key={option}
            selected={option === selectedFilter}
            onClick={() => onSelect(option)}
          >
            <AiOutlineCheck />
            {option}
          </ListItem>
        ))}
      </List>
      <ListMask ref={listMaskRef} onClick={handleListMaskClick} />
    </Container>
  );
};
