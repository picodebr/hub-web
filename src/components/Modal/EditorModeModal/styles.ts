import styled from 'styled-components';

export const Header = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  color: ${props => props.theme.colors.caution};
  text-align: center;
  padding: 0.5rem 1rem;
`;

export const Text = styled.p`
  padding: 0.5rem 1rem;
`;

export const TextHightlight = styled.strong`
  font-weight: 600;
  color: ${props => props.theme.colors.textHighlight};
`;
