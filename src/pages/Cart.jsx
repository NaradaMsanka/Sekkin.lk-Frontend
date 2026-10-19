import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, Typography, Button, IconButton, Divider,
  Card, CardContent, Grid, Stack, Chip, Alert, Skeleton, Tooltip, Avatar
} from '@mui/material';
import { Delete, Add, Remove, ShoppingBag, ArrowBack, Spa } from '@mui/icons-material';

const API = 'http://localhost:8080/api/cart';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const res = await axios.get(API, getAuthHeaders());
      setCart(res.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to load cart.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleQty = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      await axios.put(`${API}/items/${productId}?quantity=${newQty}`, {}, getAuthHeaders());
      fetchCart();
    } catch (err) { setError(err.response?.data || 'Update failed.'); }
  };

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${API}/items/${productId}`, getAuthHeaders());
      fetchCart();
    } catch { setError('Remove failed.'); }
  };

  if (loading) return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {[1,2,3].map(i => <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 2 }} />)}
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mb: 3 }} color="inherit">
        Continue Shopping
      </Button>

      <Typography variant="h4" fontWeight={700} mb={3}>
        My Cart {cart?.items?.length > 0 && <Chip label={`${cart.items.length} items`} color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!cart || cart.items?.length === 0 ? (
        <Box textAlign="center" py={10}>
          <ShoppingBag sx={{ fontSize: 80, color: 'divider', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>Your cart is empty</Typography>
          <Typography color="text.secondary" mb={4}>Discover our premium cosmetics and add items to your cart</Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/')}>Shop Now</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {cart.items.map(item => (
                <Card key={item.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      {/* Product Image */}
                      <Grid item>
                        <Box sx={{
                          width: 80, height: 80, borderRadius: 2,
                          bgcolor: 'primary.50', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Spa sx={{ color: 'primary.light', fontSize: 36 }} />
                        </Box>
                      </Grid>

                      {/* Product Info */}
                      <Grid item xs>
                        <Typography variant="subtitle1" fontWeight={600}>{item.product.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.product.brand}</Typography>
                        <Typography variant="body1" color="primary" fontWeight={700}>
                          Rs. {item.product.price}
                        </Typography>
                      </Grid>

                      {/* Quantity Controls */}
                      <Grid item>
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 20 }}>
                          <IconButton size="small" onClick={() => handleQty(item.product.id, item.quantity - 1)} sx={{ p: 0.5 }}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ px: 1.5, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => handleQty(item.product.id, item.quantity + 1)} sx={{ p: 0.5 }}>
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>

                      {/* Subtotal */}
                      <Grid item sx={{ minWidth: 90, textAlign: 'right' }}>
                        <Typography variant="subtitle1" fontWeight={700}>Rs. {item.price?.toFixed(2)}</Typography>
                        <Tooltip title="Remove item">
                          <IconButton size="small" onClick={() => handleRemove(item.product.id)} color="error">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', position: 'sticky', top: 80 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>Order Summary</Typography>

                {cart.items.map(item => (
                  <Stack key={item.id} direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 160 }}>
                      {item.product.name} ×{item.quantity}
                    </Typography>
                    <Typography variant="body2">Rs. {item.price?.toFixed(2)}</Typography>
                  </Stack>
                ))}

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>Rs. {cart.totalPrice?.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">Delivery</Typography>
                  <Chip label="FREE" color="success" size="small" />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight={700}>Total</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    Rs. {cart.totalPrice?.toFixed(2)}
                  </Typography>
                </Stack>

                <Button fullWidth variant="contained" size="large"
                  onClick={() => navigate('/checkout')} sx={{ py: 1.5 }}>
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}