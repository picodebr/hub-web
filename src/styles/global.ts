import { extendTheme } from '@chakra-ui/react';
//@ts-ignore
import 'rsuite/dist/rsuite-no-reset.min.css';
//@ts-ignore
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
          '.only-mobile': {
            '@media (min-width: 1019px)': { display: `none` },
          },
          '.only-desktop': {
            '@media (max-width: 1020px)': { display: `none` },
          },
        },
        body: {
          background: '#fff',
          fontSize: '15px',
          color: '#3f3f3f',
          opacity: props.disabled ? '0.3' : '1',
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
        '.hub-editor-wrapper': {
          overflow: `hidden`,
          // 'max-height': `calc(100vh - 18rem)`,
          // 'padding-top': `2.5rem`,
        },
        '.DraftEditor-editorContainer': {
          'max-height': `calc(100vh - 24rem)`,
          overflow: `hidden auto !important`,
        },
      }),
    },
    focus: {
      outline: 'none',
    },
    breakpoints: {
      base: '0px',
      xs: '485px',
      sm: '618px',
      md: '768px',
      lg: '1120px',
      xl: '1367px',
      '2xl': '1536px',
    },
    semanticTokens,
  };
});

/**
 * SPACING SYSTEM - Base 8px
 * Mantém consistência entre todos os componentes
 */
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

/**
 * BORDER RADIUS - Suave e Orgânico
 * Substitui cantos pequenos por values maiores
 */
export const borderRadius = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  'full': '9999px', // Circular
};

/**
 * BOX SHADOW - Elevação e Profundidade
 * Substitui bordas sólidas por sombras elegantes
 */
export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  elevation: '0 8px 16px rgba(0, 0, 0, 0.08)',
  soft: '0 2px 8px rgba(0, 0, 0, 0.04)',
};

/**
 * DIMENSÕES - Layout Principal
 * Centralização e estrutura de grid
 */
export const dimensions = {
  // Header/Navbar
  header: {
    height: '66px',
    padding: spacing.md,
  },
  navbar: {
    width: '16rem',     // 256px
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  // Container Principal
  container: {
    maxWidth: '1440px', // Largura máxima recomendada
    paddingHorizontal: spacing.lg,
    margin: '0 auto',
  },
  // Espaçamento Padrão entre Navbar e Conteúdo
  contentGap: spacing.md,
};
