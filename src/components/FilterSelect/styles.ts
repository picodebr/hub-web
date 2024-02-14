import styled from 'styled-components';

interface IContainerProps {
  openLeftIndexOnMobile?: number;
}

export const Container = styled.div<IContainerProps>`
  --button-icon-rotation: 0deg;
  --animation-duration: 0.35s;
  --list-mask-display: none;
  --list-opacity: 0;
  --list-translate-y: -1rem;
  --list-pointer-events: none;
  --list-position-left: 0;
  --list-position-right: initial;

  position: relative;

  &[data-show-list='true'] {
    --button-icon-rotation: 180deg;
    --list-mask-display: block;
    --list-opacity: 1;
    --list-translate-y: 0;
    --list-pointer-events: all;
  }

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    &:nth-child(n + ${props => props.openLeftIndexOnMobile || 4}) {
      --list-position-left: initial;
      --list-position-right: 0;
    }
  }
`;

export const Button = styled.button`
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1.6rem;
  padding: 0.4rem 1rem 0.4rem 1rem;
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.lightBorder};
  border-radius: 0.375rem;
  user-select: none;

  display: flex;
  align-items: center;
  column-gap: 0.5rem;

  & > :last-child {
    color: ${props => props.theme.colors.primary};
  }

  @media (max-width: ${props => props.theme.breakingPoints.smallDesktop}px) {
    padding: 0.4rem 0.5rem 0.4rem 0.5rem;
    column-gap: 0.25rem;
  }

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    padding: 0.4rem 0.35rem 0.4rem 0.35rem;
    column-gap: 0.1rem;
  }
`;

export const ButtonIconContainer = styled.span`
  font-size: 1.2rem;
  transform: rotateZ(var(--button-icon-rotation));
  transition-duration: var(--animation-duration);

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const List = styled.ul`
  position: absolute;
  top: 3rem;
  right: var(--list-position-right);
  left: var(--list-position-left);
  user-select: none;
  overflow: hidden;
  z-index: 1000;
  opacity: var(--list-opacity);
  transform: translateY(var(--list-translate-y));
  transition: var(--animation-duration);
  pointer-events: var(--list-pointer-events);

  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.25);
`;

export const ListMask = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;

  display: var(--list-mask-display);
`;

export const ListHeader = styled.header`
  padding: 0.75rem 1rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

interface IListItemProps {
  selected: boolean;
}

export const ListItem = styled.li<IListItemProps>`
  list-style: none;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  min-width: 10rem;
  cursor: pointer;
  font-weight: ${props => (props.selected ? 500 : 'normal')};
  color: ${props =>
    props.selected ? props.theme.colors.primary : props.theme.colors.text};

  display: flex;
  align-items: center;
  column-gap: 0.5rem;

  & > :first-child {
    opacity: ${props => (props.selected ? 1 : 0)};
  }

  &:last-child {
    padding-bottom: 0.75rem;
  }

  &:hover {
    background-color: ${props => props.theme.colors.listItemHover};
  }

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    min-width: 9rem;
  }
`;
