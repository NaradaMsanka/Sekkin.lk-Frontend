import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, Grid, Card, CardContent, Typography, Box, Stack,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, Skeleton, Avatar, Divider, IconButton, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Tooltip,
  InputAdornment, CircularProgress
} from "@mui/material";
import {
  Dashboard, Inventory, Receipt, People, TrendingUp,
  Warning, Add, Delete, Refresh, AdminPanelSettings, Edit,
  CheckCircle, Search, LocalShipping,
  AttachMoney, ShoppingBag, ArrowUpward, ArrowDownward,
  Close, Save, Spa, PhotoLibrary
} from "@mui/icons-material";
import ImageSequenceManager from "../components/ImageSequenceManager";

const API = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

const STATUS_COLORS = {
  PENDING: 'warning',
  PROCESSING: 'info',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error'
};

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  // Stats & Data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockProducts: [],
    recentOrders: []
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Search & Filter
  const [productSearch, setProductSearch] = useState("");
  const [orderFilterStatus, setOrderFilterStatus] = useState("ALL");

  // Add Product State
  const [newProduct, setNewProduct] = useState({
    name: '', brand: '', price: '', discountPrice: '', stockQuantity: '',
    skinType: '', description: '', ingredients: '', status: 'ACTIVE',
    imageUrl: '', images: []
  });

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', brand: '', price: '', discountPrice: '', stockQuantity: '',
    skinType: '', description: '', ingredients: '', status: 'ACTIVE',
    imageUrl: '', images: []
  });

  const fetchAll = async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setError("");
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
      } catch {
        setOrders(statsRes.data.recentOrders || []);
      }
    } catch (e) {
      setError(e.response?.status === 403
        ? "Access denied. You need an active ADMIN account to access this panel."
        : "Failed to connect to the backend server. Make sure Spring Boot is running.");
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(true);
  }, []);

  // 1. ADD NEW PRODUCT
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddingProduct(true);
    try {
      const primaryImg = newProduct.images?.[0] || newProduct.imageUrl || '';
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockQuantity: parseInt(newProduct.stockQuantity, 10),
        discountPrice: newProduct.discountPrice ? parseFloat(newProduct.discountPrice) : null,
        status: newProduct.status || "ACTIVE",
        imageUrl: primaryImg,
        images: JSON.stringify(newProduct.images || (primaryImg ? [primaryImg] : []))
      };

      const res = await axios.post(`${API}/products`, payload, getAuthHeaders());

      setSnack({ open: true, msg: `Product "${newProduct.name}" added successfully! ✅`, severity: 'success' });
      setNewProduct({
        name: '', brand: '', price: '', discountPrice: '', stockQuantity: '',
        skinType: '', description: '', ingredients: '', status: 'ACTIVE',
        imageUrl: '', images: []
      });

      if (res.data) {
        setProducts(prev => [res.data, ...prev]);
      }
      fetchAll(false);
    } catch (e) {
      setSnack({ open: true, msg: e.response?.data?.message || e.response?.data || 'Failed to add product.', severity: 'error' });
    } finally {
      setAddingProduct(false);
    }
  };

  // 2. OPEN EDIT MODAL
  const handleOpenEdit = (product) => {
    let parsedImages = [];
    if (product.images) {
      try {
        parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      } catch {
        parsedImages = product.images.split(',').filter(Boolean);
      }
    } else if (product.imageUrl) {
      parsedImages = [product.imageUrl];
    }

    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      brand: product.brand || '',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      stockQuantity: product.stockQuantity ?? '',
      skinType: product.skinType || '',
      description: product.description || '',
      ingredients: product.ingredients || '',
      status: product.status || 'ACTIVE',
      imageUrl: product.imageUrl || (parsedImages[0] || ''),
      images: parsedImages
    });
  };

  // 3. SAVE PRODUCT DETAILS UPDATE
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      const primaryImg = editForm.images?.[0] || editForm.imageUrl || '';
      const payload = {
        name: editForm.name,
        brand: editForm.brand,
        price: parseFloat(editForm.price),
        discountPrice: editForm.discountPrice ? parseFloat(editForm.discountPrice) : null,
        stockQuantity: parseInt(editForm.stockQuantity, 10),
        skinType: editForm.skinType,
        description: editForm.description,
        ingredients: editForm.ingredients,
        status: editForm.status,
        imageUrl: primaryImg,
        images: JSON.stringify(editForm.images || (primaryImg ? [primaryImg] : []))
      };

      const res = await axios.put(`${API}/products/${editingProduct.id}`, payload, getAuthHeaders());

      // Optimistic update: show new product values and image immediately without freezing UI
      const updatedProduct = res.data || { ...editingProduct, ...payload, id: editingProduct.id };
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));

      setSnack({ open: true, msg: `Product #${editingProduct.id} updated successfully! ✅`, severity: 'success' });
      setEditingProduct(null);
      fetchAll(false);
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data?.message || 'Failed to update product details.', severity: 'error' });
    } finally {
      setSavingEdit(false);
    }
  };

  // 4. QUICK STOCK ADJUSTMENT (+10 / -5 / custom)
  const handleQuickStockAdjust = async (product, change) => {
    const newQty = Math.max(0, (product.stockQuantity || 0) + change);
    try {
      await axios.put(`${API}/products/${product.id}`, {
        name: product.name,
        brand: product.brand,
        price: parseFloat(product.price),
        discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : null,
        stockQuantity: newQty,
        skinType: product.skinType,
        description: product.description,
        ingredients: product.ingredients,
        status: product.status || 'ACTIVE',
        imageUrl: product.imageUrl,
        images: product.images
      }, getAuthHeaders());

      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockQuantity: newQty } : p));
      setSnack({ open: true, msg: `Stock updated for ${product.name}: ${newQty} units`, severity: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Quick stock update failed.', severity: 'error' });
    }
  };

  // 5. DELETE PRODUCT
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await axios.delete(`${API}/products/${id}`, getAuthHeaders());
      setProducts(prev => prev.filter(p => p.id !== id));
      setSnack({ open: true, msg: `Product "${name}" deleted.`, severity: 'info' });
      fetchAll();
    } catch {
      setSnack({ open: true, msg: 'Delete failed. Check if product is in active orders.', severity: 'error' });
    }
  };

  // 6. UPDATE ORDER STATUS
  const handleStatusUpdate = async (orderId, status) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, { status }, getAuthHeaders());
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setSnack({ open: true, msg: `Order #${orderId} marked as ${status}! ✅`, severity: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Order status update failed.', severity: 'error' });
    }
  };

  // Calculated Inventory & Order Metrics
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.stockQuantity || 0)), 0);
  const outOfStockCount = products.filter(p => (p.stockQuantity || 0) <= 0).length;
  const lowStockCount = products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 10).length;

  const deliveredOrdersCount = orders.filter(o => o.status === 'DELIVERED').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.skinType?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    if (orderFilterStatus === 'ALL') return true;
    return o.status === orderFilterStatus;
  });

  const STAT_CARDS = [
    { label: 'Total Sales Revenue', value: `Rs. ${stats.totalRevenue?.toLocaleString() || 0}`, icon: <TrendingUp />, color: '#B5385C', bg: '#FDF0F4' },
    { label: 'Total Orders', value: stats.totalOrders || orders.length, icon: <Receipt />, color: '#7B1F3A', bg: '#F5E6EA' },
    { label: 'Total Catalog Items', value: products.length, icon: <Inventory />, color: '#C9956A', bg: '#FDF5EE' },
    { label: 'Total Inventory Stock', value: `${totalStockUnits} units`, icon: <ShoppingBag />, color: '#2E7D32', bg: '#EDF7ED' },
  ];

  if (loading) {
    return (
      <Container sx={{ py: 6 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width={300} height={40} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={4}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            component="img"
            src="/logo.png"
            alt="Sekkin.lk"
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: '2px solid #C9956A',
              bgcolor: '#000000',
              p: 0.2
            }}
          />
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
              Admin Management Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sekkin.lk • Product Catalog, Stock Reports & Order Management
            </Typography>
          </Box>
        </Stack>
        <Button startIcon={<Refresh />} onClick={fetchAll} variant="outlined" color="primary" sx={{ borderRadius: 2.5 }}>
          Refresh Data
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Top Stat Cards */}
      <Grid container spacing={2.5} mb={4}>
        {STAT_CARDS.map(card => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ height: 4, bgcolor: card.color }} />
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                      {card.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: card.color, mt: 0.5 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 48, height: 48 }}>
                    {card.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Navigation Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 700, fontSize: '0.95rem', py: 1.5 }
        }}
      >
        <Tab icon={<Dashboard />} iconPosition="start" label="Overview" />
        <Tab icon={<Inventory />} iconPosition="start" label={`Products (${products.length})`} />
        <Tab icon={<Warning />} iconPosition="start" label={`Stock Report (${lowStockCount + outOfStockCount} Alerts)`} />
        <Tab icon={<Receipt />} iconPosition="start" label={`Order Reports (${orders.length})`} />
      </Tabs>

      {/* ================= TAB 0: OVERVIEW & QUICK ACTIONS ================= */}
      {tab === 0 && (
        <Grid container spacing={3}>
          {/* Inventory Health Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Inventory color="primary" />
                    <Typography variant="h6" fontWeight={700}>Inventory Stock Summary</Typography>
                  </Stack>
                  <Button size="small" onClick={() => setTab(2)}>View Full Stock</Button>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 1.5, bgcolor: '#FDF0F4', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Total Value</Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="#B5385C">
                        Rs. {(totalInventoryValue / 1000).toFixed(1)}k
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 1.5, bgcolor: '#EDF7ED', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Total Units</Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="success.main">
                        {totalStockUnits}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 1.5, bgcolor: '#FFF8E1', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Low Stock</Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="warning.main">
                        {lowStockCount}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 1.5, bgcolor: '#FFEBEE', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Out of Stock</Typography>
                      <Typography variant="subtitle1" fontWeight={700} color="error.main">
                        {outOfStockCount}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Low Stock Items preview */}
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 3, mb: 1.5 }}>
                  Items Needing Attention:
                </Typography>
                {products.filter(p => (p.stockQuantity || 0) <= 10).slice(0, 4).map(p => (
                  <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={p.stockQuantity === 0 ? "OUT OF STOCK" : `${p.stockQuantity} left`}
                        color={p.stockQuantity === 0 ? "error" : "warning"}
                        size="small"
                      />
                      <Button size="small" variant="outlined" onClick={() => handleQuickStockAdjust(p, 10)}>
                        +10
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Orders Activity Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3.5 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Receipt color="primary" />
                    <Typography variant="h6" fontWeight={700}>Order Fulfillment Status</Typography>
                  </Stack>
                  <Button size="small" onClick={() => setTab(3)}>View All Orders</Button>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                <Stack direction="row" spacing={2} mb={3}>
                  <Box sx={{ flex: 1, p: 2, bgcolor: '#E3F2FD', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Pending / Processing</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary.main">{pendingOrdersCount}</Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 2, bgcolor: '#E8F5E9', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Delivered Successfully</Typography>
                    <Typography variant="h5" fontWeight={800} color="success.main">{deliveredOrdersCount}</Typography>
                  </Box>
                </Stack>

                <Typography variant="subtitle2" fontWeight={700} mb={1}>Recent Customer Orders:</Typography>
                {orders.slice(0, 5).map(o => (
                  <Box key={o.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="primary">Order #{o.id}</Typography>
                      <Typography variant="caption" color="text.secondary">{o.customerEmail || o.user?.email || 'Guest'}</Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" fontWeight={700}>Rs. {o.totalAmount?.toLocaleString()}</Typography>
                      <Chip label={o.status} color={STATUS_COLORS[o.status] || 'default'} size="small" />
                    </Stack>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ================= TAB 1: PRODUCT LIST, DETAILS & CREATION ================= */}
      {tab === 1 && (
        <Box>
          {/* Add New Product Section */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3.5, mb: 4 }}>
            <CardContent sx={{ p: 3.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main' }}>
                  <Add />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Add New Product to Website</Typography>
                  <Typography variant="caption" color="text.secondary">Add fresh cosmetic items with prices, discounts, and inventory</Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleAddProduct}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <ImageSequenceManager
                      images={newProduct.images || []}
                      onChange={(updatedImages, primaryUrl) => {
                        setNewProduct(p => ({ ...p, images: updatedImages, imageUrl: primaryUrl }));
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField fullWidth size="small" label="Product Name *" required
                      value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField fullWidth size="small" label="Brand Name *" required
                      value={newProduct.brand} onChange={e => setNewProduct(p => ({ ...p, brand: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField fullWidth size="small" label="Regular Price (Rs.) *" type="number" required
                      value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField fullWidth size="small" label="Discount / Sale Price (Rs.)" type="number"
                      helperText="Leave empty if no discount"
                      value={newProduct.discountPrice} onChange={e => setNewProduct(p => ({ ...p, discountPrice: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField fullWidth size="small" label="Stock Quantity *" type="number" required
                      value={newProduct.stockQuantity} onChange={e => setNewProduct(p => ({ ...p, stockQuantity: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField fullWidth size="small" label="Skin Type (e.g. Oily, Dry, Sensitive)"
                      value={newProduct.skinType} onChange={e => setNewProduct(p => ({ ...p, skinType: e.target.value }))} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" label="Product Description" multiline rows={2}
                      value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth size="small" label="Key Ingredients" multiline rows={2}
                      value={newProduct.ingredients} onChange={e => setNewProduct(p => ({ ...p, ingredients: e.target.value }))} />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={addingProduct}
                      startIcon={addingProduct ? <CircularProgress size={18} color="inherit" /> : <Add />}
                      sx={{ px: 4, py: 1.2, borderRadius: 2.5, fontWeight: 700 }}
                    >
                      {addingProduct ? "Publishing Product..." : "Publish Product to Catalog"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Manage Existing Products Table */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3.5 }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Live Product Catalog ({filteredProducts.length} items)
              </Typography>
              <TextField
                size="small"
                placeholder="Search products by name or brand..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
                }}
                sx={{ width: { xs: '100%', sm: 300 } }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FAF7F5' }}>
                    {['ID', 'Name & Brand', 'Regular Price', 'Sale Price', 'Stock Level', 'Skin Type', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map(p => (
                    <TableRow key={p.id} hover>
                      <TableCell><Typography variant="caption" fontWeight={700}>#{p.id}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {p.imageUrl ? (
                            <Box
                              component="img"
                              src={p.imageUrl}
                              alt={p.name}
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                objectFit: 'cover',
                                bgcolor: '#FAF6F4',
                                border: '1px solid rgba(201,149,106,0.2)'
                              }}
                            />
                          ) : (
                            <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'rgba(201,149,106,0.12)', color: '#C9956A' }}>
                              <Spa fontSize="small" />
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{p.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{p.brand || 'No Brand'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>Rs. {p.price?.toLocaleString()}</TableCell>
                      <TableCell>
                        {p.discountPrice && p.discountPrice < p.price ? (
                          <Chip label={`Rs. ${p.discountPrice.toLocaleString()}`} color="success" size="small" sx={{ fontWeight: 700 }} />
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${p.stockQuantity ?? 0} in stock`}
                          size="small"
                          color={p.stockQuantity === 0 ? 'error' : p.stockQuantity <= 10 ? 'warning' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{p.skinType || '—'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit Product Details">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(p)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product">
                            <IconButton size="small" color="error" onClick={() => handleDelete(p.id, p.name)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* ================= TAB 2: STOCK & INVENTORY REPORT ================= */}
      {tab === 2 && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3.5 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Stock & Inventory Report
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Monitor real-time inventory counts, identify low-stock items, and perform quick restocks.
            </Typography>

            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#EDF7ED', border: '1px solid rgba(46,125,50,0.2)' }}>
                  <Typography variant="caption" fontWeight={700} color="success.dark">HEALTHY STOCK ITEMS</Typography>
                  <Typography variant="h4" fontWeight={800} color="success.dark">
                    {products.filter(p => (p.stockQuantity || 0) > 10).length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#FFF8E1', border: '1px solid rgba(237,108,2,0.2)' }}>
                  <Typography variant="caption" fontWeight={700} color="warning.dark">LOW STOCK ITEMS (&le; 10)</Typography>
                  <Typography variant="h4" fontWeight={800} color="warning.dark">
                    {lowStockCount}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#FFEBEE', border: '1px solid rgba(211,47,47,0.2)' }}>
                  <Typography variant="caption" fontWeight={700} color="error.dark">OUT OF STOCK (0 units)</Typography>
                  <Typography variant="h4" fontWeight={800} color="error.dark">
                    {outOfStockCount}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FAF7F5' }}>
                    {['Product Name', 'Brand', 'Unit Price', 'Current Stock', 'Stock Status', 'Quick Restock'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={700}>{p.name}</Typography></TableCell>
                      <TableCell>{p.brand || '—'}</TableCell>
                      <TableCell>Rs. {p.price?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={800}>
                          {p.stockQuantity ?? 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {(p.stockQuantity || 0) <= 0 ? (
                          <Chip label="OUT OF STOCK" color="error" size="small" sx={{ fontWeight: 700 }} />
                        ) : (p.stockQuantity || 0) <= 10 ? (
                          <Chip label="LOW STOCK ALERT" color="warning" size="small" sx={{ fontWeight: 700 }} />
                        ) : (
                          <Chip label="IN STOCK" color="success" size="small" sx={{ fontWeight: 700 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="outlined" color="primary" onClick={() => handleQuickStockAdjust(p, 10)}>
                            +10 Units
                          </Button>
                          <Button size="small" variant="outlined" color="secondary" onClick={() => handleQuickStockAdjust(p, 50)}>
                            +50 Units
                          </Button>
                          <IconButton size="small" onClick={() => handleOpenEdit(p)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Card>
      )}

      {/* ================= TAB 3: ORDER REPORTS & STATUS UPDATER ================= */}
      {tab === 3 && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3.5 }}>
          <Box sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Customer Order Reports</Typography>
                <Typography variant="body2" color="text.secondary">
                  Track orders, customer shipping addresses, total spent, and update shipping progress.
                </Typography>
              </Box>

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={orderFilterStatus}
                  label="Filter by Status"
                  onChange={e => setOrderFilterStatus(e.target.value)}
                >
                  <MenuItem value="ALL">All Orders ({orders.length})</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PROCESSING">Processing</MenuItem>
                  <MenuItem value="SHIPPED">Shipped</MenuItem>
                  <MenuItem value="DELIVERED">Delivered</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#FAF7F5' }}>
                    {['Order ID', 'Customer', 'Shipping Address', 'Total Amount', 'Order Status', 'Update Status'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', color: 'text.secondary' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        No orders found for this status.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map(order => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography fontWeight={800} color="primary">#{order.id}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {order.customerEmail || order.user?.email || 'Registered Customer'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography variant="body2" noWrap>
                            {order.shippingAddress || 'Standard Delivery, Sri Lanka'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={800} color="#9B00A1">
                            Rs. {order.totalAmount?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={STATUS_COLORS[order.status] || 'default'}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select
                              value={order.status}
                              onChange={e => handleStatusUpdate(order.id, e.target.value)}
                              sx={{ borderRadius: 2 }}
                            >
                              {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Card>
      )}

      {/* ================= EDIT PRODUCT DETAILS DIALOG ================= */}
      <Dialog
        open={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Edit color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Edit Product Details (#{editingProduct?.id})
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setEditingProduct(null)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleSaveEdit}>
          <DialogContent dividers>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <ImageSequenceManager
                  images={editForm.images || []}
                  onChange={(updatedImages, primaryUrl) => {
                    setEditForm(f => ({ ...f, images: updatedImages, imageUrl: primaryUrl }));
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Product Name *" required
                  value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Brand Name *" required
                  value={editForm.brand} onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Regular Price (Rs.) *" type="number" required
                  value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Discount Price (Rs.)" type="number"
                  helperText="Leave empty if regular price only"
                  value={editForm.discountPrice} onChange={e => setEditForm(f => ({ ...f, discountPrice: e.target.value }))} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Stock Quantity *" type="number" required
                  value={editForm.stockQuantity} onChange={e => setEditForm(f => ({ ...f, stockQuantity: e.target.value }))} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Skin Type"
                  value={editForm.skinType} onChange={e => setEditForm(f => ({ ...f, skinType: e.target.value }))} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Description" multiline rows={3}
                  value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Key Ingredients" multiline rows={2}
                  value={editForm.ingredients} onChange={e => setEditForm(f => ({ ...f, ingredients: e.target.value }))} />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditingProduct(null)} disabled={savingEdit} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={savingEdit}
              startIcon={savingEdit ? <CircularProgress size={18} color="inherit" /> : <Save />}
              sx={{ borderRadius: 2 }}
            >
              {savingEdit ? "Saving Changes..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}