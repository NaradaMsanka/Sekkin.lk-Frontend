import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, Collapse, Container, Divider, FormControl,
  IconButton, InputAdornment, InputLabel, MenuItem, Select, Skeleton,
  Slider, Snackbar, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import {
  ArrowForward, Close, GridView, Search, ShoppingBagOutlined, SpaOutlined,
  Tune, ViewList, WhatsApp,
} from '@mui/icons-material';
import DirectCheckoutModal from '../components/DirectCheckoutModal';
import ProductCard from '../components/storefront/ProductCard';
import ProductQuickView from '../components/storefront/ProductQuickView';
import BrandShowcase from '../components/storefront/BrandShowcase';
import Reveal from '../components/storefront/Reveal';
import api, { API, resolveImageUrl } from '../services/api';

const effectivePrice = product => product.discountPrice > 0 && product.discountPrice < product.price ? product.discountPrice : product.price;
const gridColumns = { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' };

function ProductSkeleton() {
  return <Box sx={{ border: '1px solid #E9DFD8', borderRadius: 3, overflow: 'hidden', bgcolor: 'white' }}>
    <Skeleton variant="rectangular" animation="wave" sx={{ aspectRatio: '1 / 1', height: 'auto' }} />
    <Box sx={{ p: 2.5 }}>
      <Skeleton width="35%" height={20} /><Skeleton width="95%" height={25} /><Skeleton width="70%" height={25} />
      <Skeleton width="50%" height={32} sx={{ mt: 1.5 }} /><Skeleton width="40%" height={24} />
      <Skeleton variant="rounded" height={44} sx={{ mt: 2 }} />
    </Box>
  </Box>;
}

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);
  const [error, setError] = useState('');
  const [catalogRequest, setCatalogRequest] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [skinType, setSkinType] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, Infinity]);
  const [wishlist, setWishlist] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutQty, setCheckoutQty] = useState(1);
  const [toast, setToast] = useState({ message: '', severity: 'success' });
  const [cartStatus, setCartStatus] = useState({});
  const timers = useRef(new Set());

  useEffect(() => {
    // Keep the original request lifecycle: each mount/retry owns and cancels its request.
    const controller = new AbortController();
    const slowTimer = setTimeout(() => {
      if (!controller.signal.aborted) setSlowLoading(true);
    }, 8000);
    axios.get(`${API}/products`, { signal: controller.signal, timeout: 120000 })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error('Invalid product response');
        setProducts(data.map(product => ({
          ...product,
          brand: product.brand || '',
          category: typeof product.category === 'string' ? product.category : product.category?.name || '',
          price: Number(product.price),
          discountPrice: product.discountPrice != null ? Number(product.discountPrice) : null,
          stockQuantity: product.stockQuantity ?? 0,
          skinType: product.skinType || '',
          description: product.description || '',
          ingredients: product.ingredients || '',
          imageUrl: resolveImageUrl(product.imageUrl || ''),
        })));
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        setProducts([]);
        setError(err.code === 'ECONNABORTED'
          ? 'The store took too long to respond. Please reload the collection.'
          : 'We couldn’t load the collection. Please try again.');
      })
      .finally(() => {
        clearTimeout(slowTimer);
        if (!controller.signal.aborted) { setLoading(false); setSlowLoading(false); }
      });
    return () => { clearTimeout(slowTimer); controller.abort(); };
  }, [catalogRequest]);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach(clearTimeout);
  }, []);

  const filters = useMemo(() => ({
    categories: [...new Set(['All Products', ...products.map(p => p.category).filter(Boolean), ...(products.some(p => effectivePrice(p) < p.price) ? ['Offers & Sale'] : [])])],
    brands: ['All Brands', ...new Set(products.map(p => p.brand).filter(Boolean))],
    skinTypes: [...new Set(products.map(p => p.skinType).filter(Boolean))],
    priceLimit: products.reduce((max, p) => Math.max(max, Math.ceil(p.price / 200) * 200), 10000),
  }), [products]);
  const priceFilterActive = priceRange[0] > 0 || priceRange[1] < filters.priceLimit;
  const anyFilters = Boolean(search || selectedCategory !== 'All Products' || selectedBrand !== 'All Brands' || skinType || priceFilterActive);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = products.filter(product => {
      if (query && ![product.name, product.brand, product.category, product.ingredients].some(value => value?.toLowerCase().includes(query))) return false;
      if (selectedCategory === 'Offers & Sale' && effectivePrice(product) >= product.price) return false;
      if (!['All Products', 'Offers & Sale'].includes(selectedCategory) && product.category !== selectedCategory) return false;
      if (selectedBrand !== 'All Brands' && product.brand !== selectedBrand) return false;
      if (skinType && !product.skinType.toLowerCase().includes(skinType.toLowerCase())) return false;
      return effectivePrice(product) >= priceRange[0] && effectivePrice(product) <= priceRange[1];
    });
    if (sortBy === 'price-asc') result.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    else if (sortBy === 'price-desc') result.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    else result.sort((a, b) => b.id - a.id);
    return result;
  }, [products, search, selectedCategory, selectedBrand, skinType, priceRange, sortBy]);

  const clearFilters = () => {
    setSearch(''); setSelectedCategory('All Products'); setSelectedBrand('All Brands');
    setSkinType(''); setPriceRange([0, Infinity]);
  };
  const retryProducts = () => { setError(''); setLoading(true); setSlowLoading(false); setCatalogRequest(value => value + 1); };
  const toggleWishlist = id => setWishlist(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]);
  const openQuickView = product => { setQuickViewProduct(product); setQuickViewQty(1); };
  const buyProduct = (product, quantity = 1) => { setQuickViewProduct(null); setCheckoutProduct(product); setCheckoutQty(quantity); };

  const addToCart = async (product, quantity = 1) => {
    if (cartStatus[product.id] === 'loading') return;
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      setToast({ message: 'Please sign in to add items to your cart.', severity: 'info' });
      return;
    }
    setCartStatus(status => ({ ...status, [product.id]: 'loading' }));
    try {
      await api.post('/api/cart/items', { productId: product.id, quantity });
      setCartStatus(status => ({ ...status, [product.id]: 'success' }));
      setToast({ message: `${product.name} added to your cart.`, severity: 'success' });
      setQuickViewProduct(null);
      const timer = setTimeout(() => {
        setCartStatus(status => ({ ...status, [product.id]: '' })); timers.current.delete(timer);
      }, 2200);
      timers.current.add(timer);
    } catch (err) {
      setCartStatus(status => ({ ...status, [product.id]: '' }));
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setToast({ message: 'Your session has expired. Please sign in again.', severity: 'info' });
        navigate('/login');
        return;
      }
      const message = err.response?.data?.message || err.response?.data;
      setToast({ message: typeof message === 'string' ? message : 'Could not add this item. Please try again.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ pb: { xs: 7, md: 10 }, bgcolor: '#FCF8F5' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 6 } }}>
        <Box component="section" aria-labelledby="hero-heading" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.12fr 0.88fr' }, alignItems: 'center', gap: { xs: 4, md: 7 }, py: { xs: 5, md: 7 } }}>
          <Reveal delay={40} sx={{ maxWidth: 620 }}>
            <Typography component="p" sx={{ color: '#9A7457', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.67rem', fontWeight: 600, mb: 2.5 }}>Beauty · Elegance · Confidence</Typography>
            <Typography component="h1" id="hero-heading" sx={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: { xs: '2.65rem', sm: '3.6rem', lg: '4.5rem' }, lineHeight: 1.08, fontWeight: 400, letterSpacing: '-0.045em', color: '#302326', mb: 2.5 }}>
              A little care.<br /><Box component="span" sx={{ color: '#8F344D', fontStyle: 'italic' }}>A beautiful ritual.</Box>
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 430, fontSize: { xs: '0.88rem', sm: '0.95rem' }, lineHeight: 1.9, mb: 3.5 }}>Discover skincare and beauty essentials for your everyday routine. Find your next favourite at SEKKIN.LK.</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' }, maxWidth: { xs: 320, sm: 'none' } }}>
              <Button className="store-primary-action" component="a" href="#catalog-section" variant="contained" endIcon={<ArrowForward />} sx={{ px: 3, py: 1.5 }}>Explore the collection</Button>
              <Button component="a" href="https://wa.me/94788153473" target="_blank" rel="noopener noreferrer" color="inherit" startIcon={<WhatsApp />} sx={{ color: 'text.secondary' }}>Let’s find your routine</Button>
            </Stack>
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', mt: { xs: 3.5, md: 5 }, color: '#87766C' }}>
              <SpaOutlined sx={{ fontSize: 21 }} /><Typography variant="caption" sx={{ letterSpacing: '0.02em' }}>Thoughtful beauty. Everyday confidence.</Typography>
            </Box>
          </Reveal>
          <BrandShowcase />
        </Box>
        <Divider sx={{ borderColor: '#E8DDD5' }} />

        <Box component="section" id="catalog-section" aria-labelledby="collection-heading" sx={{ pt: { xs: 5, md: 6 }, scrollMarginTop: 100 }}>
          <Reveal sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'end', gap: 2, mb: 3 }}>
            <Box><Typography variant="overline" sx={{ color: '#9A7457', letterSpacing: '0.16em', fontSize: '0.65rem' }}>Discover your favourites</Typography>
              <Typography id="collection-heading" component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2rem', md: '2.6rem' }, fontWeight: 400, letterSpacing: '-0.03em', mt: 0.4 }}>The beauty collection</Typography></Box>
            <Typography color="text.secondary" variant="body2" aria-live="polite">{loading ? 'Finding your essentials…' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} to explore`}</Typography>
          </Reveal>

          <Box role="group" aria-label="Product categories" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {filters.categories.map(category => <Chip key={category} clickable onClick={() => setSelectedCategory(category)} label={category} aria-pressed={selectedCategory === category}
              sx={{ minHeight: 38, px: 1, borderRadius: 20, bgcolor: selectedCategory === category ? '#302326' : 'transparent', color: selectedCategory === category ? 'white' : 'text.secondary', border: '1px solid', borderColor: selectedCategory === category ? '#302326' : '#DCCFC6', '&:hover': { bgcolor: selectedCategory === category ? '#483439' : '#F0E5DF' } }} />)}
          </Box>

          <Box sx={{ p: { xs: 2, md: 2.5 }, border: '1px solid #E6DBD3', bgcolor: '#FFFDFC', borderRadius: 3, mb: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto', md: 'minmax(0, 1fr) auto 190px auto' }, gap: 1.5, alignItems: 'center' }}>
              <TextField size="small" fullWidth value={search} onChange={event => setSearch(event.target.value)} placeholder="Search your next favourite" label="Search products" slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 20 }} /></InputAdornment>, endAdornment: search ? <InputAdornment position="end"><IconButton aria-label="Clear search" size="small" onClick={() => setSearch('')}><Close fontSize="small" /></IconButton></InputAdornment> : null } }} />
              <Button variant={showFilters ? 'contained' : 'outlined'} onClick={() => setShowFilters(value => !value)} startIcon={<Tune fontSize="small" />} aria-expanded={showFilters} aria-controls="catalog-filters" sx={{ minHeight: 43, borderColor: '#DCCFC6' }}>Filters{skinType || priceFilterActive || selectedBrand !== 'All Brands' ? ' · Active' : ''}</Button>
              <FormControl size="small" fullWidth><InputLabel id="catalog-sort-label">Sort by</InputLabel><Select labelId="catalog-sort-label" label="Sort by" value={sortBy} onChange={event => setSortBy(event.target.value)}>
                <MenuItem value="latest">New arrivals</MenuItem><MenuItem value="price-asc">Price: low to high</MenuItem><MenuItem value="price-desc">Price: high to low</MenuItem>
              </Select></FormControl>
              <ToggleButtonGroup value={viewMode} exclusive size="small" aria-label="Product layout" onChange={(_, mode) => { if (mode) setViewMode(mode); }} sx={{ justifySelf: { xs: 'end', md: 'auto' }, height: 43 }}>
                <ToggleButton value="grid" aria-label="Grid view"><GridView fontSize="small" /></ToggleButton><ToggleButton value="list" aria-label="List view"><ViewList fontSize="small" /></ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Collapse in={showFilters}><Box id="catalog-filters" sx={{ pt: 3, mt: 2, borderTop: '1px solid #E6DBD3', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1.25fr' }, gap: 3 }}>
              <FormControl fullWidth size="small"><InputLabel id="brand-filter-label">Brand</InputLabel><Select labelId="brand-filter-label" label="Brand" value={selectedBrand} onChange={event => setSelectedBrand(event.target.value)}>{filters.brands.map(brand => <MenuItem key={brand} value={brand}>{brand}</MenuItem>)}</Select></FormControl>
              <FormControl fullWidth size="small"><InputLabel id="skin-filter-label">Skin type</InputLabel><Select labelId="skin-filter-label" label="Skin type" value={skinType} onChange={event => setSkinType(event.target.value)}><MenuItem value="">All skin types</MenuItem>{filters.skinTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}</Select></FormControl>
              <Box sx={{ px: 1 }}><Typography variant="caption" color="text.secondary">Rs. {priceRange[0].toLocaleString()} — Rs. {Math.min(priceRange[1], filters.priceLimit).toLocaleString()}</Typography><Slider size="small" value={[priceRange[0], Math.min(priceRange[1], filters.priceLimit)]} onChange={(_, range) => setPriceRange(range)} min={0} max={filters.priceLimit} step={200} getAriaLabel={index => index === 0 ? 'Minimum price' : 'Maximum price'} valueLabelDisplay="auto" /></Box>
            </Box></Collapse>
          </Box>

          {anyFilters && <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {search && <Chip size="small" label={`Search: ${search}`} onDelete={() => setSearch('')} />}
            {selectedBrand !== 'All Brands' && <Chip size="small" label={selectedBrand} onDelete={() => setSelectedBrand('All Brands')} />}
            {skinType && <Chip size="small" label={skinType} onDelete={() => setSkinType('')} />}
            <Button size="small" onClick={clearFilters}>Clear all filters</Button>
          </Box>}

          {loading ? <Box aria-busy="true" aria-label="Loading products">
            {slowLoading && <Alert severity="info" sx={{ mb: 3 }}>The collection is taking a little longer to load. We’re still connecting — thank you for your patience.</Alert>}
            <Box sx={{ display: 'grid', gridTemplateColumns: gridColumns, gap: { xs: 2, md: 2.5 } }}>{Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)}</Box>
          </Box> : error ? <Box sx={{ py: 6, px: 3, bgcolor: 'white', textAlign: 'center', border: '1px solid #E6DBD3', borderRadius: 3 }}>
            <ShoppingBagOutlined sx={{ fontSize: 36, color: '#A38373', mb: 2 }} /><Typography component="h3" variant="h6" sx={{ mb: 1 }}>Let’s try that again</Typography><Typography role="alert" color="text.secondary" variant="body2" sx={{ mb: 3 }}>{error}</Typography><Button variant="contained" onClick={retryProducts}>Reload collection</Button>
          </Box> : filteredProducts.length === 0 ? <Box sx={{ py: 8, px: 3, bgcolor: 'white', textAlign: 'center', border: '1px solid #E6DBD3', borderRadius: 3 }}>
            <SpaOutlined sx={{ fontSize: 40, color: '#A38373', mb: 2 }} /><Typography component="h3" variant="h6" sx={{ mb: 1 }}>{products.length ? 'Nothing here just yet' : 'Our collection is on its way'}</Typography><Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>{products.length ? 'Try a different search or adjust your filters.' : 'New beauty essentials will appear here as they arrive.'}</Typography>{products.length > 0 && <Button variant="outlined" onClick={clearFilters}>Explore all products</Button>}
          </Box> : <Box sx={{ display: 'grid', gridTemplateColumns: viewMode === 'list' ? 'minmax(0, 1fr)' : gridColumns, gridAutoRows: viewMode === 'grid' ? '1fr' : 'auto', gap: { xs: 2, md: 2.5 } }}>
            {filteredProducts.map((product, index) => <Reveal key={product.id} delay={(index % 4) * 70} sx={{ height: '100%' }}><ProductCard product={product} list={viewMode === 'list'} priority={index < 4} wishlisted={wishlist.includes(product.id)} onWishlist={toggleWishlist} onQuickView={openQuickView} onAddToCart={addToCart} onBuy={buyProduct} cartStatus={cartStatus[product.id]} /></Reveal>)}
          </Box>}
        </Box>
      </Container>
      <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} quantity={quickViewQty} setQuantity={setQuickViewQty} onAddToCart={addToCart} onBuy={buyProduct} busy={quickViewProduct ? cartStatus[quickViewProduct.id] === 'loading' : false} />
      <Snackbar open={Boolean(toast.message)} autoHideDuration={4500} onClose={() => setToast(value => ({ ...value, message: '' }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert variant="filled" severity={toast.severity} onClose={() => setToast(value => ({ ...value, message: '' }))} sx={{ width: '100%', maxWidth: 520 }}>{toast.message}</Alert>
      </Snackbar>
      <DirectCheckoutModal open={Boolean(checkoutProduct)} onClose={() => setCheckoutProduct(null)} product={checkoutProduct} initialQty={checkoutQty} />
    </Box>
  );
}
