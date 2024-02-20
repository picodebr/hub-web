import styled from 'styled-components';

export const Button = styled.button`
  cursor: pointer;
  grid-area: new;
  justify-self: flex-end;
  font-size: 0.875rem;
  line-height: 1.6rem;
  padding: 0.4rem 1rem 0.4rem 1rem;
  color: ${props => props.theme.colors.cardBackground};
  background-color: ${props => props.theme.colors.primary};
  margin-left: 0.5rem;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 0.375rem;
  user-select: none;
  transition-duration: 0.35s;

  display: flex;
  align-items: center;
  column-gap: 0.5rem;

  &:hover {
    opacity: 0.8;
  }

  & > :last-child {
    color: ${props => props.theme.colors.cardBackground};
  }

  @media (max-width: ${props => props.theme.breakingPoints.smallDesktop}px) {
    padding: 0.4rem 0.5rem 0.4rem 0.5rem;
  }

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    margin-left: 0;
  }
`;
