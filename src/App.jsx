import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar, Footer, SupportButton } from './components/SiteChrome';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import BusinessPage, { BusinessNotFound } from './pages/BusinessPage';
import RouteScroll from './components/RouteScroll';
import { businessPages } from './content/businessPages';

export default function App() {
  return (
    <Router>
      <RouteScroll />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box component="a" href="#main-content" sx={{
          position: 'fixed', top: 8, left: 8, zIndex: 1500,
          px: 2, py: 1.5, bgcolor: 'primary.main', color: 'white', borderRadius: 2,
          transform: 'translateY(-160%)', '&:focus': { transform: 'translateY(0)' },
        }}>
          Skip to content
        </Box>
        <Navbar />
        <Box component="main" id="main-content" tabIndex={-1} sx={{ outline: 'none' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {Object.keys(businessPages).map(pageKey => <Route key={pageKey} path={`/${pageKey}`} element={<BusinessPage pageKey={pageKey} />} />)}
            <Route path="*" element={<BusinessNotFound />} />
          </Routes>
        </Box>
        <Footer />
        <SupportButton />
      </Box>
    </Router>
  );
}
