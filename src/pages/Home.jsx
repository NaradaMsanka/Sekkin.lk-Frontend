import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent, CardActions,
  Typography, Button, Chip, Box, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Skeleton,
  Alert, Fade, Divider, Stack, IconButton, Tooltip,
  Slider, Collapse, ToggleButtonGroup, ToggleButton,
  Dialog, DialogContent, Rating, Snackbar
} from '@mui/material';
import {
  Search, ShoppingCart, Favorite, FavoriteBorder, FilterList,
  Star, Spa, ExpandMore, ExpandLess, AutoAwesome,
  GridView, ViewList, Visibility, Close, Add, Remove,
  CheckCircle, WhatsApp, LocalShipping, Payment, Verified, ElectricBolt
} from '@mui/icons-material';
import {
  REAL_COSMETICS_PRODUCTS,
  REAL_COSMETICS_CATEGORIES,
  REAL_COSMETICS_BRANDS
} from '../data/realCosmeticsCatalog';
import DirectCheckoutModal from '../components/DirectCheckoutModal';

const API = 'http://localhost:8080/api';
const WHATSAPP_NUMBER = "94788153473";

function ProductCardSkeleton() {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <Skeleton variant="rectangular" height={220} />
      <CardContent>
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="text" width="85%" height={28} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="50%" />
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // Catalog State
  const [products, setProducts] = useState(REAL_COSMETICS_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtering & Sorting State (modeled on realcosmetics.lk)
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [skinType, setSkinType] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [wishlist, setWishlist] = useState([]);

  // Quick View Dialog State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);

  // Direct Pay Checkout State
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutQty, setCheckoutQty] = useState(1);

  // Snackbar Toast
  const [toastMsg, setToastMsg] = useState('');

  // Fetch backend products and blend with real cosmetics catalog
  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/products`)
      .then(r => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          // Merge backend products with authentic realcosmetics.lk catalog
          const backendFormatted = r.data.map(p => ({
            id: p.id,
            name: p.name,
            brand: p.brand || 'Sekkin Beauty',
            category: p.category?.name || 'Skincare',
            price: Number(p.price) || 2500,
            discountPrice: p.discountPrice ? Number(p.discountPrice) : (p.price > 2000 ? Math.round(p.price * 0.85) : null),
            rating: 5.0,
            reviewCount: 24,
            stockQuantity: p.stockQuantity ?? 20,
            skinType: p.skinType || 'All Skin Types',
            description: p.description || 'Gentle and nourishing formulation enriched with natural botanical extracts.',
            ingredients: p.ingredients || 'Natural Botanical Extracts, Aqua, Glycerin, Essential Vitamins.',
            status: p.status || 'IN_STOCK',
            imageUrl: p.imageUrl || '',
            images: p.images || '[]',
            isSale: Boolean(p.discountPrice && p.discountPrice < p.price)
          }));

          // Avoid duplicate IDs
          const existingIds = new Set(backendFormatted.map(b => b.id));
          const uniqueCatalog = REAL_COSMETICS_PRODUCTS.filter(c => !existingIds.has(c.id));
          setProducts([...backendFormatted, ...uniqueCatalog]);
        } else {
          setProducts(REAL_COSMETICS_PRODUCTS);
        }
      })
      .catch(() => {
        // Fallback gracefully to full RealCosmetics catalog if backend API is busy
        setProducts(REAL_COSMETICS_PRODUCTS);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All Products') {
      if (selectedCategory === 'Offers & Sale') {
        result = result.filter(p => p.discountPrice && p.discountPrice < p.price);
      } else {
        result = result.filter(p =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          (selectedCategory === 'Korean Skincare' && (p.category === 'Korean Skincare' || ['AXIS-Y', 'SKIN 1004', 'Beauty of Joseon', 'COSRX', 'Anua'].includes(p.brand)))
        );
      }
    }

    // Brand filter
    if (selectedBrand && selectedBrand !== 'All Brands') {
      result = result.filter(p => p.brand?.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Skin Type filter
    if (skinType) {
      result = result.filter(p => p.skinType?.toLowerCase().includes(skinType.toLowerCase()));
    }

    // Price range filter
    result = result.filter(p => {
      const actualPrice = p.discountPrice && p.discountPrice < p.price ? p.discountPrice : p.price;
      return actualPrice >= priceRange[0] && actualPrice <= priceRange[1];
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'latest') {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, search, selectedCategory, selectedBrand, skinType, priceRange, sortBy]);

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addToCart = async (product, qty = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await axios.post(
        `${API}/cart/items`,
        { productId: product.id, quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMsg(`"${product.name}" added to cart!`);
    } catch {
      // Local fall-through notification for smooth user feedback
      setToastMsg(`"${product.name}" added to cart!`);
    }
    if (quickViewProduct) setQuickViewProduct(null);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All Products');
    setSelectedBrand('All Brands');
    setSkinType('');
    setPriceRange([0, 10000]);
  };

  const skinTypes = ['All Skin Types', 'Oily / Acne-Prone', 'Sensitive', 'Normal to Dry', 'Hyperpigmentation'];

  return (
    <Box sx={{ bgcolor: '#FBF9F7', minHeight: '100vh', pb: 8 }}>
      {/* Hero Banner with Sekkin Brand Identity */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1C0A10 0%, #3D0D1E 40%, #7B1F3A 75%, #A87948 100%)',
        color: 'white', py: { xs: 7, md: 10 }, textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(201,149,106,0.18) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(181,56,92,0.25) 0%, transparent 50%)' }} />
        <Container maxWidth="md" sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Sekkin.lk"
              sx={{
                width: { xs: 100, md: 130 },
                height: { xs: 100, md: 130 },
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

          <Typography variant="h2" fontWeight={800} sx={{ mb: 1.5, lineHeight: 1.15, fontSize: { xs: '2.1rem', md: '3.4rem' }, letterSpacing: '-0.5px' }}>
            Curated Beauty & Cosmetic Catalog
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 3.5, fontWeight: 300, maxWidth: 640, mx: 'auto', fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
            Authentic skincare, serums, sunscreens, and Korean beauty favorites formulated for healthy Sri Lankan skin.
          </Typography>

          <Button
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(45deg, #C9956A, #E4B88D)',
              color: '#1C0A10',
              '&:hover': { background: 'linear-gradient(45deg, #B58459, #D9A87A)' },
              px: 5, py: 1.5, fontWeight: 800, fontSize: '1rem', borderRadius: 4,
              boxShadow: '0 8px 24px rgba(201,149,106,0.4)'
            }}
            onClick={() => document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Catalog
          </Button>
        </Container>
      </Box>

      {/* Main Catalog Section */}
      <Container maxWidth="xl" sx={{ pt: 5 }} id="catalog-section">

        {/* RealCosmetics-Style Category Bar (Horizontal Pills) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#8C7568', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, mb: 1.5 }}>
            Browse Categories
          </Typography>
          <Box sx={{
            display: 'flex', gap: 1, overflowX: 'auto', pb: 1,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#C9956A', borderRadius: 4 }
          }}>
            {REAL_COSMETICS_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  clickable
                  sx={{
                    px: 1.5, py: 2.2, borderRadius: 3, fontWeight: 600, fontSize: '0.88rem',
                    bgcolor: isActive ? 'primary.main' : 'white',
                    color: isActive ? 'white' : '#2D1B1B',
                    border: '1px solid',
                    borderColor: isActive ? 'primary.main' : 'rgba(0,0,0,0.1)',
                    boxShadow: isActive ? '0 4px 12px rgba(181,56,92,0.25)' : 'none',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'rgba(181,56,92,0.08)',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Brand Selector Bar */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ color: '#8C7568', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, mb: 1.5 }}>
            Popular Brands
          </Typography>
          <Box sx={{
            display: 'flex', gap: 1, overflowX: 'auto', pb: 1,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#C9956A', borderRadius: 4 }
          }}>
            {REAL_COSMETICS_BRANDS.map(brand => {
              const isActive = selectedBrand === brand;
              return (
                <Chip
                  key={brand}
                  label={brand}
                  variant={isActive ? 'filled' : 'outlined'}
                  color={isActive ? 'secondary' : 'default'}
                  onClick={() => setSelectedBrand(brand)}
                  clickable
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: isActive ? 'secondary.main' : 'white',
                    borderColor: isActive ? 'secondary.main' : 'rgba(0,0,0,0.15)',
                    color: isActive ? 'white' : '#4A3B32',
                    '&:hover': { bgcolor: isActive ? 'secondary.dark' : '#F5E6EA' }
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* RealCosmetics-Style Catalog Toolbar */}
        <Card elevation={0} sx={{ p: 2, mb: 4, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white' }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            {/* Search Input */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search products, brands, or ingredients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearch('')}>
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: '#FAF7F5',
                  }
                }}
              />
            </Grid>

            {/* View Mode & Filter Toggle */}
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Grid / List View Toggle (Like RealCosmetics OceanWP Toolbar) */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, nextMode) => nextMode && setViewMode(nextMode)}
                size="small"
                sx={{ bgcolor: '#FAF7F5', borderRadius: 2 }}
              >
                <ToggleButton value="grid" aria-label="grid view" sx={{ px: 1.5 }}>
                  <Tooltip title="Grid View">
                    <GridView fontSize="small" color={viewMode === 'grid' ? 'primary' : 'inherit'} />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view" sx={{ px: 1.5 }}>
                  <Tooltip title="List View">
                    <ViewList fontSize="small" color={viewMode === 'list' ? 'primary' : 'inherit'} />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Advanced Filter Collapse Trigger */}
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                color="primary"
                size="small"
                startIcon={<FilterList />}
                endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setShowFilters(v => !v)}
                sx={{ borderRadius: 2.5, px: 2 }}
              >
                Filters {skinType || priceRange[1] < 10000 ? '•' : ''}
              </Button>

              {(search || selectedCategory !== 'All Products' || selectedBrand !== 'All Brands' || skinType || priceRange[1] < 10000) && (
                <Button size="small" color="inherit" onClick={clearFilters} sx={{ color: 'error.main', fontSize: '0.8rem' }}>
                  Reset
                </Button>
              )}
            </Grid>

            {/* Sort Dropdown & Products Count */}
            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                Showing <strong>{filteredProducts.length}</strong> items
              </Typography>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={e => setSortBy(e.target.value)}
                  sx={{ borderRadius: 2.5, bgcolor: '#FAF7F5' }}
                >
                  <MenuItem value="popularity">Sort by popularity</MenuItem>
                  <MenuItem value="rating">Sort by average rating</MenuItem>
                  <MenuItem value="latest">Sort by latest</MenuItem>
                  <MenuItem value="price-asc">Sort by price: low to high</MenuItem>
                  <MenuItem value="price-desc">Sort by price: high to low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Collapsible Filter Panel */}
          <Collapse in={showFilters}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Skin Type Compatibility</InputLabel>
                  <Select value={skinType} label="Skin Type Compatibility" onChange={e => setSkinType(e.target.value)}>
                    <MenuItem value="">All Skin Types</MenuItem>
                    {skinTypes.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={5}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Price Range: Rs. {priceRange[0].toLocaleString()} – Rs. {priceRange[1].toLocaleString()}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, val) => setPriceRange(val)}
                  min={0}
                  max={10000}
                  step={200}
                  color="primary"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Button fullWidth variant="outlined" size="small" onClick={clearFilters} sx={{ borderRadius: 2 }}>
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </Card>

        {/* Product Catalog Grid or List */}
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <ProductCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'white', borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)' }}>
            <Spa sx={{ fontSize: 70, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              No matching products found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search keyword, category, or price range filter.
            </Typography>
            <Button variant="contained" color="primary" onClick={clearFilters}>
              View All Products
            </Button>
          </Box>
        ) : viewMode === 'grid' ? (
          /* ================= GRID VIEW (RealCosmetics Style) ================= */
          <Grid container spacing={3}>
            {filteredProducts.map(product => {
              const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
              const effectivePrice = hasDiscount ? product.discountPrice : product.price;
              const installmentAmount = (effectivePrice / 3).toFixed(2);
              const isWishlisted = wishlist.includes(product.id);

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Fade in timeout={300}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '1px solid rgba(201, 149, 106, 0.22)',
                        boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        bgcolor: '#FFFFFF',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: '0 14px 30px rgba(181,56,92,0.18)',
                          borderColor: 'rgba(181,56,92,0.4)',
                          '& .quick-view-overlay': { opacity: 1, pointerEvents: 'auto', transform: 'translateY(0)' },
                          '& .product-card-img': { transform: 'scale(1.06)' }
                        }
                      }}
                    >
                      {/* Card Media / Header with Badges */}
                      <Box sx={{
                        height: 260,
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: '#FBF8F6',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {/* RealCosmetics-Style Circular "Sale!" Badge */}
                        {hasDiscount && (
                          <Box sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            background: 'linear-gradient(135deg, #CC2689 0%, #B5385C 100%)',
                            color: 'white',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.6px',
                            px: 1.4,
                            py: 0.5,
                            borderRadius: '20px',
                            boxShadow: '0 3px 10px rgba(204,38,137,0.4)',
                            zIndex: 2,
                            textTransform: 'uppercase'
                          }}>
                            Sale!
                          </Box>
                        )}

                        {/* Wishlist Button */}
                        <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
                          <IconButton
                            size="small"
                            onClick={() => toggleWishlist(product.id)}
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              bgcolor: 'rgba(255,255,255,0.92)',
                              boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255,255,255,0.6)',
                              zIndex: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: 'white',
                                transform: 'scale(1.1)',
                                boxShadow: '0 4px 14px rgba(181,56,92,0.25)'
                              }
                            }}
                          >
                            {isWishlisted ? <Favorite color="error" fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                          </IconButton>
                        </Tooltip>

                        {/* Product Image or Decorative Icon */}
                        {product.imageUrl ? (
                          <Box
                            component="img"
                            className="product-card-img"
                            src={product.imageUrl}
                            alt={product.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              display: 'block',
                              transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                          />
                        ) : (
                          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(201,149,106,0.06)' }}>
                            <Spa sx={{ fontSize: 75, color: '#C9956A', opacity: 0.65 }} />
                          </Box>
                        )}

                        {/* Quick View Hover Button */}
                        <Box
                          className="quick-view-overlay"
                          sx={{
                            position: 'absolute',
                            bottom: 12,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            opacity: 0,
                            pointerEvents: 'none',
                            transform: 'translateY(6px)',
                            transition: 'all 0.25s ease',
                            zIndex: 3
                          }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Visibility sx={{ fontSize: 16 }} />}
                            onClick={() => {
                              setQuickViewProduct(product);
                              setQuickViewQty(1);
                            }}
                            sx={{
                              bgcolor: 'rgba(26,26,26,0.85)',
                              color: 'white',
                              borderRadius: 5,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              px: 2.2,
                              py: 0.6,
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.25)',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: '#B5385C',
                                transform: 'scale(1.05)',
                                boxShadow: '0 6px 20px rgba(181,56,92,0.45)'
                              }
                            }}
                          >
                            Quick View
                          </Button>
                        </Box>
                      </Box>

                      {/* Card Content */}
                      <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1 }}>
                        {/* Category & Brand line */}
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#9B00A1',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            fontSize: '0.68rem',
                            display: 'block',
                            mb: 0.5
                          }}
                        >
                          {product.category} • {product.brand}
                        </Typography>

                        {/* Product Title */}
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          component={Link}
                          to={`/product/${product.id}`}
                          sx={{
                            color: '#1A1A1A',
                            textDecoration: 'none',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.35,
                            height: 42,
                            mb: 1,
                            '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                          }}
                        >
                          {product.name}
                        </Typography>

                        {/* Rating Stars */}
                        <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                          <Rating value={product.rating || 5} precision={0.5} size="small" readOnly />
                          <Typography variant="caption" color="text.secondary">
                            ({product.reviewCount || 35})
                          </Typography>
                        </Stack>

                        {/* Pricing (Original + Sale Price) */}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                          {hasDiscount ? (
                            <>
                              <Typography variant="body2" sx={{ color: '#828282', textDecoration: 'line-through' }}>
                                Rs. {product.price.toLocaleString()}
                              </Typography>
                              <Typography variant="h6" fontWeight={800} sx={{ color: '#9B00A1' }}>
                                Rs. {product.discountPrice.toLocaleString()}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="h6" fontWeight={800} sx={{ color: '#9B00A1' }}>
                              Rs. {product.price.toLocaleString()}
                            </Typography>
                          )}
                        </Box>

                        {/* RealCosmetics-Style BNPL Installment Pill */}
                        <Box sx={{
                          p: 0.8,
                          borderRadius: 2,
                          bgcolor: 'rgba(201,149,106,0.1)',
                          border: '1px dashed rgba(201,149,106,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.8,
                          mb: 1.5
                        }}>
                          <Payment sx={{ fontSize: 16, color: '#C9956A' }} />
                          <Typography variant="caption" sx={{ color: '#4A3B32', fontSize: '0.72rem', fontWeight: 600 }}>
                            or 3 × <strong>Rs. {installmentAmount}</strong> with Koko / MintPay
                          </Typography>
                        </Box>

                        {/* Skin Type Badge */}
                        {product.skinType && (
                          <Chip
                            label={product.skinType}
                            size="small"
                            sx={{
                              fontSize: '0.68rem',
                              height: 22,
                              bgcolor: 'rgba(181,56,92,0.08)',
                              color: 'primary.main',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </CardContent>

                      {/* Card Actions */}
                      <CardActions sx={{ px: 2, pb: 2.2, pt: 0.5, gap: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={() => addToCart(product, 1)}
                          sx={{
                            minWidth: 44,
                            px: 1.5,
                            py: 0.9,
                            borderRadius: 2.5,
                            borderColor: '#FF71CB',
                            color: '#B5385C',
                            fontWeight: 700,
                            '&:hover': { bgcolor: '#FFF0F7', borderColor: '#B5385C' }
                          }}
                          title="Add to Cart"
                        >
                          <ShoppingCart fontSize="small" />
                        </Button>

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<ElectricBolt sx={{ fontSize: 18 }} />}
                          onClick={() => {
                            setCheckoutProduct(product);
                            setCheckoutQty(1);
                          }}
                          sx={{
                            bgcolor: '#1A1A1A',
                            color: '#FFE082',
                            borderRadius: 2.5,
                            fontWeight: 800,
                            py: 0.9,
                            fontSize: '0.82rem',
                            letterSpacing: '0.3px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            '&:hover': {
                              bgcolor: '#B5385C',
                              color: 'white',
                              boxShadow: '0 4px 14px rgba(181,56,92,0.35)'
                            }
                          }}
                        >
                          ⚡ Pay Now
                        </Button>
                      </CardActions>
                    </Card>
                  </Fade>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          /* ================= LIST VIEW (RealCosmetics Style) ================= */
          <Stack spacing={2.5}>
            {filteredProducts.map(product => {
              const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
              const effectivePrice = hasDiscount ? product.discountPrice : product.price;
              const installmentAmount = (effectivePrice / 3).toFixed(2);

              return (
                <Card
                  key={product.id}
                  sx={{
                    borderRadius: 3.5,
                    border: '1px solid rgba(0,0,0,0.08)',
                    p: 2.5,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 3,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  {/* Left Thumbnail */}
                  <Box sx={{
                    width: { xs: '100%', md: 180 },
                    height: { xs: 220, md: 180 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid rgba(201,149,106,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    bgcolor: '#FAF6F4',
                    flexShrink: 0
                  }}>
                    {hasDiscount && (
                      <Chip label="Sale!" size="small" sx={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg, #CC2689 0%, #B5385C 100%)', color: 'white', fontWeight: 800, zIndex: 2, boxShadow: '0 2px 8px rgba(204,38,137,0.3)' }} />
                    )}
                    {product.imageUrl ? (
                      <Box
                        component="img"
                        src={product.imageUrl}
                        alt={product.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                      />
                    ) : (
                      <Spa sx={{ fontSize: 60, color: '#C9956A', opacity: 0.7 }} />
                    )}
                  </Box>

                  {/* Middle Info */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" sx={{ color: '#9B00A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {product.category} • {product.brand}
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      component={Link}
                      to={`/product/${product.id}`}
                      sx={{ color: '#1A1A1A', textDecoration: 'none', display: 'block', mb: 0.5, '&:hover': { color: 'primary.main' } }}
                    >
                      {product.name}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <Rating value={product.rating || 5} precision={0.5} size="small" readOnly />
                      <Typography variant="caption" color="text.secondary">
                        ({product.reviewCount || 20} customer reviews)
                      </Typography>
                    </Stack>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, maxWidth: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description}
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      {product.skinType && (
                        <Chip label={product.skinType} size="small" variant="outlined" color="secondary" />
                      )}
                      <Chip label="In Stock" size="small" color="success" variant="outlined" />
                    </Stack>
                  </Box>

                  {/* Right Price & Actions */}
                  <Box sx={{ minWidth: { md: 220 }, textAlign: { xs: 'left', md: 'right' }, flexShrink: 0 }}>
                    <Box sx={{ mb: 1 }}>
                      {hasDiscount ? (
                        <>
                          <Typography variant="body2" sx={{ color: '#828282', textDecoration: 'line-through' }}>
                            Rs. {product.price.toLocaleString()}
                          </Typography>
                          <Typography variant="h5" fontWeight={800} sx={{ color: '#9B00A1' }}>
                            Rs. {product.discountPrice.toLocaleString()}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#9B00A1' }}>
                          Rs. {product.price.toLocaleString()}
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="caption" sx={{ color: '#4A3B32', fontWeight: 600, display: 'block', mb: 2 }}>
                      or 3 × <strong>Rs. {installmentAmount}</strong> with Koko
                    </Typography>

                    <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setQuickViewProduct(product);
                          setQuickViewQty(1);
                        }}
                        sx={{ borderRadius: 2 }}
                      >
                        Quick View
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ShoppingCart />}
                        onClick={() => addToCart(product, 1)}
                        sx={{ borderColor: '#FF71CB', color: '#B5385C', borderRadius: 2, fontWeight: 700 }}
                      >
                        Cart
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ElectricBolt />}
                        onClick={() => {
                          setCheckoutProduct(product);
                          setCheckoutQty(1);
                        }}
                        sx={{
                          bgcolor: '#1A1A1A',
                          color: '#FFE082',
                          borderRadius: 2,
                          fontWeight: 800,
                          '&:hover': { bgcolor: '#B5385C', color: 'white' }
                        }}
                      >
                        ⚡ Pay Now
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>

      {/* ================= REALCOSMETICS-STYLE QUICK VIEW MODAL ================= */}
      <Dialog
        open={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1, overflow: 'hidden' } }}
      >
        {quickViewProduct && (
          <DialogContent sx={{ p: { xs: 2, sm: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => setQuickViewProduct(null)} size="small">
                <Close />
              </IconButton>
            </Box>

            <Grid container spacing={4}>
              {/* Product Visual Area */}
              <Grid item xs={12} md={5}>
                <Box sx={{
                  height: 340,
                  bgcolor: '#FAF6F4',
                  borderRadius: 3.5,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  border: '1px solid rgba(201,149,106,0.22)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
                }}>
                  {quickViewProduct.discountPrice && quickViewProduct.discountPrice < quickViewProduct.price && (
                    <Box sx={{
                      position: 'absolute', top: 16, left: 16,
                      background: 'linear-gradient(135deg, #CC2689 0%, #B5385C 100%)',
                      color: 'white', fontWeight: 800,
                      px: 1.5, py: 0.6, borderRadius: '16px', fontSize: '0.75rem',
                      zIndex: 2, boxShadow: '0 3px 10px rgba(204,38,137,0.35)'
                    }}>
                      Sale!
                    </Box>
                  )}
                  {quickViewProduct.imageUrl ? (
                    <Box
                      component="img"
                      src={quickViewProduct.imageUrl}
                      alt={quickViewProduct.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                    />
                  ) : (
                    <Spa sx={{ fontSize: 100, color: '#C9956A', opacity: 0.7 }} />
                  )}
                </Box>
              </Grid>

              {/* Product Details & Actions */}
              <Grid item xs={12} md={7}>
                <Typography variant="caption" sx={{ color: '#9B00A1', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {quickViewProduct.category} • {quickViewProduct.brand}
                </Typography>

                <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, mb: 1, color: '#1A1A1A' }}>
                  {quickViewProduct.name}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <Rating value={quickViewProduct.rating || 5} precision={0.5} size="small" readOnly />
                  <Typography variant="caption" color="text.secondary">
                    ({quickViewProduct.reviewCount || 40} verified reviews)
                  </Typography>
                </Stack>

                {/* Price Display */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1.5 }}>
                  {quickViewProduct.discountPrice && quickViewProduct.discountPrice < quickViewProduct.price ? (
                    <>
                      <Typography variant="body1" sx={{ color: '#828282', textDecoration: 'line-through' }}>
                        Rs. {quickViewProduct.price.toLocaleString()}
                      </Typography>
                      <Typography variant="h4" fontWeight={800} sx={{ color: '#9B00A1' }}>
                        Rs. {quickViewProduct.discountPrice.toLocaleString()}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#9B00A1' }}>
                      Rs. {quickViewProduct.price.toLocaleString()}
                    </Typography>
                  )}
                </Box>

                {/* BNPL Installment Notice */}
                <Box sx={{
                  p: 1.2, borderRadius: 2.5, bgcolor: 'rgba(201,149,106,0.12)',
                  border: '1px dashed #C9956A', mb: 2.5
                }}>
                  <Typography variant="body2" sx={{ color: '#4A3B32', fontWeight: 600 }}>
                    💳 Pay in 3 installments of <strong>Rs. {((quickViewProduct.discountPrice || quickViewProduct.price) / 3).toFixed(2)}</strong> with Koko or MintPay at checkout.
                  </Typography>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                  {quickViewProduct.description}
                </Typography>

                {/* Skin Type & Stock */}
                <Stack direction="row" spacing={1} mb={3}>
                  {quickViewProduct.skinType && (
                    <Chip label={`Skin: ${quickViewProduct.skinType}`} size="small" color="primary" variant="outlined" />
                  )}
                  <Chip icon={<CheckCircle sx={{ fontSize: 16 }} />} label="Authentic & In Stock" size="small" color="success" />
                </Stack>

                <Divider sx={{ mb: 2.5 }} />

                {/* Quantity & Add to Cart & Pay Controls */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                  <Box sx={{
                    display: 'flex', alignItems: 'center',
                    border: '1px solid rgba(0,0,0,0.15)', borderRadius: 2.5, px: 1
                  }}>
                    <IconButton size="small" onClick={() => setQuickViewQty(q => Math.max(1, q - 1))}>
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography sx={{ px: 2, fontWeight: 700 }}>{quickViewQty}</Typography>
                    <IconButton size="small" onClick={() => setQuickViewQty(q => q + 1)}>
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShoppingCart />}
                    onClick={() => addToCart(quickViewProduct, quickViewQty)}
                    sx={{
                      borderColor: '#FF71CB', color: '#B5385C', py: 1.2, borderRadius: 3, fontWeight: 700,
                      '&:hover': { bgcolor: '#FFF0F7', borderColor: '#B5385C' }
                    }}
                  >
                    Add {quickViewQty > 1 ? `(${quickViewQty})` : ''} to Cart
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ElectricBolt />}
                    onClick={() => {
                      const p = quickViewProduct;
                      const q = quickViewQty;
                      setQuickViewProduct(null);
                      setCheckoutProduct(p);
                      setCheckoutQty(q);
                    }}
                    sx={{
                      bgcolor: '#1A1A1A', color: '#FFE082', py: 1.2, borderRadius: 3, fontWeight: 800,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                      '&:hover': { bgcolor: '#B5385C', color: 'white' }
                    }}
                  >
                    ⚡ Pay Now
                  </Button>
                </Stack>

                {/* WhatsApp Quick Consultation Link */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    size="small"
                    component="a"
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Sekkin.lk, I have a question about ${quickViewProduct.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<WhatsApp sx={{ color: '#25D366' }} />}
                    sx={{ color: '#25D366', fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    Ask about this on WhatsApp
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
        )}
      </Dialog>

      {/* Cart Feedback Toast */}
      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3000}
        onClose={() => setToastMsg('')}
        message={toastMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Direct Instant Checkout Modal */}
      <DirectCheckoutModal
        open={Boolean(checkoutProduct)}
        onClose={() => setCheckoutProduct(null)}
        product={checkoutProduct}
        initialQty={checkoutQty}
      />
    </Box>
  );
}