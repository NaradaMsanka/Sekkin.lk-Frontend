import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Alert, AppBar, Box, Button, Card, Chip, Collapse, Container, Dialog, DialogContent, DialogTitle, Divider, Drawer, FormControl, IconButton, InputAdornment, InputLabel, List, ListItemButton, ListItemText, MenuItem, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Toolbar, Typography } from '@mui/material';
import { ArrowBack, ArrowForward, Close, GridView, MailOutlined, Menu as MenuIcon, PhoneOutlined, Search, SpaOutlined, Tune, ViewList, VisibilityOutlined, WhatsApp } from '@mui/icons-material';
import business from './catalogBusiness.json';
import BrandShowcase from '../components/storefront/BrandShowcase';
import Reveal from '../components/storefront/Reveal';
import RouteScroll from '../components/RouteScroll';
import snapshot from './catalogSnapshot.json';
import { catalogLinks, catalogPages, orderingNotice } from './catalogContent';

const price = product => product.discountPrice > 0 && product.discountPrice < product.price ? product.discountPrice : product.price;
const supportEmailHref = `mailto:${business.supportEmail}`;
const supportPhoneHref = `tel:+94${business.supportPhone.slice(1)}`;
const supportWhatsAppHref = `https://wa.me/${business.whatsappNumber}`;
const columns = { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' };

function Brand({ inverse = false }) {
  return <Box component={Link} className="brand-lockup" to="/" aria-label="Sekkin.lk home" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.2, textDecoration: 'none', flexShrink: 0 }}>
    <Box component="img" className="brand-lockup__emblem" src="/logo.png" alt="" width={40} height={40} sx={{ borderRadius: '50%', objectFit: 'cover', border: '1px solid #B98B60', bgcolor: '#0A0A0A' }} />
    <Box><Typography sx={{ fontWeight: 700, letterSpacing: '-.6px', color: inverse ? '#FCF8F5' : '#8F344D', fontSize: '1.25rem', lineHeight: 1.2 }}>Sekkin<Box component="span" sx={{ color: '#B98B60' }}>.lk</Box></Typography><Typography sx={{ fontSize: '.55rem', letterSpacing: '1.1px', color: inverse ? '#CBBAB9' : 'text.secondary' }}>BEAUTY · ELEGANCE · CONFIDENCE</Typography></Box>
  </Box>;
}

function Navigation() {
  const [open, setOpen] = useState(false);
  return <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#FCF8F5F7', color: 'text.primary', borderBottom: '1px solid #E6DBD3', backdropFilter: 'blur(12px)' }}>
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 6 } }}><Toolbar disableGutters sx={{ minHeight: { xs: 72, sm: 84 }, gap: 2 }}>
      <IconButton aria-label="Open navigation menu" onClick={() => setOpen(true)} sx={{ display: { md: 'none' }, ml: -1 }}><MenuIcon /></IconButton><Brand />
      <Box component="nav" aria-label="Main navigation" sx={{ display: { xs: 'none', md: 'flex' }, ml: 3, gap: 1 }}>
        {catalogLinks.slice(0, 3).map(([to, text]) => <Button component={Link} to={to} key={to} color="inherit" sx={{ fontSize: '.82rem' }}>{text}</Button>)}
      </Box><Chip label="Public catalog" size="small" sx={{ display: { xs: 'none', sm: 'flex' }, ml: 'auto', bgcolor: '#F1E5DF', color: '#765443', fontSize: '.67rem' }} />
    </Toolbar></Container>
    <Drawer open={open} onClose={() => setOpen(false)}><Box sx={{ width: 280, maxWidth: '90vw', p: 2 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Brand /><IconButton aria-label="Close navigation menu" onClick={() => setOpen(false)}><Close /></IconButton></Stack><List>{catalogLinks.map(([to, text]) => <ListItemButton component={Link} to={to} key={to} onClick={() => setOpen(false)}><ListItemText primary={text} /></ListItemButton>)}</List></Box></Drawer>
  </AppBar>;
}

function ContactButtons() {
  return <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 2 }}>
    <Button component="a" href={supportEmailHref} variant="contained" startIcon={<MailOutlined />}>Email support</Button>
    <Button component="a" href={supportPhoneHref} variant="outlined" startIcon={<PhoneOutlined />}>Call us</Button>
    <Button component="a" href={supportWhatsAppHref} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<WhatsApp />}>WhatsApp support</Button>
  </Stack>;
}

