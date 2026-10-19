import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Grid, Card, CardContent, Typography, Box, Stack,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, Skeleton, Avatar, Divider, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from "@mui/material";
import {
  Dashboard, Inventory, Receipt, People, TrendingUp,
  Warning, Add, Delete, Refresh, AdminPanelSettings
} from "@mui/icons-material";

const API = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

const STATUS_COLORS = { PENDING: 'warning', PROCESSING: 'info', SHIPPED: 'primary', DELIVERED: 'success', CANCELLED: 'error' };

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0, lowStockProducts: [], recentOrders: [] });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', brand: '', price: '', stockQuantity: '', skinType: '', description: '', discountPrice: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [statsRes, prodsRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, headers),
        axios.get(`${API}/products`),
      ]);
      setStats(statsRes.data);
      setProducts(prodsRes.data);
      try {
        const ordersRes = await axios.get(`${API}/orders`, headers);
        setOrders(ordersRes.data);
      } catch { setOrders(statsRes.data.recentOrders || []); }
    } catch (e) {
      setError(e.response?.status === 403 ? "Access denied. Admin role required." : "Failed to load dashboard data.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/products`, {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockQuantity: parseInt(newProduct.stockQuantity, 10),
        discountPrice: newProduct.discountPrice ? parseFloat(newProduct.discountPrice) : null,
        status: "ACTIVE",
      }, getAuthHeaders());
      setSnack({ open: true, msg: 'Product added successfully! ✅', severity: 'success' });
      setNewProduct({ name: '', brand: '', price: '', stockQuantity: '', skinType: '', description: '', discountPrice: '' });
      fetchAll();
    } catch (e) {
      setSnack({ open: true, msg: e.response?.data || 'Failed to add product.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API}/products/${id}`, getAuthHeaders());
      setProducts(prev => prev.filter(p => p.id !== id));
      setSnack({ open: true, msg: 'Product deleted.', severity: 'info' });
    } catch { setSnack({ open: true, msg: 'Delete failed.', severity: 'error' }); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, { status }, getAuthHeaders());
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setSnack({ open: true, msg: 'Order status updated! ✅', severity: 'success' });
    } catch { setSnack({ open: true, msg: 'Status update failed.', severity: 'error' }); }
  };

  const STAT_CARDS = [
    { label: 'Total Revenue', value: `Rs. ${stats.totalRevenue?.toLocaleString() || 0}`, icon: <TrendingUp />, color: '#B5385C', bg: '#FDF0F4' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <Receipt />, color: '#7B1F3A', bg: '#F5E6EA' },
    { label: 'Products', value: stats.totalProducts, icon: <Inventory />, color: '#C9956A', bg: '#FDF5EE' },
    { label: 'Customers', value: stats.totalUsers, icon: <People />, color: '#5C6BC0', bg: '#EEF0F8' },
  ];

  if (loading) return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {[1,2,3,4].map(i => <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} /></Grid>)}
      </Grid>
    </Container>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <AdminPanelSettings sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={800}>Admin Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">SekkinLK Management Panel</Typography>
          </Box>
        </Stack>
        <Button startIcon={<Refresh />} onClick={fetchAll} variant="outlined">Refresh</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stat Cards */}
      <Grid container spacing={2.5} mb={4}>
        {STAT_CARDS.map(card => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ height: 4, bgcolor: card.color }} />
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>{card.label}</Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: card.color }}>{card.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 48, height: 48 }}>{card.icon}</Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab icon={<Dashboard />} iconPosition="start" label="Overview" />
        <Tab icon={<Inventory />} iconPosition="start" label="Products" />
        <Tab icon={<Receipt />} iconPosition="start" label="Orders" />
      </Tabs>

      {/* TAB 0: OVERVIEW */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Warning color="warning" />
                  <Typography variant="h6" fontWeight={700}>Low Stock Alerts</Typography>
                  {stats.lowStockProducts?.length > 0 && <Chip label={stats.lowStockProducts.length} color="warning" size="small" />}
                </Stack>
                {stats.lowStockProducts?.length === 0 ? (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>All products have sufficient stock ✅</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Product', 'Brand', 'Stock'].map(h => <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{h}</TableCell>)}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.lowStockProducts.map(p => (
                          <TableRow key={p.id}>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>{p.brand}</TableCell>
                            <TableCell><Chip label={p.stockQuantity} color={p.stockQuantity === 0 ? 'error' : 'warning'} size="small" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Receipt color="primary" />
                  <Typography variant="h6" fontWeight={700}>Recent Orders</Typography>
                </Stack>
                {stats.recentOrders?.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={3}>No orders yet</Typography>
                ) : (
                  stats.recentOrders.map(o => (
                    <Box key={o.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>#{o.id} — {o.customerEmail}</Typography>
                        <Typography variant="caption" color="text.secondary">Rs. {o.totalAmount}</Typography>
                      </Box>
                      <Chip label={o.status} color={STATUS_COLORS[o.status] || 'default'} size="small" />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: PRODUCTS */}
      {tab === 1 && (
        <Box>
          {/* Add Product Form */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Add color="primary" />
                <Typography variant="h6" fontWeight={700}>Add New Product</Typography>
              </Stack>
              <Box component="form" onSubmit={handleAddProduct}>
                <Grid container spacing={2}>
                  {[
                    { label: 'Product Name*', key: 'name', required: true },
                    { label: 'Brand*', key: 'brand', required: true },
                    { label: 'Price (Rs.)*', key: 'price', type: 'number', required: true },
                    { label: 'Discount Price (Rs.)', key: 'discountPrice', type: 'number' },
                    { label: 'Stock Quantity*', key: 'stockQuantity', type: 'number', required: true },
                    { label: 'Skin Type', key: 'skinType' },
                  ].map(field => (
                    <Grid item xs={12} sm={6} md={4} key={field.key}>
                      <TextField fullWidth size="small" label={field.label} type={field.type || 'text'}
                        required={field.required}
                        value={newProduct[field.key]}
                        onChange={e => setNewProduct(p => ({ ...p, [field.key]: e.target.value }))} />
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label="Description" multiline rows={2}
                      value={newProduct.description}
                      onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" startIcon={<Add />}>Add Product</Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Products Table */}
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  {['ID', 'Name', 'Brand', 'Price', 'Discount', 'Stock', 'Skin Type', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell><Typography variant="caption" fontWeight={700}>#{p.id}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{p.name}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{p.brand}</Typography></TableCell>
                    <TableCell><Typography variant="body2">Rs. {p.price}</Typography></TableCell>
                    <TableCell>{p.discountPrice ? <Chip label={`Rs. ${p.discountPrice}`} color="success" size="small" /> : '—'}</TableCell>
                    <TableCell>
                      <Chip label={p.stockQuantity} size="small"
                        color={p.stockQuantity === 0 ? 'error' : p.stockQuantity <= 10 ? 'warning' : 'default'} />
                    </TableCell>
                    <TableCell>{p.skinType || '—'}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 2: ORDERS */}
      {tab === 2 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                {['Order ID', 'Customer', 'Total', 'Current Status', 'Update Status'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id} hover>
                  <TableCell><Typography fontWeight={700} color="primary">#{order.id}</Typography></TableCell>
                  <TableCell>{order.customerEmail || order.user?.email || '—'}</TableCell>
                  <TableCell><Typography fontWeight={600}>Rs. {order.totalAmount}</Typography></TableCell>
                  <TableCell>
                    <Chip label={order.status} color={STATUS_COLORS[order.status] || 'default'} size="small" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select value={order.status} onChange={e => handleStatusUpdate(order.id, e.target.value)}>
                        {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
}