import styled from 'styled-components';

export const BlocklyDiv = styled.div`
  z-index: 0;
  border-radius: 1rem;
  padding: 1rem 1rem 1rem 0;
  overflow: hidden;

  & > * {
    border-radius: 1rem;
  }

  overflow: hidden auto;
  * {
    user-select: none;
  }
`;