function Footer() {
  return <Reveal component="footer" sx={{ mt: 8, bgcolor: '#302326', color: '#FCF8F5', py: { xs: 5, md: 7 } }}><Container maxWidth="xl" sx={{ px: { xs: 3, lg: 6 } }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr .9fr 1.1fr' }, gap: 4 }}><Box><Brand inverse /><Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', mt: 3, mb: 1.5 }}>Beauty for your everyday.</Typography><Typography variant="body2" sx={{ color: '#CBBAB9', lineHeight: 1.9 }}>Explore the collection. Online ordering and customer accounts are temporarily unavailable.</Typography></Box>
      <Box component="nav" aria-label="Customer information"><Typography sx={{ color: '#E1BC9C', letterSpacing: '.14em', fontSize: '.68rem', textTransform: 'uppercase', mb: 1.5 }}>Customer information</Typography>{catalogLinks.map(([to, text]) => <Typography component={Link} to={to} key={to} sx={{ display: 'block', py: 1, minHeight: 44, color: '#DDCECA', textDecoration: 'none', fontSize: '.8rem', '&:hover': { color: 'white' } }}>{text}</Typography>)}</Box>
      <Box sx={{ minWidth: 0 }}><Typography sx={{ color: '#E1BC9C', letterSpacing: '.14em', fontSize: '.68rem', textTransform: 'uppercase', mb: 2 }}>Business information</Typography>{[business.registeredName, `${business.businessType} · ${business.registrationStatus}`, `Registration: ${business.registrationNumber}`, `Sole proprietor: ${business.soleProprietorLegalName}`, business.postalAddress, `Availability: ${business.businessHours}`].map(text => <Typography key={text} variant="body2" sx={{ color: '#CBBAB9', lineHeight: 1.9, overflowWrap: 'anywhere' }}>{text}</Typography>)}<Typography component="a" href={supportEmailHref} sx={{ display: 'block', py: 1.5, color: '#DDCECA', overflowWrap: 'anywhere' }}>{business.supportEmail}</Typography><Typography component="a" href={supportPhoneHref} sx={{ display: 'block', py: 1, color: '#DDCECA' }}>{business.supportPhone}</Typography><Typography component="a" href={supportWhatsAppHref} target="_blank" rel="noopener noreferrer" sx={{ display: 'block', py: 1, color: '#DDCECA' }}>WhatsApp support</Typography></Box></Box>
    <Divider sx={{ borderColor: '#E1BC9C29', mt: 5, mb: 3 }} /><Typography variant="caption" sx={{ color: '#CBBAB9' }}>© {new Date().getFullYear()} SEKKIN.LK · Public catalog · Online ordering temporarily unavailable</Typography>
  </Container></Reveal>;
}

function Media({ src, name }) {
  const [failed, setFailed] = useState(false);
  return <Box className="product-media" sx={{ position: 'relative', aspectRatio: '1 / 1', bgcolor: '#F5EFEB', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
    {src && !failed ? <Box component="img" src={src} alt={`Temporary illustrative image for ${name}`} loading="lazy" decoding="async" onError={() => setFailed(true)} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: '8%' }} /> : <Box sx={{ display: 'grid', justifyItems: 'center', gap: 1.5, color: '#9A8479' }}><SpaOutlined sx={{ fontSize: 40 }} /><Typography variant="caption">Image coming soon</Typography></Box>}
  </Box>;
}

function ProductPrice({ product, large }) {
  return <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1, my: 1 }}><Typography component="span" sx={{ fontWeight: 600, fontSize: large ? '1.8rem' : '1.15rem' }}>Rs. {price(product).toLocaleString('en-LK')}</Typography>{price(product) < product.price && <Typography component="del" variant="caption" color="text.secondary">Rs. {product.price.toLocaleString('en-LK')}</Typography>}</Box>;
}

