import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Card, CardContent, Container, Link as MuiLink, Typography } from '@mui/material';
import { LockResetOutlined } from '@mui/icons-material';

export default function PasswordRecoveryLayout({ title, description, children }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | SEKKIN.LK`;
    let robots = document.querySelector('meta[name="robots"]');
    const previousRobots = robots?.getAttribute('content');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow';
    return () => {
      document.title = previousTitle;
      if (previousRobots === undefined) robots.remove();
      else if (previousRobots === null) robots.removeAttribute('content');
      else robots.content = previousRobots;
    };
  }, [title]);

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', py: { xs: 4, sm: 7 }, background: 'linear-gradient(135deg, #FDF0F4 0%, #F5E6EA 100%)' }}>
      <Container maxWidth="sm">
        <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ height: 6, background: 'linear-gradient(90deg, #B5385C, #C9956A)' }} />
          <CardContent sx={{ p: { xs: 3, sm: 5 }, '&:last-child': { pb: { xs: 3, sm: 5 } } }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <MuiLink component={Link} to="/login" aria-label="SEKKIN.LK login" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box component="img" src="/logo.png" alt="" sx={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #C9956A', bgcolor: '#000' }} />
                <Typography color="primary.main" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>Sekkin<span style={{ color: '#A0714A' }}>.lk</span></Typography>
              </MuiLink>
            </Box>
            <Box sx={{ width: 48, height: 48, display: 'grid', placeItems: 'center', borderRadius: 3, bgcolor: '#F9EDF1', color: 'primary.main', mx: 'auto', mb: 2 }}>
              <LockResetOutlined aria-hidden="true" />
            </Box>
            <Typography component="h1" sx={{ fontSize: { xs: '1.65rem', sm: '1.875rem' }, fontWeight: 700, textAlign: 'center', lineHeight: 1.3, mb: 1 }}>{title}</Typography>
            <Typography sx={{ fontSize: '1rem', lineHeight: 1.75, color: 'text.secondary', textAlign: 'center', mb: 3 }}>{description}</Typography>
            {children}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
