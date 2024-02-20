import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.25rem 0;

  column-gap: 0.75rem;

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    column-gap: 0.35rem;
  }
`;
