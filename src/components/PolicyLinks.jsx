import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { businessPages, isBusinessReady } from '../content/businessPages';

export default function PolicyLinks() {
  return <Box aria-label="Checkout policies" sx={{ mt: 2.5, fontSize: '.72rem', lineHeight: 1.9, color: 'text.secondary' }}>
    <Typography variant="caption" sx={{ display: 'block', mb: .5 }}>Before placing your order, review:</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: .5, columnGap: 1.5 }}>{[
      ['/terms-and-conditions', 'Terms'], ['/refund-policy', 'Returns'], ['/privacy-policy', 'Privacy'], ['/shipping-policy', 'Delivery'],
    ].map(([to, label]) => <Typography component={Link} key={to} to={to} sx={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, fontSize: 'inherit', color: 'primary.main', textUnderlineOffset: 4, py: .75 }}>{label}{!isBusinessReady && !businessPages[to.slice(1)]?.approved ? ' (draft)' : ''}</Typography>)}</Box>
  </Box>;
}
