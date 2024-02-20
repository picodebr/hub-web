import styled from 'styled-components';

export const Input = styled.input.attrs({ type: 'text' })`
  width: 100%;
  border: none;
  border-radius: 0.5rem;

  padding: 0.75rem 0.5rem 0.5rem;
  text-align: center;
  border: 2px solid ${(props) => props.theme.colors.inputBorder};

  &:focus {
    border: 2px solid ${(props) => props.theme.colors.primary};
  }
`;

export const Label = styled.span`
  font-size: 0.875rem;

  background-color: ${(props) => props.theme.colors.cardBackground};

  position: relative;
  top: 0.75rem;
  left: 0.75rem;

  padding: 0 0.25rem;
`;

interface IContainerProps {
  inputFocused: boolean;
}

export const Container = styled.div<IContainerProps>`
  position: relative;
  user-select: none;

  ${Label} {
    color: ${(props) => (props.inputFocused ? props.theme.colors.primary : props.theme.colors.inputBorder)};
  }

  ${Input} {
    border: 2px solid ${(props) => (props.inputFocused ? props.theme.colors.primary : props.theme.colors.inputBorder)};
  }
`;

export const Error = styled.div`
  height: 1.5rem;
  width: 100%;
  margin-top: 0.125rem;

  display: flex;
  align-items: flex-start;
  z-index: 2;

  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.caution};

  svg {
    font-size: 1rem;
    margin-right: 0.25rem;
    margin-top: 0.05rem;
  }

  &[data-show='false'] {
    opacity: 0;
  }
`;
