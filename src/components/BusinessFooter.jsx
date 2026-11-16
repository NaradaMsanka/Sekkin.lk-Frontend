import { Link } from 'react-router-dom';
import { Box, Button, Container, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import business from '../content/business.json';
import { isContactFieldConfirmed, supportEmailHref, supportPhoneHref, supportWhatsAppHref } from '../content/businessContacts';
import { isBusinessReady, publicBusinessLinks } from '../content/businessPages';
import Reveal from './storefront/Reveal';

const linkStyle = { display: 'block', width: 'fit-content', minHeight: 44, color: '#DDCECA', py: 1, textDecoration: 'none', fontSize: '.8rem', lineHeight: 1.7, '&:hover': { color: 'white', textDecoration: 'underline', textUnderlineOffset: 4 } };
const labelStyle = { color: '#E1BC9C', fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.14em', mb: 2 };
export default function BusinessFooter({ brand, socialLinks }) {
  const hasApprovedPolicyDates = business.policiesApproved === true && /^\d{4}-\d{2}-\d{2}$/.test(business.policyEffectiveDate || '') && /^\d{4}-\d{2}-\d{2}$/.test(business.policyPublicationDate || '');
  const pendingPolicyDates = business.policyEffectiveDateBasis === 'actual-public-launch-date'
    ? 'Policy effective date: the actual public launch date. Calendar effective and publication dates will be recorded at publication.'
    : 'Final policy effective and publication dates await approval and publication.';
  return <Reveal component="footer" sx={{ mt: { xs: 7, md: 10 }, bgcolor: '#302326', color: '#FCF8F5' }}>
    <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, lg: 6 }, pt: { xs: 5, md: 7 }, pb: { xs: 10, sm: 4 } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: '1.4fr .9fr .9fr 1.1fr' }, gap: { xs: 4, md: 5 } }}>
        <Box sx={{ minWidth: 0 }}>{brand}<Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', lineHeight: 1.3, mt: 3, mb: 1.5 }}>Beauty for your everyday.</Typography><Typography variant="body2" sx={{ color: '#CBBAB9', lineHeight: 1.9 }}>Cosmetics and skincare for your daily routine. Explore the collection and find your next favourite.</Typography>
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', mt: 2 }}>{[['/', 'Shop'], ['/cart', 'Cart'], ['/orders', 'My orders']].map(([to, label]) => <Typography component={Link} key={to} to={to} sx={linkStyle}>{label}</Typography>)}</Stack>
          {socialLinks.length > 0 && <Stack direction="row" spacing={1} sx={{ mt: 2 }}>{socialLinks.map(({ label, href, icon: Icon }) => <Tooltip key={label} title={label}><IconButton component="a" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens a new tab)`} sx={{ width: 44, height: 44, color: '#E1BC9C', border: '1px solid #E1BC9C38' }}><Icon sx={{ fontSize: 19 }} /></IconButton></Tooltip>)}</Stack>}
        </Box>
        {[['Customer support', publicBusinessLinks.slice(0, 3)], ['Company', publicBusinessLinks.slice(3)]].map(([label, links]) => <Box component="nav" aria-label={label} key={label} sx={{ minWidth: 0 }}><Typography component="h2" sx={labelStyle}>{label}</Typography>{links.map(link => <Typography component={Link} key={link.to} to={link.to} sx={linkStyle}>{link.label}</Typography>)}</Box>)}
        <Box sx={{ minWidth: 0 }}><Typography component="h2" sx={labelStyle}>Business information</Typography><Typography sx={{ fontSize: '.9rem', fontWeight: 500, mb: 1 }}>{business.businessName}</Typography>
          <Typography variant="caption" sx={{ display: 'block', color: '#CBBAB9', mb: 1 }}>Trading name: {business.tradingName}</Typography>
          {business.registeredName && <Typography variant="body2" sx={{ color: '#CBBAB9', lineHeight: 1.9 }}>Registered business: {business.registeredName}</Typography>}
          {business.businessType && <Typography variant="body2" sx={{ color: '#CBBAB9', lineHeight: 1.9 }}>{business.businessType} · {business.registrationStatus}</Typography>}
          {business.registrationNumber && <Typography variant="body2" sx={{ color: '#CBBAB9', lineHeight: 1.9, overflowWrap: 'anywhere' }}>Registration number: {business.registrationNumber}</Typography>}
          {business.soleProprietorLegalName ? <Typography variant="body2" sx={{ color: '#CBBAB9', lineHeight: 1.9 }}>Sole proprietor: {business.soleProprietorLegalName}</Typography> : <Typography variant="body2" sx={{ color: '#E1BC9C', fontSize: '.78rem', lineHeight: 1.9 }}>REVIEW REQUIRED — sole proprietor's legal personal name.</Typography>}
          {isContactFieldConfirmed('postalAddress') && <Typography variant="body2" sx={{ color: '#CBBAB9', lineHeight: 1.9, overflowWrap: 'anywhere' }}>{business.postalAddress}</Typography>}
          {supportPhoneHref && <Typography component="a" href={supportPhoneHref} sx={{ ...linkStyle, mt: 1 }}>{business.supportPhone}</Typography>}
          {supportEmailHref && <Typography component="a" href={supportEmailHref} sx={{ ...linkStyle, overflowWrap: 'anywhere' }}>{business.supportEmail}</Typography>}
          {supportWhatsAppHref && <Typography component="a" href={supportWhatsAppHref} target="_blank" rel="noopener noreferrer" sx={linkStyle}>WhatsApp: {business.supportPhone}</Typography>}
          {isContactFieldConfirmed('businessHours') && <Typography variant="caption" sx={{ display: 'block', color: '#CBBAB9', mt: 1 }}>Business availability: {business.businessHours}. Support response time is not guaranteed.</Typography>}
          <Button component={Link} to="/contact" variant="outlined" sx={{ mt: 2, borderColor: '#E1BC9C66', color: '#E1BC9C', fontSize: '.78rem', minHeight: 44 }}>Contact information</Button>
        </Box>
      </Box>
      <Divider sx={{ borderColor: '#E1BC9C29', mt: 5, mb: 3 }} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}><Typography variant="caption" sx={{ color: '#CBBAB9' }}>© {new Date().getFullYear()} {business.brand}. All rights reserved.</Typography><Typography variant="caption" sx={{ color: '#E1BC9C', maxWidth: 520, lineHeight: 1.8 }}>{isBusinessReady ? 'Sri Lanka · cosmetics and skincare' : 'Business review draft · remaining policies and legal details require confirmation.'}</Typography></Box>
      <Typography variant="caption" sx={{ display: 'block', color: '#CBBAB9', mt: 1, lineHeight: 1.8 }}>{hasApprovedPolicyDates ? `Policies effective ${business.policyEffectiveDate}. Published / last updated ${business.policyPublicationDate}.` : pendingPolicyDates}</Typography>
    </Container>
  </Reveal>;
}
