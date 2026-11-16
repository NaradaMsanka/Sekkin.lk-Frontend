import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Drawer,
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Avatar,
  Menu, MenuItem, Divider, Container, Tooltip, Fab, Stack, SvgIcon, useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart, PersonOutlineOutlined, Menu as MenuIcon, Close,
  AdminPanelSettingsOutlined, Logout, History, StorefrontOutlined,
  WhatsApp, Instagram, Facebook, PhoneOutlined,
} from '@mui/icons-material';
import api from '../services/api';
import BusinessFooter from './BusinessFooter';
import business from '../content/business.json';

const WHATSAPP_URL = business.contactsConfirmed && business.whatsappNumber ? 'https://wa.me/' + business.whatsappNumber.replace(/\D/g, '') : null;
const SUPPORT_LINK_PROPS = WHATSAPP_URL ? { component: 'a', href: WHATSAPP_URL, target: '_blank', rel: 'noopener noreferrer' } : { component: Link, to: '/contact' };
const SOCIAL_LINKS = business.socialLinks.filter(link => /^https:\/\//.test(link.href)).map(link => ({ ...link, icon: { Instagram, Facebook, TikTok: TikTokIcon }[link.label] || WhatsApp }));
const NAV_LINKS = [
  { label: 'Shop', to: '/', icon: StorefrontOutlined },
  { label: 'My orders', to: '/orders', icon: History },
];
const iconButtonSx = { width: 42, height: 42, color: 'text.primary' };

function parseJwt(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function TikTokIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68a6.34 6.34 0 0 0 12.68 0V8.75a8.16 8.16 0 0 0 4.91 1.62v-3.45a4.85 4.85 0 0 1-1-.23z" />
    </SvgIcon>
  );
}

function Brand({ inverse = false, onClick }) {
  return (
    <Box className="brand-lockup" component={Link} to="/" onClick={onClick} aria-label="Sekkin.lk home" sx={{
      display: 'inline-flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.25 },
      textDecoration: 'none', minWidth: 0, flexShrink: 0,
    }}>
      <Box className="brand-lockup__emblem" component="img" src="/logo.png" alt="" width={40} height={40} sx={{
        width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, borderRadius: '50%',
        objectFit: 'cover', border: '1px solid #B98B60', bgcolor: '#0a0a0a',
      }} />
      <Box>
        <Typography component="span" sx={{
          display: 'block', fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' },
          color: inverse ? '#FCF8F5' : '#8F344D', lineHeight: 1.2, letterSpacing: '-0.6px',
        }}>
          Sekkin<Box component="span" sx={{ color: inverse ? '#E1BC9C' : '#98704E' }}>.lk</Box>
        </Typography>
        <Typography component="span" sx={{
          display: { xs: 'none', sm: 'block' }, fontSize: '0.57rem', mt: 0.4,
          letterSpacing: '1.25px', textTransform: 'uppercase', color: inverse ? '#CBBAB9' : 'text.secondary',
        }}>
          Beauty · Elegance · Confidence
        </Typography>
      </Box>
    </Box>
  );
}

// Reuse the pending request across StrictMode's effect replay; mutations emit updates.
let pendingCartRequest = null;
let pendingCartToken = null;

function loadInitialCart(token) {
  if (!pendingCartRequest || pendingCartToken !== token) {
    pendingCartToken = token;
    const request = api.get('/api/cart');
    pendingCartRequest = request;
    const clear = () => {
      if (pendingCartRequest === request) {
        pendingCartRequest = null;
        pendingCartToken = null;
      }
    };
    request.then(clear, clear);
  }
  return pendingCartRequest;
}

