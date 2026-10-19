import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge,
  Box, Drawer, List, ListItem, ListItemButton, ListItemText,
  Avatar, Menu, MenuItem, Divider, Container, useScrollTrigger,
  Slide, Tooltip, Fab, Grid, Stack, SvgIcon, Chip
} from "@mui/material";
import {
  ShoppingCart, Favorite, Person, Menu as MenuIcon,
  AutoAwesome, AdminPanelSettings, Logout, History,
  Store, WhatsApp, Instagram, Facebook, Phone, Email,
  LocationOn, Verified, LocalShipping, SupportAgent
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from "./pages/AdminDashboard";

// JWT decode helper (without library)
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

// WhatsApp support phone number
const WHATSAPP_NUMBER = "94788153473"; 
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Sekkin.lk! I need assistance with your beauty products.")}`;

// Social Media Links - You can update these links with your exact account URLs
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/sekkin.lk", // replace with your IG URL
  facebook: "https://www.facebook.com/sekkin.lk",   // replace with your FB URL
  tiktok: "https://www.tiktok.com/@sekkin.lk",      // replace with your TikTok URL
  whatsapp: WHATSAPP_URL,
};

// Custom TikTok Icon SVG
function TikTokIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.32V8.75a8.16 8.16 0 0 0 4.91 1.62v-3.45a4.85 4.85 0 0 1-1-.23z"
        fill="currentColor"
      />
    </SvgIcon>
  );
}

// Hide AppBar on scroll down
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

