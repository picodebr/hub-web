import { extendTheme } from '@chakra-ui/react';
import 'rsuite/dist/rsuite-no-reset.min.css';
import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { dark, light } from './colors';

type SemanticTokenColors = Record<string, { default: string; _dark: string }>;
type SemanticTokenType = { colors: SemanticTokenColors };

const semanticTokens: SemanticTokenType = {
  colors: Object.keys(light).reduce((acc, keyColor) => {
    acc[keyColor] = { default: (light as any)[keyColor], _dark: (dark as any)[keyColor] };
    return acc;
  }, {} as SemanticTokenColors),
};

export const globalTheme = extendTheme((props) => {
  return {
    ...props,
    fonts: {
      body: `'Inter' - sans-serif`,
    },
    styles: {
      global: (props: any) => ({
        'html, body': {
          height: '100%',
          width: '100%',
        },
        body: {
          background: '#fff',
          fontSize: '15px',
          color: '#3f3f3f',
          opacity: props.disabled ? '0.3' : '1',
          '@media (max-width: 800px)': {
            '*': { fontSize: '99% !important' },
          },
          '@media (max-width: 700px)': {
            '*': { fontSize: '98% !important' },
          },
          '@media (max-width: 600px)': {
            '*': { fontSize: '97% !important' },
          },
        },
        'a:hover': {
          textDecoration: 'none!important',
        },
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#EAECF0',
          borderRadius: '24px',
        },
      }),
    },
    focus: {
      outline: 'none',
    },
    breakpoints: {
      base: '0px',
      sm: '320px',
      md: '768px',
      lg: '960px',
      xl: '1200px',
      '2xl': '1536px',
    },
    semanticTokens,
  };
});

export const dimensions = {
  header: {
    height: '66px',
  },
  navbar: {
    width: '24rem',
  },
};