export function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [cartState, setCartState] = useState(null);
  const token = localStorage.getItem('token');
  const user = token ? parseJwt(token) : null;
  const isAdmin = user?.role === 'ADMIN';
  const cartCount = token && cartState?.token === token ? cartState.count : null;
  const links = isAdmin
    ? [...NAV_LINKS, { label: 'Admin', to: '/admin', icon: AdminPanelSettingsOutlined }]
    : NAV_LINKS;

  useEffect(() => {
    if (!token) return;
    let active = true;
    const updateCount = (cart) => {
      if (!active || !Array.isArray(cart?.items)) return;
      const count = cart.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
      setCartState({ token, count });
    };
    const onCartUpdated = (event) => updateCount(event.detail);
    window.addEventListener('sekkin:cart-updated', onCartUpdated);
    loadInitialCart(token).then((response) => updateCount(response.data)).catch(() => {
      // Keep the cart link available when the count cannot be loaded.
    });
    return () => {
      active = false;
      window.removeEventListener('sekkin:cart-updated', onCartUpdated);
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAnchorEl(null);
    setDrawerOpen(false);
    setCartState(null);
    navigate('/login');
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: 'rgba(252,248,245,0.97)', color: 'text.primary',
        borderBottom: '1px solid', borderColor: 'divider', backdropFilter: 'blur(12px)',
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3, lg: 5 } }}>
          <Toolbar disableGutters sx={{ minHeight: { xs: 68, sm: 84 }, gap: { xs: 0.5, sm: 2, md: 4 } }}>
            <IconButton aria-label="Open navigation menu" aria-controls={drawerOpen ? 'mobile-navigation' : undefined}
              aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}
              sx={{ ...iconButtonSx, display: { md: 'none' }, ml: -0.75, flexShrink: 0 }}>
              <MenuIcon fontSize="small" />
            </IconButton>
            <Brand />
            <Box component="nav" aria-label="Main navigation" sx={{
              display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, flex: 1,
            }}>
              {links.map(({ label, to }) => (
                <Button key={to} component={Link} to={to} aria-current={pathname === to ? 'page' : undefined}
                  sx={{
                    px: 2, py: 1, fontSize: '0.82rem', color: pathname === to ? 'primary.main' : 'text.secondary',
                    bgcolor: pathname === to ? 'rgba(143,52,77,0.06)' : 'transparent',
                  }}>
                  {label}
                </Button>
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 }, ml: 'auto' }}>
              <Tooltip title={WHATSAPP_URL ? 'WhatsApp support' : 'Contact support'}>
                <IconButton {...SUPPORT_LINK_PROPS}
                  aria-label={WHATSAPP_URL ? 'WhatsApp support (opens a new tab)' : 'Contact support'} sx={{ ...iconButtonSx, display: { xs: 'none', lg: 'inline-flex' } }}>
                  {WHATSAPP_URL ? <WhatsApp fontSize="small" /> : <PhoneOutlined fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Shopping cart">
                <IconButton className="store-cart-link" component={Link} to="/cart" sx={{ ...iconButtonSx, color: '#B5385C' }}
                  aria-label={cartCount == null ? 'Shopping cart' : `Shopping cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>
                  <Badge key={cartCount ?? 'unknown'} badgeContent={cartCount} color="primary" max={99} sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.6rem', height: 17, minWidth: 17,
                      animation: !reduceMotion && cartCount > 0 ? 'cart-count-in 250ms ease-out' : 'none',
                    },
                    '@keyframes cart-count-in': { from: { opacity: 0.5 }, to: { opacity: 1 } },
                  }}>
                    <ShoppingCart className={cartCount > 0 ? 'cart-feedback' : ''} sx={{ fontSize: 23 }} />
                  </Badge>
                </IconButton>
              </Tooltip>
              {token ? (
                <>
                  <Tooltip title="Your account">
                    <IconButton id="account-button" onClick={(event) => setAnchorEl(event.currentTarget)}
                      aria-label="Your account" aria-haspopup="menu" aria-expanded={Boolean(anchorEl)}
                      aria-controls={anchorEl ? 'account-menu' : undefined} sx={iconButtonSx}>
                      <Avatar sx={{ width: 31, height: 31, bgcolor: '#F0E0E2', color: 'primary.main', fontSize: 13, fontWeight: 600 }}>
                        {user?.sub?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu id="account-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                    transitionDuration={reduceMotion ? 0 : 180}
                    slotProps={{
                      paper: { sx: { borderRadius: 3, minWidth: 210, maxWidth: 'calc(100vw - 32px)', mt: 1 } },
                      list: { 'aria-labelledby': 'account-button' },
                    }}>
                    <Box sx={{ px: 2, py: 1.25, maxWidth: 270 }}>
                      <Typography variant="caption" color="text.secondary">Signed in as</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{user?.sub}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={Link} to="/orders" onClick={() => setAnchorEl(null)}>
                      <ListItemIcon><History fontSize="small" /></ListItemIcon>My orders
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem component={Link} to="/admin" onClick={() => setAnchorEl(null)}>
                        <ListItemIcon><AdminPanelSettingsOutlined fontSize="small" /></ListItemIcon>Admin panel
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'primary.main' }}>
                      <ListItemIcon><Logout fontSize="small" color="primary" /></ListItemIcon>Log out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'text.primary', px: 1.5 }}>Log in</Button>
                  <Button component={Link} to="/register" variant="contained" sx={{ display: { xs: 'none', sm: 'inline-flex' }, px: 2 }}>Sign up</Button>
                  <IconButton component={Link} to="/login" aria-label="Log in" sx={{ ...iconButtonSx, display: { sm: 'none' } }}>
                    <PersonOutlineOutlined />
                  </IconButton>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        transitionDuration={reduceMotion ? 0 : { enter: 240, exit: 180 }}
        slotProps={{ paper: { sx: { width: 'min(340px, calc(100vw - 24px))', bgcolor: '#FCF8F5', p: 2.5 } } }}>
        <Box component="nav" id="mobile-navigation" aria-label="Mobile navigation" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: 3 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Brand onClick={() => setDrawerOpen(false)} />
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close navigation menu" sx={iconButtonSx}><Close /></IconButton>
          </Stack>
          <Divider />
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.4, px: 1.5 }}>Explore Sekkin.lk</Typography>
            <List sx={{ mt: 1 }}>
              {[...links, { label: 'Shopping cart', to: '/cart', icon: ShoppingCart }].map(({ label, to, icon: Icon }) => (
                <ListItem key={to} disablePadding sx={{ mb: 0.75 }}>
                  <ListItemButton component={Link} to={to} onClick={() => setDrawerOpen(false)}
                    selected={pathname === to} aria-current={pathname === to ? 'page' : undefined}
                    sx={{ borderRadius: 2, minHeight: 52 }}>
                    <ListItemIcon sx={{ minWidth: 38, color: 'primary.main' }}><Icon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={label} slotProps={{ primary: { fontSize: '0.9rem', fontWeight: 500 } }} />
                    {to === '/cart' && cartCount > 0 && <Typography variant="caption" color="primary.main">{cartCount}</Typography>}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
          <Stack spacing={1.5} sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {token ? (
              <>
                <Typography variant="body2" color="text.secondary" noWrap>{user?.sub}</Typography>
                <Button variant="outlined" startIcon={<Logout />} onClick={handleLogout}>Log out</Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" variant="contained" onClick={() => setDrawerOpen(false)}>Log in</Button>
                <Button component={Link} to="/register" variant="outlined" onClick={() => setDrawerOpen(false)}>Create an account</Button>
              </>
            )}
            <Button {...SUPPORT_LINK_PROPS} startIcon={WHATSAPP_URL ? <WhatsApp /> : <PhoneOutlined />} sx={{ color: 'text.secondary' }}>
              {WHATSAPP_URL ? 'WhatsApp support' : 'Contact support'}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

export function Footer() {
  return <BusinessFooter brand={<Brand inverse />} socialLinks={SOCIAL_LINKS} />;
}

export function SupportButton() {
  return (
    <Tooltip title={WHATSAPP_URL ? 'Chat with us on WhatsApp' : 'Contact support'} placement="left">
      <Fab {...SUPPORT_LINK_PROPS}
        aria-label={WHATSAPP_URL ? 'Chat on WhatsApp (opens a new tab)' : 'Contact support'} size="small" sx={{
          position: 'fixed', right: { xs: 16, sm: 24 }, bottom: 'max(18px, env(safe-area-inset-bottom))',
          zIndex: 1050, bgcolor: '#FCF8F5', color: '#47634F', border: '1px solid #D6DDD4',
          width: 48, height: 48, boxShadow: '0 4px 18px rgba(48,35,38,0.12)',
          transition: 'background-color 180ms ease, box-shadow 180ms ease',
          '&:hover': { bgcolor: '#EFF3EC', boxShadow: '0 6px 20px rgba(48,35,38,0.16)' },
        }}>
        {WHATSAPP_URL ? <WhatsApp sx={{ fontSize: 25 }} /> : <PhoneOutlined sx={{ fontSize: 25 }} />}
      </Fab>
    </Tooltip>
  );
}
