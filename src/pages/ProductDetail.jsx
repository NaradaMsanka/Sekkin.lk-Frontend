import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Chip, CircularProgress, Container, Divider, IconButton, Rating, Skeleton, Snackbar, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Add, ArrowBack, ArrowForward, Check, Favorite, FavoriteBorder, Remove, ShoppingCart } from '@mui/icons-material';
import DirectCheckoutModal from '../components/DirectCheckoutModal';
import ProductMedia from '../components/storefront/ProductMedia';
import { ProductPrice } from '../components/storefront/ProductCard';
import ProductReviews from '../components/storefront/ProductReviews';
import api, { API, resolveImageUrl } from '../services/api';

export default function ProductDetail() {
  const { id } = useParams();
  return <ProductDetailContent key={id} id={id} />;
}

function ProductDetailContent({ id }) {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [request, setRequest] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewRequest, setReviewRequest] = useState(0);
  const [tab, setTab] = useState(0);
  const [qty, setQty] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cartBusy, setCartBusy] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [snack, setSnack] = useState({ message: '', severity: 'success' });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/products/${id}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(response.status === 404 ? 'This product could not be found.' : 'This product could not be loaded. Please try again.');
        return response.json();
      })
      .then(data => {
        if (!controller.signal.aborted) setProduct({ ...data, price: Number(data.price), discountPrice: data.discountPrice != null ? Number(data.discountPrice) : null });
      })
      .catch(err => { if (!controller.signal.aborted) setError(err.message || 'This product could not be loaded.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, request]);

  useEffect(() => {
    const controller = new AbortController();
    api.get(`/api/products/${id}/reviews`, { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error('Invalid reviews');
        setReviews(data);
      })
      .catch(() => { if (!controller.signal.aborted) setReviewsError('Reviews could not be loaded. Please try again.'); })
      .finally(() => { if (!controller.signal.aborted) setReviewsLoading(false); });
    return () => controller.abort();
  }, [id, reviewRequest]);

  const gallery = (() => {
    if (!product) return [];
    let images = [];
    if (product.images) {
      try {
        const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        if (Array.isArray(parsed)) images = parsed.filter(image => typeof image === 'string' && image.trim());
      } catch { /* Older products can still use their main image. */ }
    }
    if (!images.length && product.imageUrl) images = [product.imageUrl];
    return images.map(resolveImageUrl);
  })();

  const addToCart = async () => {
    if (cartBusy) return;
    const token = localStorage.getItem('token');
    if (!token || ['undefined', 'null'].includes(token)) {
      setSnack({ message: 'Please sign in to add items to your cart.', severity: 'info' });
      return;
    }
    setCartBusy(true);
    try {
      await api.post('/api/cart/items', { productId: Number(id), quantity: qty });
      setCartAdded(true);
      setSnack({ message: `${qty} × ${product.name} added to your cart.`, severity: 'success' });
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('token'); navigate('/login'); return; }
      const data = err.response?.data;
      setSnack({ message: data?.message || (typeof data === 'string' ? data : 'This item could not be added. Please try again.'), severity: 'error' });
    } finally { setCartBusy(false); }
  };

  const retryProduct = () => { setLoading(true); setError(''); setRequest(value => value + 1); };
  const retryReviews = () => { setReviewsLoading(true); setReviewsError(''); setReviewRequest(value => value + 1); };
  const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length : null;
  const inStock = product?.stockQuantity > 0;
  const category = typeof product?.category === 'string' ? product.category : product?.category?.name;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, lg: 6 }, pb: 7 }}>
      <Button component={Link} to="/" color="inherit" startIcon={<ArrowBack sx={{ fontSize: 18 }} />} sx={{ px: 0, mb: { xs: 2.5, md: 4 }, color: 'text.secondary' }}>Back to shop</Button>
      {loading ? <Box aria-busy="true" aria-label="Loading product" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 5 }}>
        <Skeleton variant="rounded" sx={{ aspectRatio: '1', height: 'auto', borderRadius: '24px' }} />
        <Box><Skeleton height={30} width="30%" /><Skeleton height={70} /><Skeleton height={45} width="50%" /><Skeleton height={90} sx={{ my: 3 }} /><Skeleton height={56} /></Box>
      </Box> : !product ? <Box sx={{ p: 4, border: '1px solid #E6DBD3', borderRadius: '20px', bgcolor: 'white' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Product not found.'}</Alert><Button onClick={retryProduct} variant="contained">Try again</Button>
      </Box> : <>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1.05fr)' }, gap: { xs: 4, md: 6, lg: 8 }, alignItems: 'start' }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ position: 'relative', border: '1px solid #E6DBD3', borderRadius: '24px', overflow: 'hidden' }}>
              <ProductMedia src={gallery[selectedImage] || product.imageUrl} alt={product.name} priority />
              {product.discountPrice > 0 && product.discountPrice < product.price && <Chip label={`${Math.round((1 - product.discountPrice / product.price) * 100)}% off`} size="small" sx={{ position: 'absolute', left: 16, top: 16, bgcolor: 'white', color: 'primary.main', border: '1px solid #E7CCD4' }} />}
              <IconButton aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={wishlisted} onClick={() => setWishlisted(value => !value)} sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#FFFDFAF5', border: '1px solid #E6DBD3', '&:hover': { bgcolor: 'white' } }}>
                {wishlisted ? <Favorite color="primary" className="wishlist-confirmation" /> : <FavoriteBorder />}
              </IconButton>
            </Box>
            {gallery.length > 1 && <Box role="group" aria-label="Product images" sx={{ display: 'flex', gap: 1.5, mt: 2, overflowX: 'auto', p: .5 }}>
              {gallery.map((image, index) => <Button key={`${image}-${index}`} aria-label={`View product image ${index + 1}`} aria-pressed={selectedImage === index} onClick={() => setSelectedImage(index)} sx={{ minWidth: 72, width: 72, height: 72, p: .5, flexShrink: 0, border: '2px solid', borderColor: selectedImage === index ? 'primary.main' : '#E6DBD3', bgcolor: 'white' }}><Box component="img" src={image} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /></Button>)}
            </Box>}
          </Box>
          <Box sx={{ minWidth: 0, pt: { md: 1 } }}>
            {(product.brand || category) && <Typography sx={{ fontSize: '.68rem', textTransform: 'uppercase', letterSpacing: '.14em', color: '#9A7457', mb: 1.5 }}>{[product.brand, category].filter(Boolean).join(' / ')}</Typography>}
            <Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: { xs: '2rem', sm: '2.6rem', lg: '3.2rem' }, lineHeight: 1.15, letterSpacing: '-.025em', overflowWrap: 'anywhere', mb: 2 }}>{product.name}</Typography>
            <Button component="a" href="#product-information" onClick={() => setTab(1)} color="inherit" sx={{ p: 0, minHeight: 30, gap: 1, mb: 2, textAlign: 'left', flexWrap: 'wrap', justifyContent: 'start' }} aria-label="Read customer reviews"><Rating readOnly value={average || 0} precision={0.1} size="small" /><Typography variant="body2" color="text.secondary">{average ? `${average.toFixed(1)} · ${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}</Typography></Button>
            <ProductPrice product={product} large />
            <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap', my: 2.5 }}>
              <Chip variant="outlined" size="small" label={inStock ? `${product.stockQuantity} in stock` : 'Out of stock'} sx={{ color: inStock ? '#4F6958' : 'text.secondary', borderColor: inStock ? '#CDDACD' : '#DCCFC6' }} />
              {product.skinType && <Chip variant="outlined" size="small" label={product.skinType} />}
            </Stack>
            {product.description && <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, mb: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</Typography>}
            <Divider sx={{ my: 3 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Quantity</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'auto minmax(0, 1fr)' }, gap: 1.5, mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 136, border: '1px solid #DCCFC6', borderRadius: '10px', bgcolor: 'white' }}>
                <IconButton aria-label="Decrease quantity" disabled={qty <= 1 || cartBusy} onClick={() => { setQty(value => Math.max(1, value - 1)); setCartAdded(false); }}><Remove fontSize="small" /></IconButton>
                <Typography aria-live="polite" sx={{ minWidth: 26, textAlign: 'center', fontWeight: 500 }}>{qty}</Typography>
                <IconButton aria-label="Increase quantity" disabled={!inStock || qty >= product.stockQuantity || cartBusy} onClick={() => { setQty(value => Math.min(product.stockQuantity, value + 1)); setCartAdded(false); }}><Add fontSize="small" /></IconButton>
              </Box>
              <Button variant="contained" startIcon={cartBusy ? <CircularProgress color="inherit" size={18} /> : cartAdded ? <Check className="cart-confirmation" /> : <ShoppingCart />} disabled={!inStock || cartBusy} aria-busy={cartBusy} onClick={addToCart} sx={{ minHeight: 48 }}>{cartBusy ? 'Adding to cart…' : cartAdded ? 'Added · add again' : 'Add to cart'}</Button>
            </Box>
            <Button className="store-primary-action" fullWidth variant="outlined" endIcon={<ArrowForward />} disabled={!inStock} onClick={() => setCheckoutOpen(true)} sx={{ minHeight: 48, bgcolor: '#FFFDFC', mb: 1.5 }}>Buy now</Button>
            <Typography variant="caption" color="text.secondary">Cash on delivery. Online card and KOKO payments are not available.</Typography>
          </Box>
        </Box>
        <Box id="product-information" sx={{ mt: { xs: 5, md: 7 }, scrollMarginTop: 105 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Product information">
            {['Description', `Reviews (${reviews.length})`, ...(product.ingredients ? ['Ingredients'] : [])].map((label, index) => <Tab key={index} label={label} id={`product-tab-${index}`} aria-controls={`product-panel-${index}`} sx={{ px: { xs: 1.5, sm: 2.5 }, minHeight: 52 }} />)}
          </Tabs>
          <Divider />
          <Box role="tabpanel" hidden={tab !== 0} id="product-panel-0" aria-labelledby="product-tab-0" sx={{ pt: 3 }}><Typography color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{product.description || 'No description available.'}</Typography></Box>
          <Box role="tabpanel" hidden={tab !== 1} id="product-panel-1" aria-labelledby="product-tab-1" sx={{ pt: 3 }}>
            {tab === 1 && <ProductReviews productId={id} reviews={reviews} loading={reviewsLoading} error={reviewsError} onRetry={retryReviews} onSaved={review => setReviews(items => [review, ...items])} />}
          </Box>
          {product.ingredients && <Box role="tabpanel" hidden={tab !== 2} id="product-panel-2" aria-labelledby="product-tab-2" sx={{ pt: 3 }}><Typography color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{product.ingredients}</Typography></Box>}
        </Box>
        <DirectCheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} product={product} initialQty={qty} />
      </>}
      <Snackbar open={Boolean(snack.message)} autoHideDuration={4500} onClose={() => setSnack(value => ({ ...value, message: '' }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert variant="filled" severity={snack.severity} onClose={() => setSnack(value => ({ ...value, message: '' }))}>{snack.message}</Alert></Snackbar>
    </Container>
  );
}
