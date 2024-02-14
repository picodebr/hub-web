import styled from 'styled-components';

export const Container = styled.div`
  height: 100%;

  @media (max-width: ${(props) => props.theme.breakingPoints.mobile}px) {
    height: 100%;
  }

  & * {
    font-family: monospace;
  }

  .monaco-editor {
    /* padding-top: 1rem; */
  }
`;
