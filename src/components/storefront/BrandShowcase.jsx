import { Box, Typography } from '@mui/material';
import Reveal from './Reveal';

export default function BrandShowcase() {
  return (
    <Reveal className="brand-showcase" delay={120} aria-label="SEKKIN.LK beauty collection" sx={{
      height: { xs: 280, sm: 350, md: 415 }, borderRadius: '180px 180px 24px 24px',
      position: 'relative', overflow: 'hidden', display: 'grid', placeItems: 'center', border: '1px solid #E8D7CC',
      background: 'radial-gradient(ellipse at 45% 30%, #FAF1E8 0%, #EFE2DB 68%)',
    }}>
      <Box className="brand-showcase__ring" aria-hidden="true" sx={{ position: 'absolute', width: '80%', aspectRatio: '1', border: '1px solid #C4A58C', borderRadius: '50%', opacity: 0.45, transform: 'translate(36%, -15%)' }} />
      <Box className="brand-showcase__ring brand-showcase__ring--outer" aria-hidden="true" sx={{ position: 'absolute', width: '95%', aspectRatio: '1', border: '1px solid #C4A58C', borderRadius: '50%', opacity: 0.4, transform: 'translate(38%, -12%)' }} />
      <Box className="brand-showcase__float" sx={{ width: { xs: 145, sm: 175, md: 205 }, position: 'relative', top: { xs: -26, sm: -14, md: 0 } }}>
        <Box className="brand-showcase__mark" sx={{ borderRadius: '100px 100px 12px 12px', overflow: 'hidden', position: 'relative', bgcolor: '#0A0A0A', boxShadow: '14px 24px 40px #664D3E24' }}>
          <Box component="img" src="/logo.png" alt="Sekkin.lk — Beauty, Elegance, Confidence" width={582} height={687} fetchPriority="high" decoding="async" sx={{ width: '100%', height: 'auto', display: 'block' }} />
        </Box>
      </Box>
      <Box sx={{ position: 'absolute', left: { xs: 22, md: 28 }, right: 16, bottom: 22 }}>
        <Typography sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.19em', color: '#765D50', mb: 0.5 }}>The Sekkin edit</Typography>
        <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '1.15rem', md: '1.45rem' }, color: '#4C3430' }}>Your daily moment of care.</Typography>
      </Box>
    </Reveal>
  );
}
