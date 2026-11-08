import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, Divider,
  IconButton, Skeleton, Snackbar, Stack, Typography,
} from '@mui/material';
import { Add, ArrowBack, ArrowForward, DeleteOutlined, Remove, ShoppingCartOutlined } from '@mui/icons-material';
import ProductMedia from '../components/storefront/ProductMedia';
import api from '../services/api';

const border = '#E6DBD3';
const panel = { border: `1px solid ${border}`, borderRadius: '20px', bgcolor: '#FFFDFC' };
const formatter = new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = value => value != null && Number.isFinite(Number(value)) ? `Rs. ${formatter.format(Number(value))}` : '—';
const errorMessage = (error, fallback) => {
  const data = error.response?.data;
  return typeof data === 'string' ? data : typeof data?.message === 'string' ? data.message : fallback;
};
const validCart = data => data && Array.isArray(data.items);

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);
  const [error, setError] = useState('');
  const [request, setRequest] = useState(0);
  const [busyProduct, setBusyProduct] = useState(null);
  const [notice, setNotice] = useState('');
  const mutationPending = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || ['undefined', 'null'].includes(token)) { navigate('/login', { replace: true }); return; }
    const controller = new AbortController();
    const slowTimer = setTimeout(() => { if (!controller.signal.aborted) setSlowLoading(true); }, 8000);
    api.get('/api/cart', { signal: controller.signal, timeout: 120000 })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        if (!validCart(data)) throw new Error('Invalid cart response');
        setCart(data);
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        if (err.response?.status === 401) {
          localStorage.removeItem('token'); navigate('/login', { replace: true }); return;
        }
        setError(errorMessage(err, 'We couldn’t load your cart. Please try again.'));
      })
      .finally(() => {
        clearTimeout(slowTimer);
        if (!controller.signal.aborted) { setLoading(false); setSlowLoading(false); }
      });
    return () => { controller.abort(); clearTimeout(slowTimer); };
  }, [navigate, request]);

  const refresh = () => { setLoading(true); setSlowLoading(false); setError(''); setRequest(value => value + 1); };

  const updateItem = async (productId, quantity) => {
    if (mutationPending.current || (quantity !== undefined && quantity < 1)) return;
    mutationPending.current = true;
    setBusyProduct(productId); setError('');
    try {
      // Both existing endpoints return the updated cart, including authoritative totals.
      const { data } = quantity === undefined
        ? await api.delete(`/api/cart/items/${productId}`)
        : await api.put(`/api/cart/items/${productId}?quantity=${quantity}`, {});
      if (!validCart(data)) throw new Error('Invalid cart response');
      setCart(data);
      setNotice(quantity === undefined ? 'Item removed from your cart.' : 'Cart quantity updated.');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token'); navigate('/login', { replace: true }); return;
      }
      setError(errorMessage(err, 'We couldn’t update your cart. Refresh the cart to check its latest details.'));
    } finally { mutationPending.current = false; setBusyProduct(null); }
  };

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const updating = busyProduct !== null;

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 6 }, pt: { xs: 3, md: 5 }, pb: { xs: 6, md: 9 } }}>
      <Button component={Link} to="/" color="inherit" startIcon={<ArrowBack sx={{ fontSize: 18 }} />} sx={{ px: 0, mb: { xs: 3, md: 4 }, color: 'text.secondary' }}>Continue shopping</Button>
      <Box className="store-entrance" sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography sx={{ color: '#9A7457', fontSize: '.65rem', letterSpacing: '.17em', textTransform: 'uppercase', mb: 1 }}>The Sekkin edit</Typography>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
          <Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2.3rem', md: '3rem' }, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-.025em' }}>Your cart</Typography>
          {!loading && cart && <Chip label={`${itemCount} ${itemCount === 1 ? 'item' : 'items'}`} size="small" sx={{ bgcolor: '#F0E0E2', color: 'primary.main', borderRadius: '20px' }} />}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>A few favourites, chosen by you. Review your items before checkout.</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} action={<Button onClick={refresh} disabled={updating} color="inherit" size="small">Retry</Button>}>{error}</Alert>}

      {loading ? <Box aria-busy="true" aria-label="Loading cart">
        {slowLoading && <Alert severity="info" role="status" sx={{ mb: 3 }}>Your cart is taking a little longer to load. We’re still connecting to the store.</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' }, gap: 3 }}>
          <Stack spacing={2}>{[1, 2].map(value => <Skeleton key={value} variant="rounded" height={168} sx={{ borderRadius: '20px' }} />)}</Stack>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: '20px' }} />
        </Box>
      </Box> : !cart ? <Box sx={{ ...panel, p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
        <ShoppingCartOutlined sx={{ color: '#A88B79', fontSize: 42, mb: 2 }} />
        <Typography component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', mb: 1 }}>Let’s reconnect to your cart</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Your cart couldn’t be loaded. Try again when the store is ready.</Typography>
        <Button variant="contained" onClick={refresh}>Try again</Button>
      </Box> : items.length === 0 ? <Box className="store-entrance" sx={{ ...panel, py: { xs: 6, md: 9 }, px: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'grid', placeItems: 'center', width: 76, height: 76, borderRadius: '50%', bgcolor: '#F5EAE7', color: 'primary.main', mx: 'auto', mb: 3 }}><ShoppingCartOutlined sx={{ fontSize: 32 }} /></Box>
        <Typography component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '1.8rem', sm: '2.2rem' }, mb: 1.5 }}>Your next favourite is waiting</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 390, mx: 'auto', mb: 3.5, lineHeight: 1.9 }}>Your cart is empty. Explore the collection and find a little something for your daily routine.</Typography>
        <Button component={Link} to="/" variant="contained" endIcon={<ArrowForward />} className="store-primary-action">Explore the collection</Button>
      </Box> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px', lg: 'minmax(0, 1fr) 380px' }, gap: { xs: 3, lg: 4 }, alignItems: 'start' }}>
        <Box component="section" aria-label="Cart items" sx={{ minWidth: 0 }}>
          <Stack spacing={2}>
            {items.map(item => {
              const product = item.product;
              const unitPrice = item.price != null && Number(item.quantity) > 0 ? Number(item.price) / Number(item.quantity) : null;
              const discounted = unitPrice != null && Number(product.price) > unitPrice;
              const stock = product.stockQuantity != null ? Number(product.stockQuantity) : null;
              const rowBusy = busyProduct === product.id;
              return <Box component="article" key={item.id ?? product.id} aria-busy={rowBusy} className="cart-line" sx={{ ...panel, p: { xs: 2, sm: 2.5 }, display: 'grid', gridTemplateColumns: { xs: '76px minmax(0, 1fr)', sm: '104px minmax(0, 1fr)' }, columnGap: { xs: 1.5, sm: 2.5 }, rowGap: 2, opacity: rowBusy ? .65 : 1, transition: 'opacity 180ms ease' }}>
                <Box component={Link} to={`/product/${product.id}`} aria-label={`View ${product.name}`} sx={{ display: 'block', alignSelf: 'start', borderRadius: '12px', overflow: 'hidden' }}>
                  <ProductMedia src={product.imageUrl} alt={product.name} sx={{ borderRadius: '12px', '& .MuiTypography-root': { display: 'none' }, '& .MuiSvgIcon-root': { fontSize: 30 } }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: .5 }}>
                    <Box sx={{ flex: 1, minWidth: 0, pt: .25 }}>
                      {product.brand && <Typography sx={{ color: '#9A7457', fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.12em', mb: .5, overflowWrap: 'anywhere' }}>{product.brand}</Typography>}
                      <Typography component={Link} to={`/product/${product.id}`} sx={{ display: 'block', fontSize: { xs: '.88rem', sm: '1rem' }, fontWeight: 500, color: 'text.primary', textDecoration: 'none', lineHeight: 1.6, overflowWrap: 'anywhere', '&:hover': { color: 'primary.main' } }}>{product.name}</Typography>
                    </Box>
                    <IconButton aria-label={`Remove ${product.name} from cart`} disabled={updating} onClick={() => updateItem(product.id)} sx={{ flexShrink: 0, color: '#947B73', mt: -.75, mr: -.75, '&:hover': { color: 'primary.main', bgcolor: '#F8EDEF' } }}><DeleteOutlined sx={{ fontSize: 21 }} /></IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: .75, mt: 1 }}>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>{money(unitPrice)}</Typography>
                    {discounted && <Typography component="span" variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>{money(product.price)}</Typography>}
                    <Typography variant="caption" color="text.secondary">each</Typography>
                  </Box>
                </Box>
                <Box sx={{ gridColumn: { xs: '1 / -1', sm: '2' }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
                  <Box role="group" aria-label={`Quantity for ${product.name}`} sx={{ display: 'flex', alignItems: 'center', border: '1px solid #DCCFC6', borderRadius: '10px', bgcolor: 'white' }}>
                    <IconButton aria-label={`Decrease quantity of ${product.name}`} disabled={updating || item.quantity <= 1} onClick={() => updateItem(product.id, Number(item.quantity) - 1)}><Remove sx={{ fontSize: 18 }} /></IconButton>
                    <Typography aria-live="polite" sx={{ minWidth: 30, textAlign: 'center', fontWeight: 500, fontSize: '.88rem' }}>{item.quantity}</Typography>
                    <IconButton aria-label={`Increase quantity of ${product.name}`} disabled={updating || (stock !== null && item.quantity >= stock)} onClick={() => updateItem(product.id, Number(item.quantity) + 1)}><Add sx={{ fontSize: 18 }} /></IconButton>
                  </Box>
                  <Box sx={{ textAlign: 'right', ml: 'auto' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '.65rem', mb: .25 }}>Item total</Typography>
                    <Typography className="cart-line-total" sx={{ fontSize: { xs: '.95rem', sm: '1.05rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>{money(item.price)}</Typography>
                  </Box>
                </Box>
              </Box>;
            })}
          </Stack>
          <Typography variant="caption" color="text.secondary" role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 38, mt: 1 }}>{updating && <><CircularProgress size={12} color="inherit" /> Updating your cart…</>}</Typography>
        </Box>

        <Box component="aside" aria-labelledby="cart-summary-heading" sx={{ ...panel, p: { xs: 2.5, sm: 3 }, position: { md: 'sticky' }, top: 108, minWidth: 0 }}>
          <Typography sx={{ fontSize: '.62rem', letterSpacing: '.14em', textTransform: 'uppercase', color: '#9A7457', mb: 1 }}>Ready when you are</Typography>
          <Typography id="cart-summary-heading" component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: '1.7rem', mb: 3 }}>Order summary</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 2, alignItems: 'center', fontSize: '.88rem' }}>
            <Typography variant="body2" color="text.secondary">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</Typography><Typography variant="body2" sx={{ textAlign: 'right' }}>{money(cart.totalPrice)}</Typography>
            <Typography variant="body2" color="text.secondary">Delivery</Typography><Typography variant="body2" sx={{ color: 'success.main', textAlign: 'right' }}>Free</Typography>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, mb: 3 }}>
            <Typography sx={{ fontWeight: 500 }}>Total</Typography><Typography id="cart-total" aria-live="polite" sx={{ fontSize: { xs: '1.3rem', sm: '1.45rem' }, fontWeight: 600, color: 'primary.main', whiteSpace: 'nowrap' }}>{money(cart.totalPrice)}</Typography>
          </Box>
          <Button component={Link} to="/checkout" fullWidth variant="contained" disabled={updating} endIcon={<ArrowForward />} className="store-primary-action" sx={{ minHeight: 50, px: 2 }}>Proceed to checkout</Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2, lineHeight: 1.8 }}>Review your delivery details in the next step.</Typography>
        </Box>
      </Box>}
      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert severity="success" variant="filled" onClose={() => setNotice('')}>{notice}</Alert></Snackbar>
    </Container>
  );
}