function CatalogCard({ product, list, onQuickView }) {
  return <Card component="article" className="store-product-card" variant="outlined" sx={{ height: '100%', minWidth: 0, display: 'flex', flexDirection: list ? { xs: 'column', sm: 'row' } : 'column', borderColor: '#E9DFD8', borderRadius: 3, overflow: 'hidden', transition: 'transform 220ms ease, box-shadow 220ms ease', '@media (hover: hover) and (prefers-reduced-motion: no-preference)': { '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px #3023260B' } } }}>
    <Box sx={{ position: 'relative', width: list ? { xs: '100%', sm: 225 } : '100%', flexShrink: 0 }}><Box component={Link} to={`/product/${product.id}`} aria-label={`View ${product.name}, catalog reference ${product.id}`}><Media key={product.imageUrl} src={product.imageUrl} name={product.name} /></Box><IconButton aria-label={`Quick view catalog reference ${product.id}`} onClick={() => onQuickView(product)} sx={{ position: 'absolute', right: 10, top: 10, bgcolor: '#FFFDFAF5', border: '1px solid #E9DFD8' }}><VisibilityOutlined fontSize="small" /></IconButton></Box>
    <Box sx={{ p: 2.5, minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}><Typography variant="overline" color="text.secondary" sx={{ fontSize: '.63rem', letterSpacing: '.12em' }}>{product.brand || 'The Sekkin collection'}</Typography><Typography component={Link} to={`/product/${product.id}`} sx={{ color: 'text.primary', textDecoration: 'none', fontSize: '.94rem', fontWeight: 500, lineHeight: 1.55, mb: .5 }}>{product.name}</Typography><Typography variant="caption" color="text.secondary">Catalog reference #{product.id}</Typography><ProductPrice product={product} /><Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>Illustrative imagery · Availability enquiries through support</Typography><Button component={Link} to={`/product/${product.id}`} className="store-primary-action" variant="contained" endIcon={<ArrowForward />} sx={{ mt: 'auto', width: '100%' }}>View details</Button></Box>
  </Card>;
}

function ProductInformation({ product }) {
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1fr)' }, gap: { xs: 3, md: 5 } }}><Box><Media key={product.imageUrl} src={product.imageUrl} name={product.name} />{product.images.length > 1 && <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1.5 }}>{product.images.map(src => <Media key={src} src={src} name={product.name} />)}</Box>}</Box><Box sx={{ minWidth: 0 }}><Typography variant="overline" color="text.secondary">Catalog reference #{product.id}</Typography><Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.2 }}>{product.name}</Typography><ProductPrice product={product} large /><Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, mb: 2 }}>{product.description}</Typography>{product.ingredients && <Typography variant="body2">Ingredients: {product.ingredients}</Typography>}<Alert severity="info" sx={{ my: 3 }}>Temporary illustrative images may not depict the offered item. Contact support if a product is unclear. Prices come from the published catalog snapshot; online ordering is unavailable.</Alert><ContactButtons /></Box></Box>;
}

