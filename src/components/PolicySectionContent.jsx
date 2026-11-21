import { Box, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { supportWhatsAppLabel } from '../content/businessContacts';

function PolicyText({ text, contact, relatedLink }) {
  const links = [
    contact && { text: contact.email, href: `mailto:${contact.email}` },
    contact && { text: contact.phone, label: supportWhatsAppLabel, href: contact.phoneHref },
    relatedLink,
  ].filter(Boolean);
  const content = [];
  let remaining = text;
  while (remaining) {
    const next = links.map(link => ({ ...link, index: remaining.indexOf(link.text) }))
      .filter(link => link.index >= 0).sort((a, b) => a.index - b.index)[0];
    if (!next) { content.push(remaining); break; }
    content.push(remaining.slice(0, next.index));
    const isWhatsApp = next.href?.startsWith('https://wa.me/');
    content.push(<Box key={content.length} component={next.to ? Link : 'a'} to={next.to} href={next.href}
      target={isWhatsApp ? '_blank' : undefined} rel={isWhatsApp ? 'noopener noreferrer' : undefined}
      title={isWhatsApp ? 'Chat on WhatsApp (opens a new tab)' : undefined}
      sx={{ color: 'primary.main', textDecoration: 'underline', textUnderlineOffset: 4, overflowWrap: 'anywhere' }}>{next.label || next.text}</Box>);
    remaining = remaining.slice(next.index + next.text.length);
  }
  return content;
}

export default function PolicySectionContent({ section, page }) {
  const textStyle = { color: 'text.secondary', fontSize: page.approved ? '1rem' : '.86rem', lineHeight: 1.9, overflowWrap: 'anywhere' };
  const listStyle = {
    ...textStyle, pl: { xs: 2.75, sm: 3.25 }, my: 0,
    '& > li': { pl: 0.5 }, '& > li + li': { mt: 1.75 },
    '& > li::marker': { color: 'primary.main', fontWeight: 500 },
  };
  const renderText = text => <PolicyText text={text} contact={page.contact} relatedLink={section.relatedLink} />;
  const paragraph = (text, index) => <Typography key={index} sx={{ ...textStyle, ...(text.startsWith('REVIEW REQUIRED') && { color: '#846038' }) }}>{renderText(text)}</Typography>;

  return <>
    {section.subtitle && <Typography component="h3" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1.5 }}>{section.subtitle}</Typography>}
    {section.numbering ? <Box component="ol" type="a" sx={{ ...listStyle, listStyleType: section.numbering }}>
      {section.body.map((text, index) => <Box component="li" key={index}>{renderText(text)}</Box>)}
    </Box> : <>
      <Stack spacing={1.5}>{(section.bulleted ? section.body.slice(0, 1) : section.body).map(paragraph)}</Stack>
      {section.bulleted && <Box component="ul" sx={{ ...listStyle, mt: 1.75 }}>{section.body.slice(1).map((text, index) => <Box component="li" key={index}>{renderText(text)}</Box>)}</Box>}
    </>}
    {section.steps && <Box component="ol" aria-label="Return and refund steps" sx={{ ...listStyle, mt: 2.5, '& > li + li': { mt: 2.5 } }}>
      {section.steps.map((step, index) => <Box component="li" key={index}>
        {renderText(step.text)}
        {step.details && <Box component="ul" sx={{ ...listStyle, mt: 1.5 }}>{step.details.map((text, detailIndex) => <Box component="li" key={detailIndex}>{renderText(text)}</Box>)}</Box>}
      </Box>)}
    </Box>}
    {section.after && <Stack spacing={1.5} sx={{ mt: 2.5 }}>{section.after.map(paragraph)}</Stack>}
  </>;
}
