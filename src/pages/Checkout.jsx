import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Container, Divider,
  Skeleton, Stack, TextField, Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircleOutlined, LocalOfferOutlined, LocationOnOutlined, ShoppingCartOutlined } from '@mui/icons-material';
import ProductMedia from '../components/storefront/ProductMedia';
import api from '../services/api';
import PolicyLinks from '../components/PolicyLinks';
import DeliveryPricingNotice from '../components/DeliveryPricingNotice';
import { estimateOrderTotals, formatDeliveryCharge } from '../content/delivery';
import { orderRequests, validateOrderReceipt } from '../services/orderRequest';
import { getSessionToken } from '../services/checkoutAuth';
import usePromotion from '../services/usePromotion';
import PromoCodeField from '../components/PromoCodeField';

const panel = { border: '1px solid #E6DBD3', borderRadius: '20px', bgcolor: '#FFFDFC', minWidth: 0 };
const formatter = new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = value => value != null && Number.isFinite(Number(value)) ? `Rs. ${formatter.format(Number(value))}` : '—';
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
  const [customerPhone, setCustomerPhone] = useState('');
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);
  const [cartError, setCartError] = useState('');
  const [request, setRequest] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [uncertainOrder, setUncertainOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [retryWarning, setRetryWarning] = useState('');
  const [priceChanged, setPriceChanged] = useState(false);
  const orderPending = useRef(false);

  useEffect(() => {
    const token = getSessionToken();
    if (!token) { navigate('/login', { replace: true, state: { from: '/checkout', loginRequired: true } }); return; }
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
        if (err.response?.status === 401) { localStorage.removeItem('token'); navigate('/login', { replace: true, state: { from: '/checkout', loginRequired: true } }); return; }
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

  const retryCart = () => { setCartLoading(true); setSlowLoading(false); setCartError(''); setPriceChanged(false); setOrderError(''); setRequest(value => value + 1); };
  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const subtotal = Number(cart?.totalPrice || 0);
  const promotion = usePromotion(items.map(item => ({ productId: item.product.id, quantity: item.quantity,
    unitPrice: Number(item.price) / Number(item.quantity) })), { from: '/checkout', loginRequired: true }, () => setPriceChanged(true));
  const code = promotion.quote?.couponCode || null;
  const { couponDiscount: discount, deliveryCharge, total: estimatedTotal } = promotion.quote || estimateOrderTotals(subtotal, 0, items.length > 0);

  const handleCheckout = async event => {
    event.preventDefault();
    if (orderPending.current || cartLoading || priceChanged || !items.length || !address.trim() || !customerPhone.trim()) return;
    const token = getSessionToken();
    if (!token) { navigate('/login', { replace: true, state: { from: '/checkout', loginRequired: true } }); return; }
    promotion.cancelCheck();
    orderPending.current = true; setSubmitting(true); setOrderError(''); setUncertainOrder(false);
    let requestSent = false;
    try {
      const retry = await orderRequests.get('cart', {
        account: token,
        items: items.map(item => ({ productId: item.product.id, quantity: Number(item.quantity) })).sort((a, b) => Number(a.productId) - Number(b.productId)),
        shippingAddress: address.trim(), customerPhone: customerPhone.trim(), couponCode: code || null, expectedTotal: estimatedTotal,
      }, { newPurchase: true });
      setRetryWarning(retry.warning);
      requestSent = true;
      const { data } = await api.post('/api/orders', {
        shippingAddress: address.trim(),
        customerPhone: customerPhone.trim(),
        couponCode: code || null,
        expectedTotal: estimatedTotal,
        cartItems: items.map(item => ({ productId: item.product.id, quantity: Number(item.quantity) })),
      }, { headers: { 'Idempotency-Key': retry.key } });
      setPlacedOrder(validateOrderReceipt(data));
      const completion = orderRequests.complete('cart', retry.key);
      if (completion.warning) setRetryWarning(completion.warning);
      // This endpoint clears the cart after the order is successfully created.
      window.dispatchEvent(new CustomEvent('sekkin:cart-updated', { detail: { items: [] } }));
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('token'); navigate('/login', { replace: true, state: { from: '/checkout', loginRequired: true } }); return; }
      if (err.response?.status === 400 && promotion.quote) promotion.changeCode(promotion.code);
      const uncertain = requestSent && (!err.response || err.response.status >= 500);
      setUncertainOrder(uncertain);
      setPriceChanged(err.response?.status === 409);
      setOrderError(!requestSent ? err.message || 'Retry protection could not be prepared. Your request was not sent.' : uncertain ? 'The result is unclear. Check My orders, or retry with unchanged details to retrieve the same request. Changing the request may create another order.' : errorMessage(err, 'Your order request could not be received. Please review your cart and try again.'));
    } finally { orderPending.current = false; setSubmitting(false); }
  };

  if (placedOrder) return <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, px: 2 }}>
    <Box className="store-entrance" role="status" sx={{ ...panel, p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
      <Box sx={{ display: 'grid', placeItems: 'center', width: 76, height: 76, mx: 'auto', mb: 3, borderRadius: '50%', bgcolor: '#EDF3EC', color: 'success.main' }}><CheckCircleOutlined sx={{ fontSize: 36 }} /></Box>
      <Typography sx={{ color: '#9A7457', fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.15em', mb: 1 }}>Thank you for choosing Sekkin.lk</Typography>
      <Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2rem', sm: '2.5rem' }, mb: 2 }}>Order request received</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, mb: 3 }}>We’ve received your request #{placedOrder.orderId ?? placedOrder.id}. Staff must verify the details and confirm acceptance before dispatch. This acknowledgement is not acceptance or proof of payment. You can follow its progress in My orders.</Typography>
      {placedOrder.totalAmount != null && <Box sx={{ borderBlock: '1px solid #E6DBD3', py: 2, mb: 3 }}><Typography variant="body2" color="text.secondary">Delivery Charge: {formatDeliveryCharge(placedOrder.deliveryCharge)}</Typography>{placedOrder.couponCode && <Typography variant="body2" color="success.main">Promo: {placedOrder.couponCode}{placedOrder.couponPercentage != null ? ` (${placedOrder.couponPercentage}%)` : ''} · saved {money(placedOrder.couponDiscount)}</Typography>}<Typography variant="caption" color="text.secondary">Order total</Typography><Typography sx={{ color: 'primary.main', fontWeight: 600, fontSize: '1.5rem', mt: .5 }}>{money(placedOrder.totalAmount)}</Typography></Box>}
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
            <TextField id="checkout-phone" label="Delivery phone number" type="tel" fullWidth required autoComplete="tel" value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} disabled={submitting} slotProps={{ htmlInput: { maxLength: 40 } }} helperText="A reachable number for order confirmation and delivery." sx={{ mb: 2.5 }} />
            <TextField id="checkout-address" label="Full delivery address" fullWidth required multiline minRows={4} maxRows={8} autoComplete="street-address" value={address} onChange={event => setAddress(event.target.value)} disabled={submitting} placeholder="House number, street, city, province and postal code" helperText="Include your complete address so we can find you easily." />
          </CheckoutSection>
          <CheckoutSection id="checkout-coupon-heading" icon={<LocalOfferOutlined sx={{ fontSize: 21 }} />} title="02. Have a promo code?" description="Offers apply only to eligible products. Delivery charges stay unchanged.">
            <PromoCodeField promotion={promotion} disabled={submitting} />
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
            <Typography variant="body2" color="text.secondary">Delivery Charge</Typography><Typography variant="body2" sx={{ textAlign: 'right' }}>{formatDeliveryCharge(deliveryCharge)}</Typography>
            {discount > 0 && <><Typography variant="body2" sx={{ color: 'success.main', overflowWrap: 'anywhere' }}>Coupon ({code})</Typography><Typography id="checkout-discount" variant="body2" sx={{ color: 'success.main', textAlign: 'right', whiteSpace: 'nowrap' }}>− {money(discount)}</Typography></>}
          </Box>
          <DeliveryPricingNotice />
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, mb: 2 }}><Typography sx={{ fontSize: '.9rem', fontWeight: 500 }}>Estimated total</Typography><Typography id="checkout-total" aria-live="polite" sx={{ color: 'primary.main', fontSize: '1.4rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{money(estimatedTotal)}</Typography></Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.8, mb: 3 }}>Discounts and availability are confirmed when you place your order.</Typography>
          <PolicyLinks />
          {retryWarning && <Alert severity="warning" sx={{ mb: 2 }}>{retryWarning}</Alert>}
          {orderError && <Alert severity="error" sx={{ mb: 2 }}>{orderError}{uncertainOrder && <Button component={Link} to="/orders" color="inherit" size="small" sx={{ display: 'flex', mt: 1, px: 0 }}>Check my orders</Button>}</Alert>}
          {priceChanged && <Button type="button" variant="outlined" fullWidth onClick={retryCart} sx={{ mb: 2 }}>Refresh summary and review total</Button>}
          <Button type="submit" fullWidth variant="contained" disabled={submitting || priceChanged || !address.trim() || !customerPhone.trim()} aria-busy={submitting} endIcon={submitting ? <CircularProgress size={17} color="inherit" /> : <ArrowForward />} className="store-primary-action" sx={{ minHeight: 50 }}>{submitting ? 'Sending your request…' : 'Place order'}</Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, lineHeight: 1.8 }}>Checkout submits an order request. Staff confirm acceptance after checking your details and availability. COD is collected on delivery.</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2, lineHeight: 1.8 }}>{submitting ? 'Please keep this page open while we confirm your order.' : 'Your order confirmation will appear here.'}</Typography>
        </Box>
      </Box>}
  </Container>;
}
