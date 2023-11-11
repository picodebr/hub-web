import { extendTheme } from '@chakra-ui/react';
const breakpoints = {
  base: '0px',
  sm: '320px',
  md: '768px',
  lg: '960px',
  xl: '1200px',
  '2xl': '1536px',
};

export const globalTheme = extendTheme({
  breakpoints,
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
        background: '#FFFFFF',
        fontSize: '16px',
        color: '#3f3f3f',
        opacity: props.disabled ? '0.3' : '1',
      },
      'a:hover': {
        textDecoration: 'none!important',
      },
    }),
  },
  colors: {
    primary: '#94B8FF',
    primaryLight: '#E4E9F5',
    secondary: '#6699FF',
    secondaryLight: '#81BE73',
    text: {
      primary: '#85ADFF',
      black: '#101828',
      gray: '#6f6f6f',
      lightGray: '#D0D4DD',
      light: '#10182899',
      white: '#ffffff',
      gray700: '#344054',
    },
    bg: {
      primary: '#6699FF1A',
      grayDark: '#e0e0e0',
      gray: '#F9FAFB',
      white: '#ffffff',
      offWhite: '#fafafa',
    },
    border: {
      light: '#d3d3d3',
      medium: '#c3c3c3',
    },
    notification: {
      unread: '#f18459',
    },
    status: {
      error: '#ca3939',
    },
  },
  focus: {
    outline: 'none',
  },
});

export const dimensions = {
  header: {
    height: '62px',
  },
  navbar: {
    width: '175px',
  },
};
