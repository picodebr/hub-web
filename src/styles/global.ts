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
    primary25: '#FCFAFF',
    primary50: '#F9F5FF',
    primary100: '#E0EEFF',
    primary200: '#C1DCFF',
    primary300: '#A3C8FF',
    primary400: '#8CB6FF',
    primary500: '#6699FF',
    primary600: '#4A75DB',
    primary700: '#3356B7',
    primary800: '#203B93',
    primary900: '#13277A',
    error25: '#FFFBFA',
    error50: '#FEF3F2',
    error100: '#FEE4E2',
    error200: '#FECDCA',
    error300: '#FDA29B',
    error400: '#F97066',
    error500: '#F04438',
    error600: '#D92D20',
    error700: '#B42318',
    error800: '#912018',
    error900: '#7A271A',
    secondary: '#6699FF',
    secondaryLight: '#81BE73',
    gray25: '#FCFCFD',
    gray50: '#F9FAFB',
    gray100: '#F2F4F7',
    gray200: '#EAECF0',
    gray300: '#D0D5DD',
    gray400: '#98A2B3',
    gray500: '#667085',
    gray600: '#475467',
    gray700: '#344054',
    gray800: '#1D2939',
    gray900: '#101828',
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
