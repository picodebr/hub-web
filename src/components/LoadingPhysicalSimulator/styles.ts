import styled from 'styled-components';

export const Container = styled.div`
  --progress-animation-duration: 0.5s;

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  background-color: ${(props) => props.theme.colors.pageBackground};
  transition-duration: 0.35s;
  transition-delay: var(--progress-animation-duration);
  user-select: none;

  display: flex;

  &[data-show='false'] {
    opacity: 0;
    pointer-events: none;
    transition-duration: 0;
    transition-delay: 0;
  }
`;

export const Content = styled.div`
  margin: auto;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

interface IIMageContainer {
  src: string;
}

export const ImageContainer = styled.div<IIMageContainer>`
  background-image: url(${(props) => props.src});
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;

  height: 19rem;
  width: 100%;
`;

export const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 0.5rem;
  max-width: 36rem;
`;

export const ProgressBarContainer = styled.div`
  --progress-bar-height: 1.5rem;
  --progress-container-primary: ${(props) => props.theme.colors.physicalSimulatorProgressContainerPrimary};
  --progress-container-secondary: ${(props) => props.theme.colors.physicalSimulatorProgressContainerSecondary};

  width: 100%;
  height: var(--progress-bar-height);
  border: 1px solid ${(props) => props.theme.colors.physicalSimulatorProgressContainerBorder};
  border-radius: var(--progress-bar-height);
  overflow: hidden;
  margin-left: 4ch;
  position: relative;

  background-image: linear-gradient(
    to bottom,
    var(--progress-container-primary),
    var(--progress-container-secondary),
    var(--progress-container-secondary),
    var(--progress-container-primary)
  );

  @media (max-width: ${(props) => props.theme.breakingPoints.mobile}px) {
    margin-left: initial;
  }
`;

interface IProgressBar {
  progress: number;
}

export const ProgressBar = styled.div<IProgressBar>`
  --progress-bar-primary: ${(props) => props.theme.colors.primary};
  --progress-bar-secondary: ${(props) => props.theme.colors.physicalSimulatorProgressBarSecondary};

  height: 100%;
  width: ${(props) => props.progress}%;
  transition-duration: var(--progress-animation-duration);
  border-radius: var(--progress-bar-height);

  background-image: linear-gradient(
    to bottom,
    var(--progress-bar-primary),
    var(--progress-bar-secondary),
    var(--progress-bar-secondary),
    var(--progress-bar-primary)
  );

  position: absolute;
  top: 0;
  left: 0;
`;

export const ProgressNumber = styled.div`
  width: 5ch;
  font-size: 1rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;
