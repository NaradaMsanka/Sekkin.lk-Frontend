import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Grid, Card, CardContent, Typography, TextField,
  Button, Box, Stack, Divider, Alert, Chip, Stepper, Step, StepLabel,
  InputAdornment, Collapse
} from '@mui/material';
import {
  LocationOn, LocalOffer, CheckCircle, ShoppingBag, ArrowBack, Payment
} from '@mui/icons-material';

export default function Checkout() {
  const [address, setAddress] = useState('');
  const [coupon, setCoupon] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const VALID_COUPONS = { GLOW10: '10% off', WELCOME10: '10% off', SAVE500: 'Rs.500 off (min Rs.2500)' };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      await axios.post('http://localhost:8080/api/orders', {
        shippingAddress: address,
        couponCode: coupon.trim().toUpperCase() || null
      }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      setIsSuccess(true);
      setMessage('Order placed successfully!');
      setTimeout(() => navigate('/orders'), 2500);
    } catch (err) {
      setMessage(err.response?.data || 'Checkout failed. Please check your cart.');
    } finally { setLoading(false); }
  };

  if (isSuccess) return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
      <Typography variant="h4" fontWeight={800} gutterBottom>Order Placed! 🎉</Typography>
      <Typography color="text.secondary" mb={4}>
        Thank you! Your order has been confirmed. Redirecting to orders...
      </Typography>
      <Button variant="contained" onClick={() => navigate('/orders')}>View My Orders</Button>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/cart')} sx={{ mb: 3 }} color="inherit">
        Back to Cart
      </Button>

      <Typography variant="h4" fontWeight={700} mb={4}>Checkout</Typography>

      <Grid container spacing={4}>
        {/* Form */}
        <Grid item xs={12} md={7}>
          <Box component="form" onSubmit={handleCheckout}>
            {/* Shipping */}
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                  <LocationOn color="primary" />
                  <Typography variant="h6" fontWeight={700}>Shipping Address</Typography>
                </Stack>
                <TextField fullWidth multiline rows={4} label="Full delivery address" required
                  value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="House No, Street, City, Province..."
                  helperText="Please provide your complete delivery address" />
              </CardContent>
            </Card>

            {/* Coupon */}
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <LocalOffer color="secondary" />
                  <Typography variant="h6" fontWeight={700}>Coupon Code</Typography>
                  <Chip label="Optional" size="small" variant="outlined" />
                </Stack>
                <TextField fullWidth label="Enter coupon code"
                  value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                  placeholder="e.g. GLOW10"
                  InputProps={{ endAdornment: coupon && VALID_COUPONS[coupon] ? <Chip label={VALID_COUPONS[coupon]} color="success" size="small" /> : null }}
                  sx={{ mb: 2 }} />
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {Object.entries(VALID_COUPONS).map(([code, desc]) => (
                    <Chip key={code} label={`${code}: ${desc}`} variant="outlined" color="secondary" size="small"
                      onClick={() => setCoupon(code)} clickable />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {message && !isSuccess && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>
            )}

            <Button fullWidth type="submit" variant="contained" size="large"
              disabled={loading} startIcon={<Payment />}
              sx={{ py: 1.8, fontSize: '1.05rem' }}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </Box>
        </Grid>

        {/* Summary */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', position: 'sticky', top: 80 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <ShoppingBag color="primary" />
                <Typography variant="h6" fontWeight={700}>Order Summary</Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5} mb={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Delivery</Typography>
                  <Chip label="FREE" color="success" size="small" />
                </Stack>
                {coupon && VALID_COUPONS[coupon] && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="success.main">Coupon ({coupon})</Typography>
                    <Typography color="success.main">− {VALID_COUPONS[coupon]}</Typography>
                  </Stack>
                )}
              </Stack>

              <Divider sx={{ mb: 2 }} />
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>Available Coupons:</Typography>
                <Stack spacing={0.5}>
                  <Typography variant="caption">🌸 <strong>GLOW10</strong> — 10% off all orders</Typography>
                  <Typography variant="caption">👋 <strong>WELCOME10</strong> — 10% welcome discount</Typography>
                  <Typography variant="caption">💰 <strong>SAVE500</strong> — Rs.500 off (min Rs.2500)</Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}