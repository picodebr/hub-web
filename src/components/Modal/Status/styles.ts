import styled from 'styled-components';

export const Container = styled.div`
  position: fixed;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;

  display: flex;
  background-color: ${(props) => props.theme.colors.modalMask};

  &[data-show='false'] {
    display: none;
  }
`;

export const Content = styled.div`
  margin: auto;
  padding: 2rem;
`;

export const MessageContainer = styled.div`
  display: flex;
`;

interface IMessageImage {
  source: string;
}

export const MessageText = styled.div`
  color: ${(props) => props.theme.colors.text};
  font-size: 1.375rem;
  font-weight: 500;
`;

export const MessageImage = styled.div<IMessageImage>`
  --size: 1.875rem;

  width: var(--size);
  height: var(--size);
  margin-right: 1rem;

  &[data-rotate='true'] {
    animation: rotateImage 1.25s linear infinite;
  }

  background-image: url(${(props) => props.source});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;

  @keyframes rotateImage {
    100% {
      transform: rotateZ(360deg);
    }
  }
`;