function Collection() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Products');
  const [brand, setBrand] = useState('All Brands');
  const [sort, setSort] = useState('latest');
  const [layout, setLayout] = useState('grid');
  const [filters, setFilters] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const brands = ['All Brands', ...new Set(snapshot.products.map(product => product.brand).filter(Boolean))];
  const products = useMemo(() => snapshot.products.filter(product => (!search.trim() || [product.name, product.brand, product.description].some(value => value?.toLowerCase().includes(search.trim().toLowerCase()))) && (category !== 'Offers & Sale' || price(product) < product.price) && (brand === 'All Brands' || product.brand === brand)).sort((a, b) => sort === 'price-asc' ? price(a) - price(b) : sort === 'price-desc' ? price(b) - price(a) : b.id - a.id), [search, category, brand, sort]);
  return <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 6 }, pb: 3 }}>
    <Box component="section" aria-labelledby="hero-heading" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.12fr .88fr' }, alignItems: 'center', gap: { xs: 4, md: 7 }, py: { xs: 5, md: 7 } }}>
      <Reveal delay={40} sx={{ maxWidth: 620 }}><Typography sx={{ color: '#9A7457', letterSpacing: '.2em', textTransform: 'uppercase', fontSize: '.67rem', mb: 2.5 }}>Beauty · Elegance · Confidence</Typography><Typography component="h1" id="hero-heading" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2.65rem', sm: '3.6rem', lg: '4.5rem' }, lineHeight: 1.08, fontWeight: 400, letterSpacing: '-.045em', mb: 2.5 }}>A little care.<br /><Box component="span" sx={{ color: '#8F344D', fontStyle: 'italic' }}>A beautiful ritual.</Box></Typography><Typography color="text.secondary" sx={{ maxWidth: 430, fontSize: '.95rem', lineHeight: 1.9, mb: 3.5 }}>Discover skincare and beauty essentials for your everyday routine. Find your next favourite at SEKKIN.LK.</Typography><Button component="a" href="#catalog-section" className="store-primary-action" variant="contained" endIcon={<ArrowForward />} sx={{ px: 3, py: 1.5 }}>Explore the collection</Button><Stack direction="row" alignItems="center" spacing={2} sx={{ color: '#87766C', mt: 4 }}><SpaOutlined /><Typography variant="caption">Thoughtful beauty. Everyday confidence.</Typography></Stack></Reveal><BrandShowcase />
    </Box><Divider sx={{ borderColor: '#E8DDD5' }} />
    <Box component="section" id="catalog-section" sx={{ pt: { xs: 5, md: 6 }, scrollMarginTop: 110 }}><Reveal><Typography variant="overline" sx={{ color: '#9A7457', letterSpacing: '.16em', fontSize: '.65rem' }}>Discover your favourites</Typography><Typography component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2rem', md: '2.6rem' }, mt: .5 }}>The beauty collection</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }} aria-live="polite">{products.length} products to explore · Catalog snapshot {snapshot.snapshotAtUtc.slice(0, 10)}</Typography></Reveal>
      <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap', mb: 3 }}>{['All Products', 'Offers & Sale'].map(value => <Chip key={value} label={value} clickable aria-pressed={category === value} onClick={() => setCategory(value)} sx={{ minHeight: 38, borderRadius: 20, bgcolor: category === value ? '#302326' : '#EFE5DF', color: category === value ? 'white' : 'text.secondary' }} />)}</Stack>
      <Box sx={{ p: 2.5, bgcolor: '#FFFDFC', border: '1px solid #E6DBD3', borderRadius: 3, mb: 3 }}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto', md: 'minmax(0, 1fr) auto 190px auto' }, gap: 1.5 }}><TextField label="Search products" size="small" value={search} onChange={event => setSearch(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} /><Button variant="outlined" startIcon={<Tune />} onClick={() => setFilters(value => !value)} aria-expanded={filters}>Filters</Button><FormControl size="small"><InputLabel id="catalog-sort">Sort by</InputLabel><Select labelId="catalog-sort" label="Sort by" value={sort} onChange={event => setSort(event.target.value)}><MenuItem value="latest">New arrivals</MenuItem><MenuItem value="price-asc">Price: low to high</MenuItem><MenuItem value="price-desc">Price: high to low</MenuItem></Select></FormControl><ToggleButtonGroup value={layout} exclusive size="small" aria-label="Product layout" onChange={(_, value) => value && setLayout(value)}><ToggleButton value="grid" aria-label="Grid view"><GridView /></ToggleButton><ToggleButton value="list" aria-label="List view"><ViewList /></ToggleButton></ToggleButtonGroup></Box><Collapse in={filters}><FormControl fullWidth size="small" sx={{ mt: 3 }}><InputLabel id="catalog-brand">Brand</InputLabel><Select labelId="catalog-brand" label="Brand" value={brand} onChange={event => setBrand(event.target.value)}>{brands.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl></Collapse></Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: layout === 'list' ? '1fr' : columns, gap: 2.5 }}>{products.map((product, index) => <Reveal key={product.id} delay={index * 70}><CatalogCard product={product} list={layout === 'list'} onQuickView={setQuickView} /></Reveal>)}</Box>{products.length === 0 && <Box sx={{ textAlign: 'center', py: 6 }}><Typography>No products match those filters.</Typography><Button onClick={() => { setSearch(''); setCategory('All Products'); setBrand('All Brands'); }}>Clear filters</Button></Box>}
    </Box><Dialog open={Boolean(quickView)} onClose={() => setQuickView(null)} maxWidth="md" fullWidth><DialogTitle>Product information<IconButton aria-label="Close quick view" onClick={() => setQuickView(null)} sx={{ float: 'right' }}><Close /></IconButton></DialogTitle><DialogContent>{quickView && <ProductInformation product={quickView} />}</DialogContent></Dialog>
  </Container>;
}

