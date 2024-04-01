import { createTheme, Theme } from '@mui/material/styles';

/**
 * A blog lives or dies on its type. Two families — a serif for anything the
 * reader reads at length, a sans for the interface around it — and a scale
 * whose steps are far enough apart to read as a hierarchy.
 */
const SERIF = '"Source Serif 4", Georgia, "Times New Roman", serif';
const SANS = '"Source Sans 3", -apple-system, "Segoe UI", Roboto, sans-serif';

/** Characters per line in the reading column. Anything past ~75 is tiring. */
export const READING_MEASURE = '68ch';

export const ink = {
  page: '#f7f5f1',
  surface: '#ffffff',
  primary: '#1b1b1f',
  secondary: '#5b5b66',
  rule: '#e2ded6',
  accent: '#8a3324',
};

export const theme: Theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: ink.page, paper: ink.surface },
    primary: { main: ink.accent },
    text: { primary: ink.primary, secondary: ink.secondary },
    divider: ink.rule,
  },
  typography: {
    fontFamily: SANS,
    h1: {
      fontFamily: SERIF,
      fontSize: '2.75rem',
      lineHeight: 1.15,
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h2: {
      fontFamily: SERIF,
      fontSize: '1.75rem',
      lineHeight: 1.25,
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: { fontFamily: SERIF, fontSize: '1.375rem', lineHeight: 1.3, fontWeight: 600 },
    subtitle1: { fontSize: '0.9375rem', lineHeight: 1.5 },
    body1: { fontFamily: SERIF, fontSize: '1.125rem', lineHeight: 1.7 },
    body2: { fontSize: '0.9375rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    overline: { fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTextField: { defaultProps: { size: 'medium' } },
  },
});
