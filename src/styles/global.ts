import { extendTheme } from '@chakra-ui/react';

export const globalTheme = extendTheme({
  fonts: {
    body: `Source Sans Pro`,
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
    primary: '#2a075d',
    primaryLight: '#6D23F8',
    secondary: '#81BE73',
    secondaryLight: '#81BE73',
    text: {
      black: '#3f3f3f',
      gray: '#7f7f7f',
      light: '#cfcfcf',
      white: '#ffffff',
    },
    bg: {
      grayDark: '#e0e0e0',
      gray: '#f1f1f1',
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
    statuses: {
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