function ProductPage() {
  const { id } = useParams();
  const product = snapshot.products.find(item => String(item.id) === id);
  if (!product) return <Unavailable />;
  return <Container maxWidth="lg" sx={{ py: 5 }}><Button component={Link} to="/" startIcon={<ArrowBack />} sx={{ mb: 4 }}>Back to collection</Button><ProductInformation product={product} /></Container>;
}

function InformationPage({ pageKey }) {
  const page = catalogPages[pageKey];
  return <Container maxWidth="md" sx={{ py: 5, px: { xs: 2.5, sm: 3 } }}><Button component={Link} to="/" startIcon={<ArrowBack />} sx={{ mb: 4 }}>Back to collection</Button><Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2.25rem', md: '3rem' }, mb: 2 }}>{page.title}</Typography><Typography color="text.secondary" sx={{ lineHeight: 1.9, mb: 4 }}>{page.intro}</Typography>{page.sections.map(([title, ...paragraphs]) => <Box component="section" key={title} sx={{ bgcolor: '#FFFDFC', border: '1px solid #E6DBD3', borderRadius: 3, p: { xs: 2.5, sm: 3.5 }, mb: 2.5 }}><Typography component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', mb: 2 }}>{title}</Typography>{paragraphs.map((text, index) => <Typography key={index} variant="body2" sx={{ lineHeight: 1.95, mb: 1.5, overflowWrap: 'anywhere' }}>{text}</Typography>)}{pageKey === 'contact' && <ContactButtons />}</Box>)}{pageKey === 'privacy-policy' && <Typography component="a" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel privacy information</Typography>}</Container>;
}

function Unavailable() {
  return <Container maxWidth="md" sx={{ py: 8 }}><Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontSize: '2.3rem', mb: 2 }}>Online ordering is temporarily unavailable</Typography><Typography color="text.secondary" sx={{ mb: 3 }}>This website is currently a public catalog. Checkout, customer accounts and order services are unavailable.</Typography><Button component={Link} to="/" variant="contained">Explore the collection</Button></Container>;
}

function Metadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${catalogPages[pathname.slice(1)]?.title || 'Public catalog'} | SEKKIN.LK`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Explore the SEKKIN.LK public beauty catalog. Online ordering and customer accounts are temporarily unavailable.');
  }, [pathname]);
  return null;
}

export default function CatalogApp() {
  return <BrowserRouter><RouteScroll /><Metadata /><Box component="a" href="#main-content" className="skip-link">Skip to content</Box><Navigation /><Container maxWidth="xl" sx={{ px: { xs: 2, lg: 6 }, pt: 2.5 }}><Alert severity="info" role="status" sx={{ borderRadius: 2 }}>{orderingNotice}</Alert></Container><Box component="main" id="main-content" tabIndex={-1} sx={{ outline: 'none' }}><Routes><Route path="/" element={<Collection />} /><Route path="/product/:id" element={<ProductPage />} />{Object.keys(catalogPages).map(key => <Route key={key} path={`/${key}`} element={<InformationPage pageKey={key} />} />)}<Route path="*" element={<Unavailable />} /></Routes></Box><Footer /></BrowserRouter>;
}