function Navbar() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const token = localStorage.getItem("token");
  const user = token ? parseJwt(token) : null;
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAnchorEl(null);
    navigate("/login");
  };

  return (
    <HideOnScroll>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(201,149,106,0.25)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 0.8, gap: 1 }}>
            {/* Mobile menu trigger */}
            <IconButton sx={{ display: { md: 'none' }, color: 'primary.main' }}
              onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>

            {/* Logo & Brand Name */}
            <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', flexGrow: { xs: 1, md: 0 }, mr: { md: 4 } }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Sekkin.lk Logo"
                sx={{
                  height: 44,
                  width: 44,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #C9956A',
                  boxShadow: '0 2px 8px rgba(201,149,106,0.3)',
                  bgcolor: '#0a0a0a',
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                  Sekkin<span style={{ color: '#C9956A' }}>.lk</span>
                </Typography>
                <Typography variant="caption" sx={{ color: '#8c7568', fontSize: '0.62rem', letterSpacing: '1.2px', textTransform: 'uppercase', display: { xs: 'none', sm: 'block' } }}>
                  Beauty • Elegance • Confidence
                </Typography>
              </Box>
            </Box>

            {/* Desktop Nav Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flexGrow: 1, alignItems: 'center' }}>
              {[{ label: 'Shop', to: '/' }, { label: 'My Orders', to: '/orders' }].map(item => (
                <Button key={item.to} component={Link} to={item.to}
                  sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main', bgcolor: 'rgba(181,56,92,0.06)' } }}>
                  {item.label}
                </Button>
              ))}
              {isAdmin && (
                <Button component={Link} to="/admin" startIcon={<AdminPanelSettings />}
                  sx={{ color: 'primary.main', fontWeight: 700 }}>
                  Admin
                </Button>
              )}
            </Box>

            {/* Action Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Help on WhatsApp">
                <IconButton
                  component="a"
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#25D366',
                    bgcolor: 'rgba(37,211,102,0.1)',
                    '&:hover': { bgcolor: 'rgba(37,211,102,0.2)' },
                  }}
                >
                  <WhatsApp fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Cart">
                <IconButton component={Link} to="/cart" sx={{ color: 'primary.main' }}>
                  <ShoppingCart />
                </IconButton>
              </Tooltip>

              {token ? (
                <>
                  <Tooltip title="Account">
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                      <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
                        {user?.sub?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                    PaperProps={{ sx: { borderRadius: 3, minWidth: 180, mt: 1 } }}>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="caption" color="text.secondary">Signed in as</Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>{user?.sub}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem component={Link} to="/orders" onClick={() => setAnchorEl(null)}>
                      <History sx={{ mr: 1, fontSize: 18 }} /> My Orders
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem component={Link} to="/admin" onClick={() => setAnchorEl(null)}>
                        <AdminPanelSettings sx={{ mr: 1, fontSize: 18 }} /> Admin Panel
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <Logout sx={{ mr: 1, fontSize: 18 }} /> Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button component={Link} to="/login" variant="outlined" color="primary" size="small">Login</Button>
                  <Button component={Link} to="/register" variant="contained" color="primary" size="small">Sign Up</Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
}

function App() {
  return (
    <Router>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', position: 'relative' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        {/* Floating WhatsApp Help Button */}
        <Tooltip title="Need help? Chat with us on WhatsApp!" placement="left">
          <Fab
            component="a"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              bgcolor: '#25D366',
              color: '#FFFFFF',
              zIndex: 9999,
              boxShadow: '0 8px 24px rgba(37,211,102,0.4)',
              '&:hover': {
                bgcolor: '#20BA5A',
                transform: 'scale(1.06)',
              },
              transition: 'all 0.25s ease-in-out',
            }}
            aria-label="Chat on WhatsApp"
          >
            <WhatsApp sx={{ fontSize: 32 }} />
          </Fab>
        </Tooltip>

        {/* Luxury Cosmetics Footer */}
        <Box component="footer" sx={{ mt: 12, bgcolor: '#0B0709', color: 'white', borderTop: '1px solid rgba(201,149,106,0.2)' }}>
          {/* Top Trust Highlights Banner */}
          <Box sx={{ bgcolor: 'rgba(201,149,106,0.06)', py: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Container maxWidth="lg">
              <Grid container spacing={3} justifyContent="space-between" alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                    <LocalShipping sx={{ color: '#C9956A', fontSize: 28 }} />
                    <Box textAlign="left">
                      <Typography variant="subtitle2" fontWeight={700}>Islandwide Delivery</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Fast cash-on-delivery across Sri Lanka</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'center', sm: 'center' }}>
                    <Verified sx={{ color: '#C9956A', fontSize: 28 }} />
                    <Box textAlign="left">
                      <Typography variant="subtitle2" fontWeight={700}>100% Authentic</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Certified ingredients & genuine brands</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-end' }}>
                    <SupportAgent sx={{ color: '#25D366', fontSize: 28 }} />
                    <Box textAlign="left">
                      <Typography variant="subtitle2" fontWeight={700}>Direct WhatsApp Support</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Expert skincare help: 078 815 3473</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* Main Footer Content */}
          <Container maxWidth="lg" sx={{ pt: 7, pb: 5 }}>
            <Grid container spacing={{ xs: 4, md: 4 }} justifyContent="space-between">
              {/* Column 1: Brand Info & Socials */}
              <Grid item xs={12} md={3.8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    component="img"
                    src="/logo.png"
                    alt="Sekkin.lk"
                    sx={{
                      height: 56,
                      width: 56,
                      borderRadius: '50%',
                      border: '2px solid #C9956A',
                      p: 0.3,
                      bgcolor: '#000000',
                      boxShadow: '0 0 15px rgba(201,149,106,0.3)',
                    }}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '0.5px' }}>
                      Sekkin<span style={{ color: '#C9956A' }}>.lk</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#C9956A', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                      Beauty • Elegance • Confidence
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 360, lineHeight: 1.75, textAlign: 'justify' }}>
                  Sri Lanka's premier online cosmetics destination. We bring you dermatologically tested beauty essentials crafted to elevate your natural glow with authentic care.
                </Typography>

                {/* Social Media Links */}
                <Typography variant="subtitle2" sx={{ color: '#C9956A', fontWeight: 700, mb: 1.5, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  Connect With Us
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  {/* Instagram */}
                  <Tooltip title="Follow on Instagram" arrow>
                    <IconButton
                      component="a"
                      href={SOCIAL_LINKS.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                          color: 'white',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 16px rgba(220,39,67,0.4)',
                        },
                      }}
                      aria-label="Instagram"
                    >
                      <Instagram fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* Facebook */}
                  <Tooltip title="Like on Facebook" arrow>
                    <IconButton
                      component="a"
                      href={SOCIAL_LINKS.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#1877F2',
                          color: 'white',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 16px rgba(24,119,242,0.4)',
                        },
                      }}
                      aria-label="Facebook"
                    >
                      <Facebook fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* TikTok */}
                  <Tooltip title="Follow on TikTok" arrow>
                    <IconButton
                      component="a"
                      href={SOCIAL_LINKS.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#000000',
                          border: '1px solid #00f2fe',
                          color: 'white',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 16px rgba(0,242,254,0.3)',
                        },
                      }}
                      aria-label="TikTok"
                    >
                      <TikTokIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {/* WhatsApp */}
                  <Tooltip title="Chat on WhatsApp (078 815 3473)" arrow>
                    <IconButton
                      component="a"
                      href={SOCIAL_LINKS.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#25D366',
                          color: 'white',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 16px rgba(37,211,102,0.4)',
                        },
                      }}
                      aria-label="WhatsApp"
                    >
                      <WhatsApp fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Grid>

              {/* Column 2: Quick Links */}
              <Grid item xs={6} sm={3} md={2}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#C9956A', mb: 2.5, letterSpacing: '0.5px' }}>
                  Explore
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { label: 'All Products', to: '/' },
                    { label: 'Skincare', to: '/' },
                    { label: 'Cosmetics', to: '/' },
                    { label: 'New Arrivals', to: '/' },
                    { label: 'My Orders', to: '/orders' },
                  ].map((item) => (
                    <Typography
                      key={item.label}
                      component={Link}
                      to={item.to}
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                        '&:hover': { color: '#C9956A', textDecoration: 'underline' },
                      }}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Stack>
              </Grid>

              {/* Column 3: Customer Care */}
              <Grid item xs={6} sm={3} md={2.5}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#C9956A', mb: 2.5, letterSpacing: '0.5px' }}>
                  Customer Care
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { label: 'Track Order', to: '/orders' },
                    { label: 'Shopping Cart', to: '/cart' },
                    { label: 'Shipping & Delivery', to: '/' },
                    { label: 'Returns & Refunds', to: '/' },
                    { label: 'Beauty Consultation', to: '/' },
                  ].map((item) => (
                    <Typography
                      key={item.label}
                      component={Link}
                      to={item.to}
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                        '&:hover': { color: '#C9956A', textDecoration: 'underline' },
                      }}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Stack>
              </Grid>

              {/* Column 4: Contact & WhatsApp */}
              <Grid item xs={12} sm={6} md={3.2}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#C9956A', mb: 2.5, letterSpacing: '0.5px' }}>
                  Get in Touch
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Phone sx={{ color: '#25D366', fontSize: 20, mt: 0.3 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: 'white' }}>
                        +94 78 815 3473
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Mon - Sat (9:00 AM - 7:00 PM)
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <LocationOn sx={{ color: '#C9956A', fontSize: 20, mt: 0.3 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Colombo & Islandwide Delivery, Sri Lanka
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    component="a"
                    href={SOCIAL_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<WhatsApp />}
                    fullWidth
                    sx={{
                      bgcolor: '#25D366',
                      color: 'white',
                      fontWeight: 700,
                      borderRadius: 3,
                      py: 1.2,
                      mt: 1,
                      boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
                      '&:hover': {
                        bgcolor: '#20BA5A',
                        boxShadow: '0 6px 20px rgba(37,211,102,0.5)',
                      },
                    }}
                  >
                    Chat on WhatsApp
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Bottom Copyright and Legal Bar */}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 4 }} />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: { xs: 'center', sm: 'left' } }}>
                © {new Date().getFullYear()} <strong>Sekkin.lk</strong>. All rights reserved. Sri Lanka.
              </Typography>
              <Stack direction="row" spacing={3}>
                <Typography component={Link} to="/" variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', '&:hover': { color: '#C9956A' } }}>
                  Privacy Policy
                </Typography>
                <Typography component={Link} to="/" variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', '&:hover': { color: '#C9956A' } }}>
                  Terms of Service
                </Typography>
                <Typography component={Link} to="/" variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', '&:hover': { color: '#C9956A' } }}>
                  Refund Policy
                </Typography>
              </Stack>
            </Box>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

export default App;