import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent, CardActions, CardMedia,
  Typography, Button, Chip, Box, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Skeleton,
  Alert, Fade, Divider, Stack, IconButton, Tooltip,
  Slider, Collapse
} from '@mui/material';
import {
  Search, ShoppingCart, Favorite, FavoriteBorder, FilterList,
  Star, LocalOffer, Spa, ExpandMore, ExpandLess, AutoAwesome
} from '@mui/icons-material';

const API = 'http://localhost:8080/api';

function ProductCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" width="80%" height={28} />
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" width="40%" />
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [skinType, setSkinType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/products`)
      .then(r => { setProducts(r.data); setFiltered(r.data); })
      .catch(() => setError('Products load නොවිය. Backend running ද?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...products];
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    if (skinType) result = result.filter(p => p.skinType === skinType);
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    setFiltered(result);
  }, [search, skinType, priceRange, products]);

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addToCart = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      await axios.post(`${API}/cart/items`, { productId, quantity: 1 }, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/cart');
    } catch { alert('Cart add failed. Please try again.'); }
  };

  const skinTypes = [...new Set(products.map(p => p.skinType).filter(Boolean))];

  return (
    <Box>
      {/* Hero Banner */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1C0A10 0%, #3D0D1E 40%, #7B1F3A 75%, #A87948 100%)',
        color: 'white', py: { xs: 8, md: 11 }, textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(201,149,106,0.18) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(181,56,92,0.25) 0%, transparent 50%)' }} />
        <Container maxWidth="md" sx={{ position: 'relative' }}>
          {/* Brand Logo Emblem */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Sekkin.lk"
              sx={{
                width: { xs: 110, md: 140 },
                height: { xs: 110, md: 140 },
                borderRadius: '50%',
                border: '3px solid #C9956A',
                boxShadow: '0 0 35px rgba(201,149,106,0.4)',
                bgcolor: '#000000',
                p: 0.5,
              }}
            />
          </Box>

          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} mb={2}>
            <AutoAwesome sx={{ fontSize: 22, color: '#C9956A' }} />
            <Chip
              label="BEAUTY • ELEGANCE • CONFIDENCE"
              sx={{
                bgcolor: 'rgba(201,149,106,0.2)',
                border: '1px solid #C9956A',
                color: '#F4D3B0',
                fontWeight: 700,
                letterSpacing: '2px',
                fontSize: { xs: '0.65rem', sm: '0.75rem' }
              }}
            />
          </Stack>

          <Typography variant="h2" fontWeight={800} sx={{ mb: 2, lineHeight: 1.15, fontSize: { xs: '2.2rem', md: '3.6rem' }, letterSpacing: '-0.5px' }}>
            Elevate Your Natural Glow
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4, fontWeight: 300, maxWidth: 620, mx: 'auto', fontSize: { xs: '0.95rem', md: '1.15rem' } }}>
            Curated premium cosmetics and organic skincare formulated for Sri Lankan skin tones and weather.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #C9956A, #E4B88D)',
                color: '#1C0A10',
                '&:hover': { background: 'linear-gradient(45deg, #B58459, #D9A87A)' },
                px: 5,
                py: 1.5,
                fontWeight: 800,
                fontSize: '1rem',
                borderRadius: 4,
                boxShadow: '0 8px 24px rgba(201,149,106,0.4)'
              }}
              onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
            >
              Shop Collection
            </Button>
            <Button
              variant="outlined"
              size="large"
              component="a"
              href="https://wa.me/94770000000?text=Hello%20Sekkin.lk!%20I%20would%20like%20to%20get%20skincare%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderColor: '#25D366',
                color: '#25D366',
                bgcolor: 'rgba(37,211,102,0.1)',
                '&:hover': { borderColor: '#20BA5A', bgcolor: 'rgba(37,211,102,0.2)' },
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: 4,
              }}
            >
              💬 WhatsApp Help
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 5 }} id="products">
        {/* Search & Filter Bar */}
        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" mb={2}>
            <TextField fullWidth placeholder="Search products or brands..."
              value={search} onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment> }}
              sx={{ maxWidth: { md: 450 } }} size="small" />
            <Button startIcon={showFilters ? <ExpandLess /> : <FilterList />}
              onClick={() => setShowFilters(v => !v)} variant="outlined" color="primary">
              Filters {skinType || priceRange[1] < 10000 ? '•' : ''}
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto !important' }}>
              {filtered.length} products found
            </Typography>
          </Stack>

          <Collapse in={showFilters}>
            <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Skin Type</InputLabel>
                    <Select value={skinType} label="Skin Type" onChange={e => setSkinType(e.target.value)}>
                      <MenuItem value="">All Types</MenuItem>
                      {skinTypes.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Price Range: Rs. {priceRange[0]} – Rs. {priceRange[1]}
                  </Typography>
                  <Slider value={priceRange} onChange={(_, v) => setPriceRange(v)}
                    min={0} max={10000} step={100} color="primary" />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button fullWidth onClick={() => { setSkinType(''); setPriceRange([0, 10000]); setSearch(''); }} size="small">
                    Clear All
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Product Grid */}
        <Grid container spacing={3}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <ProductCardSkeleton />
              </Grid>
            ))
          ) : filtered.length === 0 ? (
            <Grid item xs={12}>
              <Box textAlign="center" py={8}>
                <Spa sx={{ fontSize: 60, color: 'divider', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No products found</Typography>
              </Box>
            </Grid>
          ) : (
            filtered.map(product => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Fade in timeout={400}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                    {/* Product Image Placeholder */}
                    <Box sx={{
                      height: 200, background: `linear-gradient(135deg, #FDF0F4 0%, #F5E6EA 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                    }}
                      onClick={() => navigate(`/product/${product.id}`)}>
                      <Spa sx={{ fontSize: 60, color: 'primary.light', opacity: 0.5 }} />
                      {product.discountPrice && product.discountPrice < product.price && (
                        <Chip label={`${Math.round((1 - product.discountPrice / product.price) * 100)}% OFF`}
                          size="small" color="error"
                          sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 700 }} />
                      )}
                      <Tooltip title={wishlist.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}>
                        <IconButton size="small" onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
                          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', '&:hover': { bgcolor: 'white' } }}>
                          {wishlist.includes(product.id)
                            ? <Favorite fontSize="small" color="error" />
                            : <FavoriteBorder fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <CardContent sx={{ flexGrow: 1, pb: 1 }} onClick={() => navigate(`/product/${product.id}`)}>
                      {product.brand && (
                        <Typography variant="caption" color="secondary.main" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
                          {product.brand}
                        </Typography>
                      )}
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5, mb: 0.5, lineHeight: 1.3 }}>
                        {product.name}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {product.discountPrice && product.discountPrice < product.price ? (
                          <>
                            <Typography variant="h6" color="primary" fontWeight={700}>Rs. {product.discountPrice}</Typography>
                            <Typography variant="body2" color="text.disabled" sx={{ textDecoration: 'line-through' }}>Rs. {product.price}</Typography>
                          </>
                        ) : (
                          <Typography variant="h6" color="primary" fontWeight={700}>Rs. {product.price}</Typography>
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={0.5}>
                        {product.skinType && (
                          <Chip label={product.skinType} size="small" variant="outlined" color="secondary" />
                        )}
                        {product.stockQuantity <= 10 && product.stockQuantity > 0 && (
                          <Chip label={`Only ${product.stockQuantity} left`} size="small" color="warning" />
                        )}
                        {product.stockQuantity === 0 && (
                          <Chip label="Out of Stock" size="small" color="error" />
                        )}
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button fullWidth variant="contained" color="primary"
                        startIcon={<ShoppingCart />}
                        disabled={product.stockQuantity === 0}
                        onClick={() => addToCart(product.id)}>
                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}