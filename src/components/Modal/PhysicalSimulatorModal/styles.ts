import styled from 'styled-components';

export const Container = styled.div`
  --background-mask-color: initial;
  --content-translate-x: 100vw;
  --transition-duration: 500ms;

  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--modal-z-index);
  pointer-events: none;

  &[data-show='true'] {
    --background-mask-color: ${props => props.theme.colors.modalMask};
    --content-translate-x: 0;

    pointer-events: all;
  }
`;

export const BackgroundMask = styled.div`
  width: 100%;
  height: 100%;

  background-color: var(--background-mask-color);
  transition-duration: var(--transition-duration);
`;

export const Content = styled.div`
  width: calc(100% - 4rem);
  height: 100%;
  top: 0;
  right: 0;
  position: absolute;
  background-color: ${props => props.theme.colors.physicalSimulatorBackground};
  box-shadow: -0.25rem 0 1rem rgba(0, 0, 0, 0.35);

  transition-duration: var(--transition-duration);
  transform: translateX(var(--content-translate-x));

  @media (max-width: ${props => props.theme.breakingPoints.mobile}px) {
    width: calc(100% - 1rem);
  }
`;

export const IFrame = styled.iframe`
  height: 100%;
  width: 100%;
  border: none;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 0;
  left: 1.5rem;

  height: 2.5rem;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1em;
  border: none;
  background-color: transparent;
  transition-duration: 0.25s;
  color: ${props => props.theme.colors.physicalSimulatorCloseButton};
  z-index: 2;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CloseIcon = styled.span`
  font-size: 1.5rem;
  line-height: 1em;
  margin-right: 0.5rem;

  display: flex;
  align-items: center;
  justify-content: center;
`;
