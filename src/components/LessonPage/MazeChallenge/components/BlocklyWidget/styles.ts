import styled from 'styled-components';

export const BlocklyDiv = styled.div`
  z-index: 0;
  & > * {
    border-radius: 1rem;
    border: 1px solid #ccc;
  }

  * {
    user-select: none;
  }
`;
