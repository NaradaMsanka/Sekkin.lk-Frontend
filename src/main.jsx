import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import App from './App.jsx'
import './index.css'

// SekkinLK Cosmetics — Elegant Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8F344D',       // Muted rose
      light: '#B7657A',
      dark: '#6D2338',
      contrastText: '#fff',
    },
    secondary: {
      main: '#B98B60',       // Warm Gold
      light: '#DEB896',
      dark: '#A0714A',
      contrastText: '#fff',
    },
    background: {
      default: '#FCF8F5',    // Warm ivory
      paper: '#FFFFFF',
    },
    text: {
      primary: '#302326',
      secondary: '#796B65',
    },
    success: { main: '#4F6958' },
    error:   { main: '#E53935' },
    warning: { main: '#FF9800' },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 22px',
          minHeight: 42,
          boxShadow: 'none',
          transition: 'background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 3px 16px rgba(48,35,38,0.035)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { fontSize: '0.85rem', backgroundColor: '#FFFFFF', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DCCFC6' } },
      },
    },
    MuiInputLabel: {
      // Match the outlined input font so the floating label fits its notch.
      styleOverrides: { root: { fontSize: '0.85rem' } },
    },
    MuiIconButton: {
      styleOverrides: { root: { minWidth: 40, minHeight: 40 } },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
