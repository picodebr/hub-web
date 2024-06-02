import styled, { createGlobalStyle } from 'styled-components';

export const App = styled.div`
  display: flex;
  align-items: start;
  min-height: 100%;

  & > :first-child {
    margin-right: 1.5rem;
  }

  @media (max-width: ${props => props.theme.mobile.maxWidth}px) {
    flex-direction: column;

    & > :first-child {
      margin-right: 0;
      margin-bottom: 1rem;
    }
  }
`;

export const GameButtonContainer = styled.div`
  align-self: center;
  display: grid;
  row-gap: 1.5rem;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  height: var(--game-button-container-height);
  max-width: var(--game-button-container-max-width);

  --game-button-container-height: calc(
    100vh - ${props => props.theme.desktop.headerHeight}px - 11rem
  );
  --game-button-container-max-width: min(
    calc(
      100vh - ${props => props.theme.desktop.headerHeight}px - 11rem - 1.5rem -
        4rem
    ),
    calc(100vw - 4rem)
  );

  @media (max-width: ${props => props.theme.mobile.maxWidth}px) {
    row-gap: 1rem;
    --game-button-container-height: calc(
      100vh - ${props => props.theme.mobile.headerHeight}px - 11rem
    );
    --game-button-container-max-width: min(
      calc(
        100vh - ${props => props.theme.mobile.headerHeight}px - 11rem - 1rem -
          4rem
      ),
      calc(100vw - 4rem)
    );
  }
`;

export const Button = styled.button`
  border: none;
  background-color: royalblue;
  color: white;
  padding: 1.25rem;
  font-size: 1.5rem;
  line-height: 100%;
  cursor: pointer;
  outline: none;
  user-select: none;
  box-shadow: 0 0 0.3rem rgba(0, 0, 0, 0.5);
  border-radius: 1rem;
  background-color: #007fff;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition: opacity 0.25s;

  &:hover {
    opacity: 0.8;
  }

  .restart {
    display: none;
  }

  &::after {
    content: 'Executar';
    margin-left: 0.5rem;
  }

  &.running,
  &.collision,
  &.fail {
    &::after {
      content: 'Resetar';
    }

    .restart {
      display: inline-block;
    }

    .play {
      display: none;
    }
  }

  &.finish {
    &::after {
      content: 'Concluído';
    }

    .play {
      display: none;
    }
  }
`;

export const AppGlobal = createGlobalStyle`
  .blockly-div {
    flex: 1;
    width: 100%;
    height: calc(100vh - ${props =>
      props.theme.desktop.headerHeight}px - 11rem);

    .blocklyFlyoutScrollbar {
      display: none;
    }

    @media (max-width: 1024px) {
      height: calc(100vh - ${props =>
        props.theme.mobile.headerHeight}px - 11rem);
    }
  }
`;
