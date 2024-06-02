import styled, { createGlobalStyle } from 'styled-components';

import { motion } from 'framer-motion';

export const App = styled.div`
  display: flex;
  background-image: url('/patterns/circuit-board.svg');
  background-position: bottom;
  background-size: cover;
  border-radius: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const GameButtonContainer = styled.div`
  --game-button-container-max-width: 400px;
  margin: 1rem;
  gap: 1rem;
  display: flex;
  align-self: center;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: var(--game-button-container-max-width);

  @media (max-height: 765px) {
    --game-button-container-max-width: 250px !important;
  }
  @media (max-width: 1366px) {
    --game-button-container-max-width: 350px;
  }
  @media (max-width: 500px) {
    --game-button-container-max-width: 200px;
  }
`;

export const Button = styled(motion.button)`
  border: none;
  color: white;
  padding: 1rem 2rem 1rem 1.5rem;
  width: fit-content;
  font-size: 1.3rem;
  line-height: 100%;
  cursor: pointer;
  outline: none;
  user-select: none;
  box-shadow: 0 0 0.3rem rgba(0, 0, 0, 0.5);
  border-radius: 1rem;
  background-color: white;
  color: #1a1740;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition: opacity 0.25s;
  margin: auto;

  svg {
    color: #1a1740 !important;
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
    height: calc(100vh - 200px - 11rem);

    .blocklyFlyoutScrollbar {
      display: none;
    }

  }
`;
