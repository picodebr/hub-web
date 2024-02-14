import styled from 'styled-components';

export const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  background-color: ${props => props.theme.colors.modalMask};

  display: flex;
`;

const Container = styled.div`
  width: 25rem;
  max-width: calc(50vw - 1rem);
  padding: 2rem 1rem;

  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 1rem;
  box-shadow: ${props => props.theme.boxShadow.defaultShadow};
  margin: auto;
  color: ${props => props.theme.colors.text};
  user-select: none;

  animation: ShowAnimation 1s;

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    max-width: calc(100vw - 1rem);
    padding: 1.5rem 0.75rem;
  }

  @keyframes ShowAnimation {
    0% {
      transform: translateX(-2rem);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export const CodeContainer = styled(Container)`
  & > *:nth-child(2) {
    margin-top: 2rem;
  }
`;

interface ILogo {
  src: string;
}

export const Logo = styled.div<ILogo>`
  height: 5rem;

  background-image: url(${props => props.src});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
`;

export const NoCodeButton = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  width: fit-content;
  margin-left: auto;

  &[data-hide='true'] {
    display: none;
  }
`;

export const EmailContainer = styled(Container)`
  & > *:nth-child(2) {
    margin-top: 2rem;
  }
`;

export const EmailTitle = styled.div`
  text-align: center;
  font-size: 1.375rem;
  font-weight: 500;
`;

export const EmailButton = styled.div`
  margin-top: 0.5rem;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.buttonSecondary};
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition-duration: 0.25s;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    filter: brightness(1.1);
  }
`;
