import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, Grid, Box, Typography, Button, Chip, Divider,
  Card, CardContent, Rating, TextField, Stack, Alert,
  Skeleton, Avatar, Tabs, Tab, IconButton, Snackbar
} from "@mui/material";
import {
  ShoppingCart, Favorite, FavoriteBorder, Spa,
  LocalOffer, Inventory, Star, Send, ArrowBack, ElectricBolt
} from "@mui/icons-material";

import { REAL_COSMETICS_PRODUCTS } from "../data/realCosmeticsCatalog";
import DirectCheckoutModal from "../components/DirectCheckoutModal";
import api, { API_BASE_URL, API, resolveImageUrl } from "../services/api";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [qty, setQty] = useState(1);
  const [directCheckoutOpen, setDirectCheckoutOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/products/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found in backend');
        return r.json();
      })
      .then(prod => {
        setProduct(prod);
        setSelectedImageIndex(0);
      })
      .catch(() => {
        const found = REAL_COSMETICS_PRODUCTS.find(p => String(p.id) === String(id));
        if (found) {
          setProduct(found);
          setSelectedImageIndex(0);
        }
      })
      .finally(() => setLoading(false));

    api.get(`/api/products/${id}/reviews`)
      .then(r => setReviews(r.data))
      .catch(() => setReviews([]));
  }, [id]);

  // Gallery image sequence parsing
  const galleryImages = (() => {
    if (!product) return [];
    let list = [];
    if (product.images) {
      try {
        const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      } catch (e) {
        console.error('Failed to parse product.images', e);
      }
    }
    if (list.length === 0 && product.imageUrl) {
      list = [product.imageUrl];
    }
    return list.map(img => resolveImageUrl(img));
  })();

  const currentDisplayImage = galleryImages[selectedImageIndex] || resolveImageUrl(product?.imageUrl) || null;

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    // Token නැත්නම් — redirect නොකර friendly toast show කරනවා
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      setSnack({ open: true, msg: '🔐 Please login to add items to cart!', severity: 'warning' });
      return;
    }
    try {
      await api.post('/api/cart/items', { productId: parseInt(id, 10), quantity: qty });
      setSnack({ open: true, msg: `${qty}x ${product.name} added to cart! 🛒`, severity: 'success' });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setSnack({ open: true, msg: '⚠️ Session expired. Please log in again.', severity: 'warning' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      setSnack({ open: true, msg: err.response?.data?.message || err.response?.data || 'Failed to add to cart', severity: 'error' });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setSnack({ open: true, msg: '🔐 Please login to submit a review!', severity: 'warning' });
      return;
    }
    setReviewLoading(true);
    try {
      const res = await api.post(`/api/products/${id}/reviews`, newReview);
      setReviews(prev => [res.data, ...prev]);
      setNewReview({ rating: 5, comment: "" });
      setSnack({ open: true, msg: 'Review submitted! ✨', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, msg: err.response?.data || 'You may not have purchased this product yet.', severity: 'error' });
    } finally {
      setReviewLoading(false);
    }
  };

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  if (loading) return (
    <Container sx={{ py: 5 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} /></Grid>
        <Grid item xs={12} md={7}><Skeleton variant="text" width="80%" height={50} /><Skeleton variant="text" width="40%" /><Skeleton variant="text" width="60%" height={40} /></Grid>
      </Grid>
    </Container>
  );

  if (!product) return <Container sx={{ py: 5 }}><Alert severity="error">Product not found.</Alert></Container>;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 3 }} color="inherit">
        Back to Shop
      </Button>

      <Grid container spacing={4}>
        {/* Product Image & Sequence Gallery */}
        <Grid item xs={12} md={5}>
          <Box sx={{
            height: 460, borderRadius: 4, overflow: 'hidden', position: 'relative',
            bgcolor: '#FAF6F4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(201,149,106,0.22)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
          }}>
            {currentDisplayImage ? (
              <Box
                component="img"
                src={currentDisplayImage}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.04)' }
                }}
              />
            ) : (
              <Spa sx={{ fontSize: 120, color: 'primary.light', opacity: 0.4 }} />
            )}
            {hasDiscount && (
              <Chip label={`${discountPct}% OFF`} color="error" size="small"
                sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 700, fontSize: '0.85rem', boxShadow: 1 }} />
            )}
            <IconButton onClick={() => setWishlisted(v => !v)}
              sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' } }}>
              {wishlisted ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Box>

          {/* Sequence Thumbnails Row */}
          {galleryImages.length > 1 && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 2, overflowX: 'auto', py: 0.5, alignItems: 'center' }}>
              {galleryImages.map((img, idx) => (
                <Box
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  sx={{
                    width: 76,
                    height: 76,
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    flexShrink: 0,
                    border: '2px solid',
                    borderColor: selectedImageIndex === idx ? 'primary.main' : 'transparent',
                    boxShadow: selectedImageIndex === idx ? '0 4px 12px rgba(224, 75, 124, 0.35)' : 'none',
                    opacity: selectedImageIndex === idx ? 1 : 0.65,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': { opacity: 1, transform: 'translateY(-2px)' }
                  }}
                >
                  <Box component="img" src={img} alt={`View ${idx + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {idx === 0 && (
                    <Box sx={{
                      position: 'absolute', bottom: 2, left: 2, right: 2,
                      bgcolor: 'rgba(0,0,0,0.6)', color: 'white',
                      fontSize: '0.6rem', textAlign: 'center', py: 0.2, borderRadius: 0.5, fontWeight: 700
                    }}>
                      MAIN
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={7}>
          {product.brand && (
            <Typography variant="overline" color="secondary.main" fontWeight={700} letterSpacing={2}>
              {product.brand}
            </Typography>
          )}
          <Typography variant="h3" fontWeight={800} sx={{ mb: 1, lineHeight: 1.2 }}>{product.name}</Typography>

          {/* Rating */}
          {avgRating && (
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Rating value={parseFloat(avgRating)} readOnly precision={0.1} size="small" />
              <Typography variant="body2" color="text.secondary">{avgRating} ({reviews.length} reviews)</Typography>
            </Stack>
          )}

          {/* Price */}
          <Box mb={3}>
            {hasDiscount ? (
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h4" color="primary" fontWeight={800}>Rs. {product.discountPrice}</Typography>
                <Typography variant="h6" color="text.disabled" sx={{ textDecoration: 'line-through' }}>Rs. {product.price}</Typography>
                <Chip label={`Save Rs. ${(product.price - product.discountPrice).toFixed(2)}`} color="success" size="small" icon={<LocalOffer />} />
              </Stack>
            ) : (
              <Typography variant="h4" color="primary" fontWeight={800}>Rs. {product.price}</Typography>
            )}
          </Box>

          {/* Tags */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={3}>
            {product.skinType && <Chip label={`Skin: ${product.skinType}`} variant="outlined" color="primary" icon={<Spa />} />}
            <Chip
              icon={<Inventory />}
              label={product.stockQuantity === 0 ? 'Out of Stock' : `${product.stockQuantity} in stock`}
              color={product.stockQuantity === 0 ? 'error' : product.stockQuantity <= 10 ? 'warning' : 'success'}
              variant="outlined"
            />
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Quantity & Cart */}
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 30, overflow: 'hidden' }}>
              <IconButton size="small" onClick={() => setQty(q => Math.max(1, q - 1))} sx={{ borderRadius: 0, px: 2 }}>−</IconButton>
              <Typography sx={{ px: 2, fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{qty}</Typography>
              <IconButton size="small" onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))} sx={{ borderRadius: 0, px: 2 }}>+</IconButton>
            </Box>
            <Button variant="contained" size="large" startIcon={<ShoppingCart />}
              disabled={product.stockQuantity === 0}
              onClick={handleAddToCart} sx={{ flexGrow: 1, py: 1.5 }}>
              {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<ElectricBolt />}
            disabled={product.stockQuantity === 0}
            onClick={() => setDirectCheckoutOpen(true)}
            sx={{
              bgcolor: '#1A1A1A',
              color: '#FFE082',
              fontWeight: 800,
              fontSize: '1rem',
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 4px 18px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: '#B5385C',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 22px rgba(181,56,92,0.4)'
              },
              transition: 'all 0.25s ease'
            }}
          >
            ⚡ Pay Now (Card, Koko or COD)
          </Button>
        </Grid>
      </Grid>

      {/* Tabs: Description & Reviews */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary">
          <Tab label="Description" />
          <Tab label={`Reviews (${reviews.length})`} />
          {product.ingredients && <Tab label="Ingredients" />}
        </Tabs>
        <Divider />

        <Box sx={{ pt: 3 }}>
          {tab === 0 && (
            <Typography variant="body1" color="text.secondary" lineHeight={1.9}>
              {product.description || 'No description available.'}
            </Typography>
          )}

          {tab === 1 && (
            <Box>
              {/* Write Review */}
              <Card sx={{ mb: 4, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.light' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>Write a Review</Typography>
                  <Box component="form" onSubmit={handleSubmitReview}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" mb={0.5}>Your Rating</Typography>
                        <Rating value={newReview.rating} onChange={(_, v) => setNewReview(r => ({ ...r, rating: v }))} size="large" />
                      </Box>
                      <TextField fullWidth multiline rows={3} label="Your Review" required
                        value={newReview.comment} onChange={e => setNewReview(r => ({ ...r, comment: e.target.value }))} />
                      <Button type="submit" variant="contained" startIcon={<Send />} disabled={reviewLoading} sx={{ alignSelf: 'flex-start' }}>
                        {reviewLoading ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              {reviews.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Star sx={{ fontSize: 48, color: 'divider' }} />
                  <Typography color="text.secondary">No reviews yet. Be the first!</Typography>
                </Box>
              ) : reviews.map((rev, i) => (
                <Box key={i} sx={{ mb: 3, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38, fontSize: 15 }}>
                      {rev.userEmail?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography fontWeight={600}>{rev.userEmail}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(rev.createdAt).toLocaleDateString('en-LK')}
                        </Typography>
                      </Stack>
                      <Rating value={rev.rating} readOnly size="small" sx={{ mb: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">{rev.comment}</Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Box>
          )}

          {tab === 2 && (
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.9 }}>
              {product.ingredients}
            </Typography>
          )}
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Direct Instant Checkout Modal */}
      <DirectCheckoutModal
        open={directCheckoutOpen}
        onClose={() => setDirectCheckoutOpen(false)}
        product={product}
        initialQty={qty}
      />
    </Container>
  );
}