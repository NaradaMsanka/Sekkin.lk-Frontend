import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Container, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Button,
  Skeleton, Alert, Stack, Card, CardContent, Divider
} from '@mui/material';
import { History, ShoppingBag, Refresh, ReceiptLong } from '@mui/icons-material';

const STATUS_CONFIG = {
  PENDING:    { color: 'warning',  label: 'Pending' },
  PROCESSING: { color: 'info',     label: 'Processing' },
  SHIPPED:    { color: 'primary',  label: 'Shipped' },
  DELIVERED:  { color: 'success',  label: 'Delivered' },
  CANCELLED:  { color: 'error',    label: 'Cancelled' },
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      else setError('Failed to load orders.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const totalSpent = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <History sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>My Orders</Typography>
        </Stack>
        <Button startIcon={<Refresh />} onClick={fetchOrders} variant="outlined" size="small">Refresh</Button>
      </Stack>

      {/* Stats Cards */}
      {!loading && orders.length > 0 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
          {[
            { label: 'Total Orders', value: orders.length, color: 'primary.main' },
            { label: 'Total Spent', value: `Rs. ${totalSpent.toFixed(2)}`, color: 'secondary.main' },
            { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length, color: 'success.main' },
          ].map(stat => (
            <Card key={stat.label} elevation={0} sx={{ flex: 1, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Stack spacing={2}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />)}
        </Stack>
      ) : orders.length === 0 ? (
        <Box textAlign="center" py={10}>
          <ReceiptLong sx={{ fontSize: 80, color: 'divider', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>No orders yet</Typography>
          <Typography color="text.secondary" mb={4}>Start shopping to see your orders here</Typography>
          <Button variant="contained" size="large" startIcon={<ShoppingBag />} onClick={() => navigate('/')}>
            Shop Now
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                {['Order ID', 'Date', 'Shipping Address', 'Total', 'Status'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => {
                const s = STATUS_CONFIG[order.status] || { color: 'default', label: order.status };
                return (
                  <TableRow key={order.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary">#{order.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="body2" noWrap>{order.shippingAddress}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>Rs. {order.totalAmount?.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={s.label} color={s.color} size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}