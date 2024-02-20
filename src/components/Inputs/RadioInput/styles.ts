import styled from 'styled-components';

export const Container = styled.div`
  user-select: none;
  position: relative;

  transition: color 0.5s;
`;

interface IHorizontalProps {
  isHorizontal?: boolean;
}

export const OptionsWrapper = styled.div<IHorizontalProps>`
  display: flex;
  align-items: ${(props) => (props.isHorizontal ? 'center' : 'flex-start')};
  flex-direction: ${(props) => (props.isHorizontal ? 'row' : 'column')};
  white-space: nowrap;

  & > * {
    display: inline-block;
  }

  & > :nth-child(n + 2) {
    margin: ${(props) => (props.isHorizontal ? '0 0 0 1.25rem' : '0')};
  }
`;

export const Name = styled.h2`
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};
  font-size: 1rem;
`;

export const Input = styled.input`
  margin-right: 0.35rem;
  max-width: 3rem;
  color: ${(props) => props.theme.colors.text};
`;

export const Label = styled.label<IHorizontalProps>`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
`;

export const Error = styled.div<IHorizontalProps>`
  color: ${(props) => props.theme.colors.caution};
  display: flex;
  align-items: center;
  font-size: 14px;
  bottom: 0;

  #icon {
    margin-right: 0.25rem;
  }
`;
