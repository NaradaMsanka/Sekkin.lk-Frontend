import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Box, Button, Chip, Container, Divider, Stack, Typography } from '@mui/material';
import { ArrowBack, ArrowForward, MailOutlined, PhoneOutlined, WhatsApp } from '@mui/icons-material';
import business from '../content/business.json';
import { isContactFieldConfirmed, supportEmailHref, supportPhoneHref, supportWhatsAppHref } from '../content/businessContacts';
import { businessPages, isBusinessReady, publicBusinessLinks } from '../content/businessPages';

const card = { border: '1px solid #E6DBD3', borderRadius: '20px', bgcolor: '#FFFDFC', minWidth: 0 };
function usePageMetadata(title, description, path, noindex) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | ${business.brand}`;
    const restorers = [];
    for (const [selector, attributes] of [
      ['meta[name="description"]', { name: 'description', content: description }],
      ['meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, follow' : 'index, follow' }],
      ['link[rel="canonical"]', { rel: 'canonical', href: `${business.siteUrl}${path}` }],
    ]) {
      const existing = document.head.querySelector(selector);
      const node = existing || document.createElement(selector.startsWith('link') ? 'link' : 'meta');
      const oldValues = Object.fromEntries(Object.keys(attributes).map(key => [key, node.getAttribute(key)]));
      for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
      if (!existing) document.head.appendChild(node);
      restorers.push(() => { if (!existing) node.remove(); else for (const [key, value] of Object.entries(oldValues)) { if (value === null) node.removeAttribute(key); else node.setAttribute(key, value); } });
    }
    return () => { document.title = previousTitle; restorers.forEach(restore => restore()); };
  }, [title, description, path, noindex]);
}

function BusinessDetails() {
  const fields = [
    ['Brand', business.brand], ['Trading name', business.tradingName], ['Registered business name', business.registeredName],
    ['Business type', business.businessType], ['Registration status', business.registrationStatus], ['Business registration number', business.registrationNumber], ['Sole proprietor legal name', business.soleProprietorLegalName],
    ['Business phone', business.supportPhone, 'supportPhone'], ['Support email', business.supportEmail, 'supportEmail'],
    ['Business postal address', business.postalAddress, 'postalAddress'], ['Business availability', business.businessHours, 'businessHours'], ['WhatsApp', business.supportPhone, 'whatsappNumber'],
  ];
  return <Box sx={{ ...card, p: { xs: 2.5, sm: 3.5 }, mb: 3 }}>
    <Typography component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', mb: 2 }}>Business details</Typography>
    <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, .8fr) minmax(0, 1.4fr)' }, columnGap: 3, rowGap: 1.5 }}>
      {fields.map(([label, value, field]) => <Box key={label} sx={{ display: 'contents' }}><Typography component="dt" variant="body2" color="text.secondary">{label}</Typography><Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere', lineHeight: 1.8 }}>{value || 'REVIEW REQUIRED — details to be supplied.'}{value && field && !isContactFieldConfirmed(field) && <Typography component="span" variant="caption" sx={{ display: 'block', color: '#846038' }}>REVIEW REQUIRED — confirm this detail.</Typography>}</Typography></Box>)}
    </Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>Contact us any time. Business availability does not guarantee an immediate support response. Any further postal-address details needed for merchant verification remain under review.</Typography>
    <Stack direction="row" useFlexGap spacing={1.5} sx={{ flexWrap: 'wrap', mt: 3 }}>
      {supportEmailHref && <Button component="a" href={supportEmailHref} variant="contained" startIcon={<MailOutlined />}>Email support</Button>}
      {supportPhoneHref && <Button component="a" href={supportPhoneHref} variant="outlined" startIcon={<PhoneOutlined />}>Call us</Button>}
      {supportWhatsAppHref && <Button component="a" href={supportWhatsAppHref} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<WhatsApp />}>WhatsApp</Button>}
    </Stack>
  </Box>;
}

export default function BusinessPage({ pageKey }) {
  const page = businessPages[pageKey];
  const hasApprovedPolicyDates = business.policiesApproved === true && /^\d{4}-\d{2}-\d{2}$/.test(business.policyEffectiveDate || '') && /^\d{4}-\d{2}-\d{2}$/.test(business.policyPublicationDate || '');
  const pendingPolicyDates = business.policyEffectiveDateBasis === 'actual-public-launch-date'
    ? 'Policy effective date: the actual public launch date. Calendar effective and publication dates will be recorded at publication.'
    : 'Final policy effective and publication dates await approval and publication.';
  const contents = page.sections.map(item => <Typography component="a" key={item.id} href={`#${item.id}`} sx={{ color: 'text.secondary', textDecoration: 'none', minHeight: 44, py: 1, fontSize: '.8rem', lineHeight: 1.6, '&:hover': { color: 'primary.main' } }}>{item.title}</Typography>);
  usePageMetadata(`${isBusinessReady ? '' : 'Draft — '}${page.title}`, page.description, `/${pageKey}`, !isBusinessReady);
  return <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 6 }, pt: { xs: 3, md: 5 }, pb: 7 }}>
    <Button component={Link} to="/" color="inherit" startIcon={<ArrowBack sx={{ fontSize: 18 }} />} sx={{ px: 0, mb: 4, color: 'text.secondary' }}>Back to shop</Button>
    <Box className="store-entrance" sx={{ maxWidth: 800, mb: 4 }}>
      <Typography sx={{ color: '#886044', fontSize: '.65rem', letterSpacing: '.17em', textTransform: 'uppercase', mb: 1 }}>{page.category}</Typography>
      <Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.2rem' }, lineHeight: 1.15, overflowWrap: 'anywhere', mb: 2 }}>{page.title}</Typography>
      <Typography color="text.secondary" sx={{ fontSize: '.9rem', lineHeight: 1.9 }}>{page.intro}</Typography>
    </Box>
    {!isBusinessReady && <Alert severity="warning" sx={{ mb: 4, borderRadius: '12px', alignItems: 'start' }}><strong>Draft for business review — REVIEW REQUIRED.</strong> Business details and policy decisions are incomplete. This is not a final published policy or confirmation of PayHere approval.</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '260px minmax(0, 1fr)' }, gap: { xs: 3, md: 5 }, alignItems: 'start' }}>
      <Box component="nav" aria-label="On this page" sx={{ ...card, p: 2.5, position: { md: 'sticky' }, top: 108 }}>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}><Typography sx={{ fontSize: '.65rem', letterSpacing: '.13em', textTransform: 'uppercase', color: '#886044', mb: 1.5 }}>On this page</Typography><Stack spacing={.5}>{contents}</Stack></Box>
        <Box component="details" sx={{ display: { xs: 'block', md: 'none' } }}><Box component="summary" sx={{ minHeight: 44, py: 1, fontSize: '.82rem', color: 'primary.main', cursor: 'pointer' }}>On this page</Box><Stack spacing={.5}>{contents}</Stack></Box>
        <Divider sx={{ my: 2 }} /><Typography variant="caption" color="text.secondary">{hasApprovedPolicyDates ? `Policies effective ${business.policyEffectiveDate}. Published / last updated ${business.policyPublicationDate}.` : `Business information reviewed ${business.reviewDate}. ${pendingPolicyDates}`}</Typography>
      </Box>
      <Box sx={{ minWidth: 0, maxWidth: 900 }}>
        {pageKey === 'contact' && <BusinessDetails />}
        <Stack spacing={2.5}>{page.sections.map(item => <Box component="section" key={item.id} id={item.id} aria-labelledby={`${pageKey}-${item.id}`} sx={{ ...card, p: { xs: 2.5, sm: 3.5 }, scrollMarginTop: 110 }}>
          <Typography id={`${pageKey}-${item.id}`} component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '1.4rem', sm: '1.65rem' }, lineHeight: 1.35, mb: 2 }}>{item.title}</Typography>
          <Stack spacing={1.5}>{item.body.map((text, index) => <Typography key={index} sx={{ color: text.startsWith('REVIEW REQUIRED') ? '#846038' : 'text.secondary', fontSize: '.86rem', lineHeight: 1.95, overflowWrap: 'anywhere' }}>{text}</Typography>)}</Stack>
        </Box>)}</Stack>
        <Box sx={{ ...card, p: { xs: 2.5, sm: 3.5 }, mt: 3, bgcolor: '#F8F1EC' }}>
          <Typography component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', mb: 2 }}>More information</Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>{publicBusinessLinks.filter(link => link.to !== `/${pageKey}`).map(link => <Chip key={link.to} component={Link} to={link.to} label={link.label} clickable variant="outlined" sx={{ minHeight: 40, height: 'auto', py: .75, '& .MuiChip-label': { whiteSpace: 'normal' } }} />)}</Stack>
        </Box>
      </Box>
    </Box>
  </Container>;
}

export function BusinessNotFound() {
  usePageMetadata('Page not found', 'Find the SEKKIN.LK shop and customer information.', '/404', true);
  return <Container maxWidth="sm" sx={{ py: 8 }}><Box sx={{ ...card, p: 4, textAlign: 'center' }}><Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontSize: '2rem', mb: 2 }}>We couldn’t find that page</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>Head back to the shop or use the links below to find what you need.</Typography><Button component={Link} to="/" variant="contained" endIcon={<ArrowForward />}>Back to shop</Button></Box></Container>;
}
