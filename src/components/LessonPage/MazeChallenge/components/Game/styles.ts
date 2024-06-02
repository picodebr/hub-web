import styled from 'styled-components';

export const Game = styled.div`
  overflow-x: auto;
  background-color: #f0f0ff;
  position: relative;
  border-radius: 1rem;
  box-shadow: 0 0 0.1rem rgba(0, 0, 0, 1);
  --animation-duration: 250ms;
`;

export const RemainingBlocksContainer = styled.div`
  position: absolute;
  bottom: 0;
  font-size: 1.2rem;
  line-height: 100%;
  color: #ffffff;
  background-color: #1a1740;
  text-shadow: 0 0 0.1rem rgba(0, 0, 0, 0.3);
  padding: 0.4rem 0.7rem;
  border-top-right-radius: 0.7rem;
`;
