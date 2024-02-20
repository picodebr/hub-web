import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    overflow: hidden;

    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
`;

export const ModalWrapper = styled.div`
  position: fixed;
  z-index: var(--modal-z-index);
  background-color: ${props => props.theme.colors.modalMask};
  user-select: none;

  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;

  &[data-show='false'] {
    display: none;
  }
`;

export const Modal = styled.div`
  margin: auto;
  width: 100%;
  max-width: min(calc(100% - 1rem), 36rem);
  max-height: calc(100% - 1rem);
  background-color: ${props => props.theme.colors.cardBackground};
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.15);
  border-radius: 1rem;
  overflow: hidden;
`;

export const Header = styled.div`
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme.colors.primaryLight};
  color: ${props => props.theme.colors.buttonSecondary};
  font-weight: 500;
  font-size: 1.125rem;

  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }
`;

export const Content = styled.div`
  max-height: calc(100vh - 9rem);
  overflow-y: auto;

  @media (max-width: ${props => props.theme.breakingPoints.smallMobile}px) {
    max-height: calc(100vh - 10rem);
  }
`;

export const BlocklyArea = styled.div`
  height: 8rem;
  width: 100%;
  background-color: ${props => props.theme.colors.pageBackground};

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    height: 7rem;
  }
`;

export const ButtonsContainer = styled.div`
  padding: 2rem 1rem 0;

  display: flex;
  align-items: center;
  justify-content: space-evenly;

  & > :nth-child(n + 2) {
    margin: 0 0 0 1rem;
  }

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    padding: 0.75rem 0.5rem 0;
  }

  @media (max-width: ${props => props.theme.breakingPoints.smallMobile}px) {
    padding: 1.5rem 0.5rem 0;

    flex-direction: column;

    & > :nth-child(n + 2) {
      margin: 0.5rem 0 0;
    }
  }
`;

export const Button = styled.div`
  width: 100%;
  max-width: 10rem;
  height: 7rem;
  padding: 0.5rem 0.25rem;
  border-radius: 0.5rem;
  border: 2px solid ${props => props.theme.colors.lightBorder};
  transition: border-color 0.25s;
  cursor: pointer;

  display: flex;
  flex-direction: column;

  &:hover {
    border-color: ${props => props.theme.colors.primaryLight};
  }

  @media (max-width: ${props => props.theme.breakingPoints.smallMobile}px) {
    max-width: initial;
    height: 6rem;
  }
`;

interface IButtonImage {
  src: string;
}

export const ButtonImage = styled.div<IButtonImage>`
  height: 3rem;

  background-image: url(${props => props.src});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
`;

export const ButtonText = styled.div`
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  line-height: 1.25em;
`;

export const Footer = styled.div`
  padding: 0.5rem 1rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  & > :last-child {
    margin-left: 1rem;
  }
`;

export const FooterButton = styled.div`
  padding: 0.25rem 1rem;
  width: 7rem;
  background-color: ${props => props.theme.colors.cancelButton};
  color: ${props => props.theme.colors.buttonSecondary};
  border-radius: 0.375rem;
  cursor: pointer;
  transition-duration: 0.25s;

  display: flex;
  align-items: center;
  justify-content: center;

  &[data-confirm='true'] {
    background-color: ${props => props.theme.colors.primaryLight};
  }

  &:hover {
    opacity: 0.9;
  }
`;

export const ErrorContainer = styled.div`
  padding: 0.25rem 1.5rem;
  font-size: 0.875rem;
  line-height: 1rem;
  color: ${props => props.theme.colors.caution};

  & > :first-child {
    margin-right: 0.25rem;
    font-size: 1rem;
    position: relative;
    top: 0.125rem;
  }

  &[data-show='false'] {
    opacity: 0;
  }
`;
