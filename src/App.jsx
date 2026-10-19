import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge,
  Box, Drawer, List, ListItem, ListItemButton, ListItemText,
  Avatar, Menu, MenuItem, Divider, Container, useScrollTrigger,
  Slide, Tooltip, Fab
} from "@mui/material";
import {
  ShoppingCart, Favorite, Person, Menu as MenuIcon,
  AutoAwesome, AdminPanelSettings, Logout, History,
  Store, WhatsApp
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

// WhatsApp support phone number (Update this with your real business WhatsApp number)
const WHATSAPP_NUMBER = "94770000000"; 
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Sekkin.lk! I need assistance with your beauty products.")}`;

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

        {/* Luxury Footer */}
        <Box component="footer" sx={{ mt: 10, pt: 6, pb: 4, bgcolor: '#0D080A', color: 'white' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2, mb: 4 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Sekkin.lk"
                sx={{
                  height: 90,
                  width: 90,
                  borderRadius: '50%',
                  border: '2px solid #C9956A',
                  p: 0.5,
                  bgcolor: '#000000',
                  boxShadow: '0 0 25px rgba(201,149,106,0.3)',
                }}
              />
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '1px' }}>
                Sekkin<span style={{ color: '#C9956A' }}>.lk</span>
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#C9956A', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>
                Beauty • Elegance • Confidence
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 500 }}>
                Premium cosmetics curated for glowing, healthy Sri Lankan skin. Certified ingredients and authentic luxury brands.
              </Typography>
              <Button
                variant="outlined"
                component="a"
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsApp />}
                sx={{
                  color: '#25D366',
                  borderColor: '#25D366',
                  borderRadius: 6,
                  px: 3,
                  py: 1,
                  mt: 1,
                  '&:hover': {
                    borderColor: '#20BA5A',
                    bgcolor: 'rgba(37,211,102,0.1)',
                  }
                }}
              >
                Customer Support on WhatsApp
              </Button>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
              © {new Date().getFullYear()} Sekkin.lk · All rights reserved. Sri Lanka.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

export default App;