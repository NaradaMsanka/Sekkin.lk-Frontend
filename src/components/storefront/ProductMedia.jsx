import { useState } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { SpaOutlined } from '@mui/icons-material';
import { resolveImageUrl } from '../../services/api';

function Image({ src, alt, priority, sx }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <Box className="product-media" sx={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden', bgcolor: '#F5EFEB', ...sx }}>
      {src && !failed ? (
        <>
          {!loaded && <Skeleton variant="rectangular" animation="wave" sx={{ position: 'absolute', inset: 0, height: '100%' }} />}
          <Box component="img" src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async"
            onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
            ref={node => { if (node?.complete && node.naturalWidth > 0 && !loaded) setLoaded(true); }}
            sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', p: '8%', opacity: loaded ? 1 : 0,
              transition: 'opacity 300ms ease, transform 400ms ease', position: 'absolute', inset: 0 }} />
        </>
      ) : (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', justifyItems: 'center', gap: 1.5, color: '#9A8479' }}>
          <SpaOutlined sx={{ fontSize: 40, opacity: 0.7 }} />
          <Typography variant="caption">Image coming soon</Typography>
        </Box>
      )}
    </Box>
  );
}

export default function ProductMedia({ src, ...props }) {
  const resolved = resolveImageUrl(src);
  return <Image key={resolved} src={resolved} {...props} />;
}
