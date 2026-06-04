// src/cms/CmsApp.jsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import CmsLayout from './components/layout/CmsLayout';
import CmsRoutes from './routes';
import { cmsTheme } from './theme/cmsTheme';
import './styles/cms-tailwind.css';

const CmsApp = () => {
  return (
    <ThemeProvider theme={cmsTheme}>
      <CssBaseline />
      <CmsLayout>
        <CmsRoutes /> {/* Renders inside <main> */}
      </CmsLayout>
    </ThemeProvider>
  );
};

export default CmsApp;