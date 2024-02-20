import { darken, lighten } from 'polished';
import styled from 'styled-components';

export const Container = styled.div`
  --animation-duration: 0.25s;
  --content-scale: 0;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition-duration: var(--animation-duration);
  user-select: none;

  background-color: ${props => props.theme.colors.modalMask};

  &[data-show='true'] {
    --content-scale: 1;
    opacity: 1;
    pointer-events: all;
  }
`;

export const ContentWrapper = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%) scale(var(--content-scale));
  max-height: calc(100% - 5rem);
  border-radius: 1rem;
  box-shadow: 0px 3px 0.5rem rgba(59, 55, 53, 0.3);
  overflow: hidden;
  width: calc(100% - 1rem);
  max-width: 30rem;
  transition-duration: var(--animation-duration);
  margin-top: 2.5rem;

  display: flex;
  flex-direction: column;

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    margin-top: 1rem;
  }

  @media (max-width: ${props => props.theme.breakingPoints.smallMobile}px) {
    margin-top: 0.5rem;
    top: 50%;
  }
`;

export const Header = styled.div`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  padding: 0.5rem 0;
  color: ${props => props.theme.colors.primary};
`;

export const Icon = styled.div`
  position: absolute;
  top: 0.25rem;
  right: 0.5rem;
  cursor: pointer;
  font-size: 1.75rem;

  color: ${props => props.theme.colors.caution};
  &:hover {
    color: ${props => darken(0.1, props.theme.colors.caution)};
  }

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    font-size: 1.5rem;
  }

  @media (max-width: ${props => props.theme.breakingPoints.smallMobile}px) {
    font-size: 1.25rem;
  }
`;

export const Content = styled.div`
  height: 100%;
  overflow-y: auto;
  color: ${props => props.theme.colors.text};
`;

export const Footer = styled.div`
  padding: 0.75rem;

  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;

const ButtonBaseStyle = styled.button`
  width: 7rem;
  padding: 0.35rem 0;
  border-radius: 0.5rem;
  cursor: pointer;
  user-select: none;
  font-size: 1rem;

  display: flex;
  align-items: center;
  justify-content: center;

  &[data-disabled='true'] {
    background-color: ${props => props.theme.colors.disabledButton};
    pointer-events: none;
  }
`;

export const ConfirmButton = styled(ButtonBaseStyle)`
  border: 1px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.cardBackground};
  background-color: ${props => props.theme.colors.primary};

  &:hover {
    background-color: ${props => darken(0.1, props.theme.colors.primary)};
    border: 1px solid ${props => darken(0.1, props.theme.colors.primary)};
  }
`;

export const CancelButton = styled(ButtonBaseStyle)`
  border: 1px solid ${props => lighten(0.1, props.theme.colors.caution)};
  color: ${props => props.theme.colors.caution};
  background-color: ${props => props.theme.colors.cardBackground};

  &:hover {
    background-color: ${props => lighten(0.1, props.theme.colors.caution)};
    color: ${props => props.theme.colors.cardBackground};
  }
`;
