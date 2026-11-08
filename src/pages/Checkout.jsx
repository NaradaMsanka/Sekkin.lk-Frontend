import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Container, Divider,
  IconButton, InputAdornment, Skeleton, Stack, TextField, Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircleOutlined, Close, LocalOfferOutlined, LocationOnOutlined, ShoppingCartOutlined } from '@mui/icons-material';
import ProductMedia from '../components/storefront/ProductMedia';
import api from '../services/api';
import PolicyLinks from '../components/PolicyLinks';

const panel = { border: '1px solid #E6DBD3', borderRadius: '20px', bgcolor: '#FFFDFC', minWidth: 0 };
const formatter = new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = value => value != null && Number.isFinite(Number(value)) ? `Rs. ${formatter.format(Number(value))}` : '—';
const offers = [
  { code: 'GLOW10', description: '10% off your subtotal' },
  { code: 'WELCOME10', description: '10% off your subtotal' },
  { code: 'SAVE500', description: 'Rs. 500 off orders of Rs. 2,500 or more' },
];
const errorMessage = (error, fallback) => {
  const data = error.response?.data;
  return typeof data === 'string' ? data : typeof data?.message === 'string' ? data.message : fallback;
};

function CheckoutSection({ id, icon, title, description, children }) {
  return <Box component="section" aria-labelledby={id} sx={{ ...panel, p: { xs: 2.5, sm: 3.5 } }}>
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'start', mb: 3 }}>
      <Box sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, flexShrink: 0, borderRadius: '12px', bgcolor: '#F5EAE7', color: 'primary.main' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}><Typography id={id} component="h2" sx={{ fontSize: '1.1rem', fontWeight: 500, mb: .5 }}>{title}</Typography><Typography variant="body2" color="text.secondary" sx={{ fontSize: '.78rem', lineHeight: 1.8 }}>{description}</Typography></Box>
    </Stack>
    {children}
  </Box>;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [coupon, setCoupon] = useState('');
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [request, setRequest] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [uncertainOrder, setUncertainOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const orderPending = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || ['undefined', 'null'].includes(token)) { navigate('/login', { replace: true }); return; }
    const controller = new AbortController();
    const timer = setTimeout(() => { if (!controller.signal.aborted) setSlowLoading(true); }, 8000);
    api.get('/api/cart', { signal: controller.signal, timeout: 120000 })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data?.items) || data.totalPrice == null || !Number.isFinite(Number(data.totalPrice))) throw new Error('Invalid cart response');
        setCart(data);
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        if (err.response?.status === 401) { localStorage.removeItem('token'); navigate('/login', { replace: true }); return; }
        setCartError(errorMessage(err, 'We couldn’t load your order summary. Please try again.'));
      })
      .finally(() => { clearTimeout(timer); if (!controller.signal.aborted) { setCartLoading(false); setSlowLoading(false); } });
    return () => { controller.abort(); clearTimeout(timer); };
  }, [navigate, request]);

  useEffect(() => {
    if (!placedOrder) return;
    const timer = setTimeout(() => navigate('/orders'), 2500);
    return () => clearTimeout(timer);
  }, [placedOrder, navigate]);

  const retryCart = () => { setCartLoading(true); setSlowLoading(false); setCartError(''); setRequest(value => value + 1); };
  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const subtotal = Number(cart?.totalPrice || 0);
  const code = coupon.trim().toUpperCase();
  // Display estimates using the existing coupon rules. OrderService confirms the actual total.
  const discount = ['GLOW10', 'WELCOME10'].includes(code) ? subtotal * .1 : code === 'SAVE500' && subtotal >= 2500 ? 500 : 0;
  const estimatedTotal = Math.max(0, subtotal - discount);
  const offer = offers.find(item => item.code === code);
  const couponHelp = !code ? 'Choose an offer below or enter your own code.'
    : code === 'SAVE500' && subtotal < 2500 ? 'SAVE500 requires a subtotal of Rs. 2,500 or more.'
      : offer ? `${offer.description}. Your discount is shown in the estimate.` : 'This code will be checked when you place your order.';

  const handleCheckout = async event => {
    event.preventDefault();
    if (orderPending.current || cartLoading || !items.length || !address.trim()) return;
    const token = localStorage.getItem('token');
    if (!token || ['undefined', 'null'].includes(token)) { navigate('/login', { replace: true }); return; }
    orderPending.current = true; setSubmitting(true); setOrderError(''); setUncertainOrder(false);
    try {
      const { data } = await api.post('/api/orders', {
        shippingAddress: address,
        couponCode: code || null,
      });
      setPlacedOrder(data || {});
      // This endpoint clears the cart after the order is successfully created.
      window.dispatchEvent(new CustomEvent('sekkin:cart-updated', { detail: { items: [] } }));
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('token'); navigate('/login', { replace: true }); return; }
      const uncertain = !err.response || err.response.status >= 500;
      setUncertainOrder(uncertain);
      setOrderError(uncertain ? 'We couldn’t confirm your order. Check My orders before trying again.' : errorMessage(err, 'Your order couldn’t be placed. Please review your cart and try again.'));
    } finally { orderPending.current = false; setSubmitting(false); }
  };

  if (placedOrder) return <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, px: 2 }}>
    <Box className="store-entrance" role="status" sx={{ ...panel, p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
      <Box sx={{ display: 'grid', placeItems: 'center', width: 76, height: 76, mx: 'auto', mb: 3, borderRadius: '50%', bgcolor: '#EDF3EC', color: 'success.main' }}><CheckCircleOutlined sx={{ fontSize: 36 }} /></Box>
      <Typography sx={{ color: '#9A7457', fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.15em', mb: 1 }}>Thank you for choosing Sekkin.lk</Typography>
      <Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2rem', sm: '2.5rem' }, mb: 2 }}>Your order is received</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, mb: 3 }}>We’ve received your order{placedOrder.id != null ? ` #${placedOrder.id}` : ''}. You can follow its progress in My orders.</Typography>
      {placedOrder.totalAmount != null && <Box sx={{ borderBlock: '1px solid #E6DBD3', py: 2, mb: 3 }}><Typography variant="caption" color="text.secondary">Order total</Typography><Typography sx={{ color: 'primary.main', fontWeight: 600, fontSize: '1.5rem', mt: .5 }}>{money(placedOrder.totalAmount)}</Typography></Box>}
      <Button component={Link} to="/orders" variant="contained" fullWidth endIcon={<ArrowForward />}>View my orders</Button>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>Taking you to your orders shortly…</Typography>
    </Box>
  </Container>;

  return <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 6 }, pt: { xs: 3, md: 5 }, pb: { xs: 6, md: 9 } }}>
    <Button component={Link} to="/cart" startIcon={<ArrowBack sx={{ fontSize: 18 }} />} color="inherit" sx={{ px: 0, mb: { xs: 3, md: 4 }, color: 'text.secondary' }}>Back to cart</Button>
    <Box className="store-entrance" sx={{ mb: { xs: 3, md: 4 } }}>
      <Typography sx={{ color: '#9A7457', fontSize: '.65rem', letterSpacing: '.17em', textTransform: 'uppercase', mb: 1 }}>The Sekkin edit</Typography>
      <Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2.3rem', md: '3rem' }, fontWeight: 400, lineHeight: 1.2, letterSpacing: '-.025em', mb: 1 }}>Checkout</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>Confirm your delivery address and review your order.</Typography>
    </Box>

    {cartLoading ? <Box aria-busy="true" aria-label="Loading checkout">
      {slowLoading && <Alert severity="info" role="status" sx={{ mb: 3 }}>We’re still connecting to the store. Your order summary will appear shortly.</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 380px' }, gap: 3 }}><Stack spacing={3}><Skeleton variant="rounded" height={300} sx={{ borderRadius: '20px' }} /><Skeleton variant="rounded" height={220} sx={{ borderRadius: '20px' }} /></Stack><Skeleton variant="rounded" height={410} sx={{ borderRadius: '20px' }} /></Box>
    </Box> : cartError ? <Box sx={{ ...panel, p: { xs: 3, sm: 5 } }}><Alert severity="error" sx={{ mb: 3 }}>{cartError}</Alert><Button variant="contained" onClick={retryCart}>Reload order summary</Button></Box>
      : !items.length ? <Box sx={{ ...panel, py: { xs: 6, md: 9 }, px: 3, textAlign: 'center' }}>
        <ShoppingCartOutlined sx={{ fontSize: 40, color: '#A88B79', mb: 2 }} /><Typography component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: '2rem', mb: 1.5 }}>Your cart is waiting to be filled</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Add your favourites to the cart before checking out.</Typography><Button component={Link} to="/" variant="contained" endIcon={<ArrowForward />}>Explore the collection</Button>
      </Box> : <Box component="form" id="cart-checkout-form" onSubmit={handleCheckout} aria-busy={submitting} sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px', lg: 'minmax(0, 1fr) 380px' }, gap: { xs: 3, lg: 4 }, alignItems: 'start' }}>
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          <CheckoutSection id="checkout-delivery-heading" icon={<LocationOnOutlined sx={{ fontSize: 21 }} />} title="01. Delivery details" description="Let us know where your order should arrive.">
            <TextField id="checkout-address" label="Full delivery address" fullWidth required multiline minRows={4} maxRows={8} autoComplete="street-address" value={address} onChange={event => setAddress(event.target.value)} disabled={submitting} placeholder="House number, street, city, province and postal code" helperText="Include your complete address so we can find you easily." />
          </CheckoutSection>
          <CheckoutSection id="checkout-coupon-heading" icon={<LocalOfferOutlined sx={{ fontSize: 21 }} />} title="02. Have a coupon?" description="A little saving for your daily favourites. This step is optional.">
            <TextField id="checkout-coupon" label="Coupon code" fullWidth value={coupon} onChange={event => setCoupon(event.target.value.toUpperCase())} disabled={submitting} autoComplete="off" helperText={couponHelp} slotProps={{ input: { endAdornment: coupon ? <InputAdornment position="end"><IconButton aria-label="Clear coupon code" edge="end" disabled={submitting} onClick={() => setCoupon('')}><Close sx={{ fontSize: 18 }} /></IconButton></InputAdornment> : null }, htmlInput: { spellCheck: false } }} sx={{ mb: 2.5 }} />
            <Box role="group" aria-label="Available coupon offers" sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
              {offers.map(item => <Button key={item.code} aria-label={`Use ${item.code}`} aria-pressed={code === item.code} disabled={submitting} onClick={() => setCoupon(item.code)} variant="outlined" sx={{ display: 'block', textAlign: 'left', p: 1.5, color: code === item.code ? 'primary.main' : 'text.primary', borderColor: code === item.code ? 'primary.main' : '#E6DBD3', bgcolor: code === item.code ? '#F8EDEF' : 'white', height: '100%', '&:hover': { borderColor: 'primary.main', bgcolor: '#F8EDEF' } }}><Typography component="span" sx={{ display: 'block', fontSize: '.75rem', fontWeight: 600, mb: .5 }}>{item.code}</Typography><Typography component="span" sx={{ display: 'block', fontSize: '.66rem', lineHeight: 1.7, color: 'text.secondary', fontWeight: 400 }}>{item.description}</Typography></Button>)}
            </Box>
          </CheckoutSection>
        </Stack>

        <Box component="aside" aria-labelledby="checkout-summary-heading" sx={{ ...panel, p: { xs: 2.5, sm: 3 }, position: { md: 'sticky' }, top: 108 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 2 }}><Typography id="checkout-summary-heading" component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: '1.7rem' }}>Your order</Typography><Button component={Link} to="/cart" size="small" disabled={submitting} sx={{ minWidth: 0, p: .5 }}>Edit cart</Button></Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>{itemCount} {itemCount === 1 ? 'item' : 'items'}, chosen by you</Typography>
          <Stack component="ul" spacing={2} aria-label="Order items" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {items.map(item => <Box component="li" key={item.id ?? item.product.id} sx={{ display: 'grid', gridTemplateColumns: '52px minmax(0, 1fr)', gap: 1.5, alignItems: 'start' }}>
              <ProductMedia src={item.product.imageUrl} alt={item.product.name} sx={{ borderRadius: '8px', '& .MuiTypography-root': { display: 'none' }, '& .MuiSvgIcon-root': { fontSize: 24 } }} />
              <Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: '.77rem', lineHeight: 1.7, fontWeight: 500, overflowWrap: 'anywhere' }}>{item.product.name}</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mt: .5 }}><Typography variant="caption" color="text.secondary">Qty {item.quantity}</Typography><Typography sx={{ fontSize: '.77rem', whiteSpace: 'nowrap' }}>{money(item.price)}</Typography></Box></Box>
            </Box>)}
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 1.75, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography><Typography variant="body2" sx={{ textAlign: 'right' }}>{money(cart.totalPrice)}</Typography>
            <Typography variant="body2" color="text.secondary">Delivery</Typography><Typography variant="body2" sx={{ color: 'success.main', textAlign: 'right' }}>Free</Typography>
            {discount > 0 && <><Typography variant="body2" sx={{ color: 'success.main', overflowWrap: 'anywhere' }}>Coupon ({code})</Typography><Typography id="checkout-discount" variant="body2" sx={{ color: 'success.main', textAlign: 'right', whiteSpace: 'nowrap' }}>− {money(discount)}</Typography></>}
          </Box>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, mb: 2 }}><Typography sx={{ fontSize: '.9rem', fontWeight: 500 }}>Estimated total</Typography><Typography id="checkout-total" aria-live="polite" sx={{ color: 'primary.main', fontSize: '1.4rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{money(estimatedTotal)}</Typography></Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.8, mb: 3 }}>Discounts and availability are confirmed when you place your order.</Typography>
          <PolicyLinks />
          {orderError && <Alert severity="error" sx={{ mb: 2 }}>{orderError}{uncertainOrder && <Button component={Link} to="/orders" color="inherit" size="small" sx={{ display: 'flex', mt: 1, px: 0 }}>Check my orders</Button>}</Alert>}
          <Button type="submit" fullWidth variant="contained" disabled={submitting || !address.trim()} aria-busy={submitting} endIcon={submitting ? <CircularProgress size={17} color="inherit" /> : <ArrowForward />} className="store-primary-action" sx={{ minHeight: 50 }}>{submitting ? 'Placing your order…' : 'Place order'}</Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2, lineHeight: 1.8 }}>{submitting ? 'Please keep this page open while we confirm your order.' : 'Your order confirmation will appear here.'}</Typography>
        </Box>
      </Box>}
  </Container>;
}
