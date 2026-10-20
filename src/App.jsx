import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge,
  Box, Drawer, List, ListItem, ListItemButton, ListItemText, ListItemIcon,
  Avatar, Menu, MenuItem, Divider, Container, useScrollTrigger,
  Slide, Tooltip, Fab, Grid, Stack, SvgIcon, Chip
} from "@mui/material";
import {
  ShoppingCart, Favorite, Person, Menu as MenuIcon, Close,
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
    <>
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
          <Toolbar sx={{ py: 0.8, px: { xs: 0.5, sm: 2 }, gap: { xs: 0.5, sm: 1 }, justifyContent: 'space-between' }}>
            {/* Mobile menu trigger */}
            <IconButton
              sx={{ display: { md: 'none' }, color: 'primary.main', p: { xs: 0.7, sm: 1 } }}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open mobile menu"
            >
              <MenuIcon />
            </IconButton>

            {/* Logo & Brand Name */}
            <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.2, textDecoration: 'none', flexGrow: { xs: 1, md: 0 }, mr: { md: 4 } }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Sekkin.lk Logo"
                sx={{
                  height: { xs: 38, sm: 44 },
                  width: { xs: 38, sm: 44 },
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #C9956A',
                  boxShadow: '0 2px 8px rgba(201,149,106,0.3)',
                  bgcolor: '#0a0a0a',
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.1, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
                  Sekkin<span style={{ color: '#C9956A' }}>.lk</span>
                </Typography>
                <Typography variant="caption" sx={{ color: '#8c7568', fontSize: '0.58rem', letterSpacing: '1px', textTransform: 'uppercase', display: { xs: 'none', sm: 'block' } }}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
              <Tooltip title="Help on WhatsApp">
                <IconButton
                  component="a"
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#25D366',
                    bgcolor: 'rgba(37,211,102,0.1)',
                    p: { xs: 0.8, sm: 1 },
                    '&:hover': { bgcolor: 'rgba(37,211,102,0.2)' },
                  }}
                  aria-label="WhatsApp Support"
                >
                  <WhatsApp sx={{ fontSize: { xs: 20, sm: 22 } }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Cart">
                <IconButton component={Link} to="/cart" sx={{ color: 'primary.main', p: { xs: 0.8, sm: 1 } }} aria-label="Cart">
                  <ShoppingCart sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
              </Tooltip>

              {token ? (
                <>
                  <Tooltip title="Account">
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }} aria-label="Account">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
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
                <>
                  <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                    <Button component={Link} to="/login" variant="outlined" color="primary" size="small">Login</Button>
                    <Button component={Link} to="/register" variant="contained" color="primary" size="small">Sign Up</Button>
                  </Box>
                  <Tooltip title="Login">
                    <IconButton component={Link} to="/login" sx={{ display: { xs: 'flex', sm: 'none' }, color: 'primary.main', p: 0.8 }} aria-label="Login">
                      <Person sx={{ fontSize: 22 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>

      {/* Mobile Drawer (iPhone & Android Responsive Menu) */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: 280, sm: 320 },
            bgcolor: '#FFFFFF',
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }
        }}
      >
        <Box>
          {/* Drawer Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Sekkin.lk"
                sx={{
                  height: 38,
                  width: 38,
                  borderRadius: '50%',
                  border: '2px solid #C9956A',
                }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'primary.main', lineHeight: 1.1 }}>
                  Sekkin<span style={{ color: '#C9956A' }}>.lk</span>
                </Typography>
                <Typography variant="caption" sx={{ color: '#8c7568', fontSize: '0.62rem', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Beauty • Elegance
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} size="small" aria-label="Close menu">
              <Close />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* Navigation Links */}
          <List sx={{ p: 0 }}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton component={Link} to="/" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ minWidth: 38, color: 'primary.main' }}><Store fontSize="small" /></ListItemIcon>
                <ListItemText primary="Shop Catalog" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton component={Link} to="/cart" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ minWidth: 38, color: 'primary.main' }}><ShoppingCart fontSize="small" /></ListItemIcon>
                <ListItemText primary="Shopping Cart" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton component={Link} to="/orders" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ minWidth: 38, color: 'primary.main' }}><History fontSize="small" /></ListItemIcon>
                <ListItemText primary="My Orders" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
            {isAdmin && (
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton component={Link} to="/admin" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, bgcolor: 'rgba(181,56,92,0.06)' }}>
                  <ListItemIcon sx={{ minWidth: 38, color: 'primary.main' }}><AdminPanelSettings fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Admin Panel" primaryTypographyProps={{ fontWeight: 700, color: 'primary.main' }} />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>

        {/* Drawer Bottom Actions */}
        <Box sx={{ pt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          {token ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Signed in as</Typography>
              <Typography variant="body2" fontWeight={700} noWrap sx={{ mb: 1.5 }}>{user?.sub}</Typography>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="small"
                startIcon={<Logout />}
                onClick={() => { setDrawerOpen(false); handleLogout(); }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Button
                fullWidth
                component={Link}
                to="/login"
                variant="outlined"
                color="primary"
                onClick={() => setDrawerOpen(false)}
              >
                Login
              </Button>
              <Button
                fullWidth
                component={Link}
                to="/register"
                variant="contained"
                color="primary"
                onClick={() => setDrawerOpen(false)}
              >
                Sign Up
              </Button>
            </Stack>
          )}

          <Button
            fullWidth
            component="a"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<WhatsApp />}
            sx={{
              bgcolor: '#25D366',
              color: 'white',
              fontWeight: 700,
              borderRadius: 2,
              py: 1,
              '&:hover': { bgcolor: '#20BA5A' }
            }}
          >
            WhatsApp Support
          </Button>
        </Box>
      </Drawer>
    </>
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
              bottom: { xs: 20, sm: 28 },
              right: { xs: 16, sm: 28 },
              bgcolor: '#25D366',
              color: '#FFFFFF',
              zIndex: 1300,
              width: { xs: 50, sm: 58 },
              height: { xs: 50, sm: 58 },
              boxShadow: '0 8px 24px rgba(37,211,102,0.45)',
              '&:hover': {
                bgcolor: '#20BA5A',
                transform: 'scale(1.08)',
              },
              transition: 'all 0.25s ease-in-out',
            }}
            aria-label="Chat on WhatsApp"
          >
            <WhatsApp sx={{ fontSize: { xs: 26, sm: 32 } }} />
          </Fab>
        </Tooltip>

        {/* Luxury Cosmetics Footer - Upper Bar Removed & Justified Order */}
        <Box component="footer" sx={{ mt: { xs: 8, md: 12 }, bgcolor: '#0B0709', color: 'white', borderTop: '1px solid rgba(201,149,106,0.25)' }}>
          <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 10, sm: 5 } }}>
            <Grid container spacing={{ xs: 4, sm: 3, md: 4 }} justifyContent="space-between" alignItems="flex-start">
              {/* Column 1: Brand Info & Socials */}
              <Grid item xs={12} sm={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    component="img"
                    src="/logo.png"
                    alt="Sekkin.lk"
                    sx={{
                      height: 52,
                      width: 52,
                      borderRadius: '50%',
                      border: '2px solid #C9956A',
                      p: 0.3,
                      bgcolor: '#000000',
                      boxShadow: '0 0 15px rgba(201,149,106,0.3)',
                    }}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '0.5px', lineHeight: 1.15 }}>
                      Sekkin<span style={{ color: '#C9956A' }}>.lk</span>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#C9956A', letterSpacing: '1.8px', textTransform: 'uppercase', fontWeight: 600, display: 'block', mt: 0.3 }}>
                      Beauty • Elegance • Confidence
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 380, lineHeight: 1.8, fontSize: '0.88rem', textAlign: 'left' }}>
                  Sri Lanka's premier online cosmetics destination. We bring you dermatologically tested beauty essentials crafted to elevate your natural glow with authentic care.
                </Typography>

                {/* Social Media Links */}
                <Typography variant="caption" sx={{ color: '#C9956A', fontWeight: 700, mb: 1.5, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block' }}>
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
              <Grid item xs={6} sm={4} md={2}>
                <Typography variant="subtitle2" sx={{ color: '#C9956A', fontWeight: 800, mb: 2.5, letterSpacing: '1px', textTransform: 'uppercase' }}>
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
                        display: 'inline-block',
                        transition: 'all 0.2s ease',
                        '&:hover': { color: '#C9956A', transform: 'translateX(3px)' },
                      }}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Stack>
              </Grid>

              {/* Column 3: Customer Care */}
              <Grid item xs={6} sm={4} md={2.4}>
                <Typography variant="subtitle2" sx={{ color: '#C9956A', fontWeight: 800, mb: 2.5, letterSpacing: '1px', textTransform: 'uppercase' }}>
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
                        display: 'inline-block',
                        transition: 'all 0.2s ease',
                        '&:hover': { color: '#C9956A', transform: 'translateX(3px)' },
                      }}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Stack>
              </Grid>

              {/* Column 4: Contact & WhatsApp */}
              <Grid item xs={12} sm={4} md={3.4}>
                <Typography variant="subtitle2" sx={{ color: '#C9956A', fontWeight: 800, mb: 2.5, letterSpacing: '1px', textTransform: 'uppercase' }}>
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
                      mt: 0.5,
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
              <Stack direction="row" spacing={{ xs: 2, sm: 3 }} justifyContent="center">
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