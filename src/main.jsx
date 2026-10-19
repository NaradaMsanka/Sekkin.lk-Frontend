import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import '@fontsource/poppins/300.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import App from './App.jsx'

// SekkinLK Cosmetics — Elegant Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#B5385C',       // Deep Rose
      light: '#D4617F',
      dark: '#8C1F3F',
      contrastText: '#fff',
    },
    secondary: {
      main: '#C9956A',       // Warm Gold
      light: '#DEB896',
      dark: '#A0714A',
      contrastText: '#fff',
    },
    background: {
      default: '#FDF6F0',    // Soft Cream
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D1B1B',
      secondary: '#7A5C5C',
    },
    success: { main: '#4CAF50' },
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
          borderRadius: 30,
          padding: '10px 28px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 15px rgba(181,56,92,0.3)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(181,56,92,0.15)',
          },
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
