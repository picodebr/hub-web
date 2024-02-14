import styled from 'styled-components';

interface IContainerProps {
  cardWidth?: string;
}

export const Container = styled.div<IContainerProps>`
  --card-width: ${(props) => props.cardWidth || '20rem'};

  height: 100%;
  max-height: 1200px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  row-gap: 0.5rem;

  @media (max-width: ${(props) => props.theme.breakingPoints.mobile}px) {
    height: calc(100vh - ${(props) => props.theme.dimensions.mobileHeader}px);
    padding: 0;
  }
`;

export const TopContainer = styled.div`
  margin: 0 auto;

  display: grid;
  grid-template-columns: minmax(auto, 600px) auto auto;
  grid-template-rows: auto auto;
  grid-template-areas:
    'search filters new'
    'filter-message filter-message filter-message';
  column-gap: 1rem;
  row-gap: 0.5rem;

  @media (max-width: ${(props) => props.theme.breakingPoints.smallDesktop}px) {
    column-gap: 0.5rem;
  }

  @media (max-width: ${(props) => props.theme.breakingPoints.mobile}px) {
    width: 100%;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      'search new'
      'filters filters'
      'filter-message filter-message';
    row-gap: 0.75rem;
    padding: 1rem 0.5rem 0;
  }
`;

export const FiltersContainer = styled.div`
  grid-area: filters;
  display: flex;
  align-items: center;
  column-gap: 1rem;

  @media (max-width: ${(props) => props.theme.breakingPoints.smallDesktop}px) {
    column-gap: 0.5rem;
  }
`;

export const FilterMessage = styled.p`
  grid-area: filter-message;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.textHighlight};
  user-select: none;
`;

export const FilterMessageStart = styled.span``;

export const FilterMessageFilter = styled.span`
  font-weight: 500;
`;

export const Content = styled.div`
  height: 100%;
  width: 100%;
  padding: 0.5rem;
  overflow-y: auto;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-width), 1fr));
  grid-auto-rows: max-content;
  justify-content: center;
  row-gap: 2rem;
  column-gap: 1rem;

  @media (min-width: ${(props) => props.theme.breakingPoints.extraLargeDesktop + 1}px) {
    row-gap: 4rem;
    column-gap: 3rem;
  }

  @media (max-width: ${(props) => props.theme.breakingPoints.mobile}px) {
    display: block;
    padding: 0.5rem 0.5rem 1.5rem;
    & > * {
      margin: 1rem auto 0;
    }

    & > :first-child {
      margin-top: 0;
    }
  }
`;

export const MessageContainer = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 1rem;
`;

export const MessageIconContainer = styled.div`
  font-size: 8rem;
  color: ${(props) => props.theme.colors.primary};

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Message = styled.div`
  padding: 1rem;
  color: ${(props) => props.theme.colors.text};
  font-size: 1.6rem;
  font-weight: 500;
  user-select: none;
  text-align: center;

  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${(props) => props.theme.breakingPoints.mobile}px) {
    font-size: 1.25rem;
  }
`;
