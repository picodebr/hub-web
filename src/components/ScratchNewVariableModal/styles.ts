import styled from 'styled-components';

export const ModalWrapper = styled.div`
  position: fixed;
  z-index: var(--modal-z-index);
  background-color: ${(props) => props.theme.colors.modalMask};
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
  max-width: min(calc(100% - 1rem), 28rem);
  max-height: calc(100% - 1rem);
  background-color: ${(props) => props.theme.colors.cardBackground};
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.15);
  border-radius: 1rem;
  overflow: hidden;
`;

export const Header = styled.div`
  padding: 0.75rem 1rem;
  background-color: ${(props) => props.theme.colors.primaryLight};
  color: ${(props) => props.theme.colors.buttonSecondary};
  font-weight: 500;
  font-size: 1.125rem;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Content = styled.div`
  padding: 2.5rem 1rem 1rem;

  @media (max-width: ${(props) => props.theme.breakingPoints.mobile}px) {
    padding: 2.5rem 0.5rem 1rem;
  }
`;

export const NameInput = styled.input`
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid ${(props) => props.theme.colors.inputBorder};
  border-radius: 0.25rem;
`;

export const NameError = styled.div`
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.caution};
  margin-top: 0.375rem;
  line-height: 1.25em;
  height: 1.25em;
`;

export const Footer = styled.div`
  padding: 0 1rem 1rem;
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
  background-color: ${(props) => props.theme.colors.cancelButton};
  color: ${(props) => props.theme.colors.buttonSecondary};
  border-radius: 0.375rem;
  cursor: pointer;
  transition-duration: 0.25s;

  display: flex;
  align-items: center;
  justify-content: center;

  &[data-confirm='true'] {
    background-color: ${(props) => props.theme.colors.primaryLight};
  }

  &:hover {
    opacity: 0.9;
  }
`;
