import { useState, useMemo, useRef } from 'react';
import PolicyLinks from './PolicyLinks';
import business from '../content/business.json';
import axios from 'axios';
import {
  Dialog, DialogContent, DialogActions, Box, Typography,
  TextField, Button, Grid, Divider, Stack, Chip,
  IconButton, Alert, CircularProgress,
  useMediaQuery
} from '@mui/material';
import {
  Close, LocalShipping, CheckCircle, Print, ShoppingBag,
  LocalOffer, Add, Remove, Download, ArrowForward
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sekkin-lk-backend.onrender.com';

const resolveImageUrl = (imgUrl) => {
  if (!imgUrl || typeof imgUrl !== 'string') return '';
  if (imgUrl.startsWith('http://localhost:8080')) {
    return imgUrl.replace('http://localhost:8080', API_BASE_URL);
  }
  if (imgUrl.startsWith('http://127.0.0.1:8080')) {
    return imgUrl.replace('http://127.0.0.1:8080', API_BASE_URL);
  }
  if (imgUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imgUrl}`;
  }
  return imgUrl;
};

const VALID_COUPONS = {
  GLOW10: { desc: '10% OFF Storewide', rate: 0.10, flat: 0, min: 0 },
  WELCOME10: { desc: '10% Welcome Discount', rate: 0.10, flat: 0, min: 0 },
  SAVE500: { desc: 'Rs. 500 OFF (Min. Rs. 2,500)', rate: 0, flat: 500, min: 2500 }
};

const ROSE = '#8F344D';
const BORDER = '#E9DFDA';
const panelSx = { p: { xs: 2, sm: 3 }, border: `1px solid ${BORDER}`, borderRadius: 3, bgcolor: 'white' };

function readSavedCustomer() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null') || {};
  } catch {
    return {};
  }
}

function SummaryRow({ label, children, highlight = false }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, fontSize: '.82rem', color: highlight ? '#386749' : '#726661' }}>
      <Box component="span" sx={{ minWidth: 0 }}>{label}</Box>
      <Box component="span" sx={{ textAlign: 'right', flexShrink: 0, fontWeight: highlight ? 600 : 500, fontVariantNumeric: 'tabular-nums' }}>{children}</Box>
    </Box>
  );
}

// Mount the form only when a product exists, keeping hook order consistent.
export default function DirectCheckoutModal(props) {
  return props.product ? <CheckoutContent {...props} /> : null;
}

function CheckoutContent({ open, onClose, product, initialQty = 1 }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [savedCustomer] = useState(readSavedCustomer);

  // Quantity
  const [qty, setQty] = useState(initialQty);

  // Form Details
  const [name, setName] = useState(savedCustomer.name || '');
  const [phoneNumber, setPhoneNumber] = useState(savedCustomer.phone || '');
  const [email, setEmail] = useState(savedCustomer.email || '');
  const [address, setAddress] = useState(savedCustomer.address || '');
  const [postalCode, setPostalCode] = useState('');

  const paymentMethod = 'COD';
  const orderPending = useRef(false);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderReceipt, setOrderReceipt] = useState(null);

  const [receiptDate, setReceiptDate] = useState('');
  const [previousSession, setPreviousSession] = useState({ open, initialQty, product });

  // Sync a new checkout session before paint; preserve customer input and method.
  if (previousSession.open !== open || previousSession.initialQty !== initialQty || previousSession.product !== product) {
    setPreviousSession({ open, initialQty, product });
    if (previousSession.open !== open) {
      const customer = readSavedCustomer();
      if (!name && customer.name) setName(customer.name);
      if (!email && customer.email) setEmail(customer.email);
      if (!phoneNumber && customer.phone) setPhoneNumber(customer.phone);
      if (!address && customer.address) setAddress(customer.address);
    }
    if (open) {
      setQty(initialQty || 1);
      setErrorMessage('');
      setOrderReceipt(null);
    }
  }

  // Pricing calculations
  const unitPrice = Number(product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product.price) || 0;

  const subtotal = unitPrice * qty;

  // Retain the existing COD charge; the owner must approve delivery policy.
  const deliveryCharge = 0;

  // Coupon Discount
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || !VALID_COUPONS[appliedCoupon]) return 0;
    const rule = VALID_COUPONS[appliedCoupon];
    if (rule.min > 0 && subtotal < rule.min) return 0;
    if (rule.rate > 0) return subtotal * rule.rate;
    if (rule.flat > 0) return rule.flat;
    return 0;
  }, [appliedCoupon, subtotal]);

  const grandTotal = Math.max(0, (subtotal + deliveryCharge) - couponDiscount);

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setAppliedCoupon('');
      return;
    }
    if (!VALID_COUPONS[code]) {
      setCouponError('Invalid coupon code. Try GLOW10 or SAVE500');
      return;
    }
    const rule = VALID_COUPONS[code];
    if (rule.min > 0 && subtotal < rule.min) {
      setCouponError(`Minimum order amount of Rs. ${rule.min} required for this coupon.`);
      return;
    }
    setAppliedCoupon(code);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (orderPending.current) return;
    setErrorMessage('');

    // Form validations
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your phone number for delivery coordination.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address for your order.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please enter your complete delivery address.');
      return;
    }

    orderPending.current = true;
    setLoading(true);

    try {
      const payload = {
        productId: product.id,
        quantity: qty,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        postalCode: postalCode.trim() || null,
        email: email.trim(),
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon || null
      };

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await axios.post(`${API_BASE_URL}/api/orders/direct`, payload, { headers });
      setOrderReceipt(res.data);
      setReceiptDate((res.data.orderDate ? new Date(res.data.orderDate) : new Date()).toLocaleString());
      // Auto-download order confirmation directly to customer's device
      generateAndDownloadSlip(res.data);
    } catch (err) {
      console.error('Direct order failed:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to place order. Please verify your details.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Error placing order. Please try again.');
    } finally {
      orderPending.current = false;
      setLoading(false);
    }
  };

  const generateAndDownloadSlip = (rawReceipt) => {
    if (!rawReceipt) return;
    const escapeText = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const receipt = Object.fromEntries(Object.entries(rawReceipt).map(([key, value]) => [key, typeof value === 'string' ? escapeText(value) : value]));
    const dateStr = new Date(receipt.orderDate || Date.now()).toLocaleString();
    const paymentBadge = 'Cash on Delivery (PENDING_COD) — not proof of payment';

    const slipHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order_Confirmation_#${receipt.orderId}_Sekkin_lk</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #F7F3F0;
      margin: 0;
      padding: 30px 15px;
      color: #2D2421;
    }
    .slip-container {
      max-width: 650px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 35px rgba(0,0,0,0.08);
      border: 1px solid #EFE6E1;
    }
    .header {
      background: linear-gradient(135deg, #1A1A1A 0%, #2E1A29 60%, #B5385C 100%);
      color: #FFFFFF;
      padding: 26px;
      text-align: center;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 1px;
      margin: 0;
    }
    .brand-title span { color: #FFE082; }
    .brand-sub {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      opacity: 0.85;
      margin-top: 4px;
    }
    .content { padding: 28px; }
    .status-badge {
      display: inline-block;
      background: #E8F5E9;
      color: #2E7D32;
      padding: 5px 12px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 12px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 22px 0;
    }
    .info-box {
      background: #FAF8F6;
      border: 1px solid #EFE6E1;
      border-radius: 10px;
      padding: 14px;
      font-size: 13px;
    }
    .info-title {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      color: #8C7568;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 13px;
    }
    th {
      background: #FAF3F0;
      color: #8C7568;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 800;
      padding: 10px 12px;
      text-align: left;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #F0E8E4;
    }
    .summary-box {
      margin-left: auto;
      max-width: 280px;
      margin-top: 18px;
      font-size: 13px;
      line-height: 1.8;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      color: #666;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 17px;
      font-weight: 900;
      color: #B5385C;
      border-top: 2px solid #EFE6E1;
      padding-top: 8px;
      margin-top: 8px;
    }
    .footer {
      border-top: 1px dashed #E0D3CC;
      padding-top: 18px;
      margin-top: 26px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    .print-btn {
      display: block;
      margin: 20px auto 0 auto;
      padding: 10px 24px;
      background: #B5385C;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }
    @media print {
      body { background: white; padding: 0; }
      .slip-container { box-shadow: none; border: none; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="slip-container">
    <div class="header">
      <h1 class="brand-title">Sekkin<span>.lk</span></h1>
      <div class="brand-sub">Luxury Cosmetics Boutique • Order Confirmation · Not proof of payment</div>
    </div>
    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #EFE6E1; padding-bottom: 14px;">
        <div>
          <div style="font-size: 11px; color: #8C7568; text-transform: uppercase; font-weight: 800;">Official Slip</div>
          <div style="font-size: 22px; font-weight: 900; color: #1A1A1A;">Order #${receipt.orderId}</div>
          <div style="font-size: 12px; color: #777; margin-top: 2px;">${dateStr}</div>
        </div>
        <div>
          <span class="status-badge">${receipt.paymentStatus || 'PENDING_COD'}</span>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <div class="info-title">Customer & Delivery Info</div>
          <div style="font-weight: 700; color: #1A1A1A; font-size: 14px;">${receipt.customerName || 'Valued Customer'}</div>
          <div style="color: #555; margin-top: 4px;">📞 Phone: ${receipt.customerPhone || 'N/A'}</div>
          <div style="color: #555; margin-top: 2px;">✉️ Email: ${receipt.customerEmail || 'N/A'}</div>
          <div style="color: #555; margin-top: 2px;">📍 ${receipt.shippingAddress || 'N/A'} ${receipt.postalCode ? '(' + receipt.postalCode + ')' : ''}</div>
        </div>

        <div class="info-box">
          <div class="info-title">Payment Method & Status</div>
          <div style="font-weight: 700; color: #1A1A1A; font-size: 14px;">${paymentBadge}</div>
          <div style="color: #555; margin-top: 4px;">Delivery Charge: <b>${receipt.deliveryCharge > 0 ? 'Rs. ' + receipt.deliveryCharge.toFixed(2) : 'FREE'}</b></div>
          <div style="color: #555; margin-top: 2px;">Order Status: <b>${receipt.status || 'PROCESSING'}</b></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: 600;">${receipt.productName || 'Cosmetics Item'}</td>
            <td style="text-align: center;">${receipt.quantity || 1}</td>
            <td style="text-align: right;">Rs. ${(receipt.unitPrice || 0).toFixed(2)}</td>
            <td style="text-align: right; font-weight: 700;">Rs. ${((receipt.unitPrice || 0) * (receipt.quantity || 1)).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-box">
        <div class="summary-row"><span>Subtotal:</span><span>Rs. ${(receipt.subtotal || 0).toFixed(2)}</span></div>
        <div class="summary-row"><span>Delivery Charge:</span><span>${receipt.deliveryCharge > 0 ? 'Rs. ' + receipt.deliveryCharge.toFixed(2) : 'FREE'}</span></div>
        ${receipt.discountAmount > 0 ? '<div class="summary-row" style="color: #2E7D32; font-weight: 600;"><span>Discount Saved:</span><span>- Rs. ' + receipt.discountAmount.toFixed(2) + '</span></div>' : ''}
        <div class="total-row"><span>Grand Total:</span><span>Rs. ${(receipt.totalAmount || 0).toFixed(2)}</span></div>
      </div>

      <div class="footer">
        <p style="margin: 0; font-weight: 600;">Thank you for your purchase with Sekkin.lk! ✨</p>
        <p style="margin: 4px 0 0 0;">${business.contactsConfirmed ? escapeText(business.supportPhone || business.supportEmail || business.businessName) : 'Support details await business confirmation.'}</p>
        <button class="print-btn no-print" onclick="window.print()">🖨️ Print Slip / Save as PDF</button>
      </div>
    </div>
  </div>
</body>
</html>`;

    try {
      const blob = new Blob([slipHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sekkin_Order_Confirmation_#${receipt.orderId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.warn('Auto download error:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="direct-checkout-title"
      aria-describedby="direct-checkout-description"
      transitionDuration={reduceMotion ? 0 : 220}
      slotProps={{
        paper: {
          sx: {
            m: { xs: 1, sm: 3 },
            width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 48px)' },
            maxHeight: { xs: 'calc(100dvh - 16px)', sm: 'calc(100dvh - 48px)' },
            borderRadius: { xs: 3, sm: 4 },
            overflow: 'hidden',
            bgcolor: '#FCF8F5',
            boxShadow: '0 28px 90px rgba(48, 31, 35, .2)',
            border: `1px solid ${BORDER}`,
            '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2.5, fontSize: '.875rem' },
            '& .MuiInputLabel-root': { fontSize: '.875rem' },
            '& .MuiButton-root': { textTransform: 'none', fontWeight: 600 },
            '& .MuiIconButton-root:focus-visible, & .MuiButton-root:focus-visible': { outline: `3px solid ${ROSE}`, outlineOffset: 3 },
          },
        },
      }}
    >
      <Box sx={{ p: { xs: 2.25, sm: 3 }, pr: { xs: 7, sm: 8 }, bgcolor: 'white', borderBottom: `1px solid ${BORDER}`, flexShrink: 0, position: 'relative' }}>
        <Typography sx={{ color: ROSE, fontSize: '.65rem', letterSpacing: '.18em', fontWeight: 600, textTransform: 'uppercase', mb: .75 }}>SEKKIN.LK / {orderReceipt ? 'Your order' : 'Checkout'}</Typography>
        <Typography id="direct-checkout-title" component="h2" sx={{ fontFamily: 'Georgia, serif', color: '#322A2B', fontWeight: 400, fontSize: { xs: '1.65rem', sm: '2rem' }, lineHeight: 1.15 }}>
          {orderReceipt ? 'Thank you for your order.' : 'A little closer to your glow.'}
        </Typography>
        <Typography id="direct-checkout-description" sx={{ color: '#726661', fontSize: '.78rem', mt: 1, lineHeight: 1.7 }}>
          {orderReceipt ? 'Your order details and receipt are ready below.' : 'Your delivery details and cash-on-delivery order — all in one place.'}
        </Typography>
        <IconButton aria-label="Close checkout" onClick={onClose} disabled={loading} sx={{ position: 'absolute', top: { xs: 14, sm: 22 }, right: { xs: 12, sm: 20 }, color: '#726661', bgcolor: '#FCF8F5', width: 40, height: 40 }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {orderReceipt ? (
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, minHeight: 0 }}>
          <Box id="printable-receipt" sx={panelSx}>
            <Stack spacing={1} sx={{ textAlign: 'center', mb: 3, alignItems: 'center' }} role="status">
              <CheckCircle sx={{ fontSize: 44, color: '#386749' }} />
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>Order confirmed</Typography>
              <Typography variant="body2" color="text.secondary">Order #{orderReceipt.orderId}</Typography>
              <Typography variant="caption" color="text.secondary">{receiptDate}</Typography>
            </Stack>

            <Alert severity="success" icon={<Download fontSize="inherit" />} sx={{ borderRadius: 2, mb: 3, fontSize: '.8rem' }}>
              Your receipt download has started. You can download another copy below.
            </Alert>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: '#FCF8F5', borderRadius: 2, height: '100%', overflowWrap: 'anywhere' }}>
                  <Typography sx={{ fontSize: '.7rem', color: ROSE, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', mb: 1 }}>Delivery details</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{orderReceipt.customerName}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: .75 }}>{orderReceipt.customerPhone}</Typography>
                  <Typography variant="body2" color="text.secondary">{orderReceipt.shippingAddress} {orderReceipt.postalCode ? `(${orderReceipt.postalCode})` : ''}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ p: 2, bgcolor: '#FCF8F5', borderRadius: 2, height: '100%' }}>
                  <Typography sx={{ fontSize: '.7rem', color: ROSE, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', mb: 1 }}>Payment details</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Cash on delivery — payment pending</Typography>
                  <Chip size="small" label={orderReceipt.paymentStatus || 'PENDING_COD'} sx={{ fontSize: '.65rem', mt: 1, mb: 1, bgcolor: '#EDF3EC', color: '#386749', fontWeight: 600, maxWidth: '100%' }} />
                  <Typography variant="body2" color="text.secondary">Order status: {orderReceipt.status}</Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ py: 2, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, mb: 2.5 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>{orderReceipt.productName || product.name}</Typography>
              <SummaryRow label={`Quantity: ${orderReceipt.quantity} · Rs. ${orderReceipt.unitPrice?.toFixed(2)} each`}>
                Rs. {(orderReceipt.unitPrice * orderReceipt.quantity).toFixed(2)}
              </SummaryRow>
            </Box>
            <Stack spacing={1.25}>
              <SummaryRow label="Subtotal">Rs. {orderReceipt.subtotal?.toFixed(2)}</SummaryRow>
              <SummaryRow label="Delivery">{orderReceipt.deliveryCharge > 0 ? `Rs. ${orderReceipt.deliveryCharge.toFixed(2)}` : 'Free'}</SummaryRow>
              {orderReceipt.discountAmount > 0 && <SummaryRow label="Discount" highlight>− Rs. {orderReceipt.discountAmount.toFixed(2)}</SummaryRow>}
              <Divider />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 1, fontWeight: 600, color: ROSE }}>
                <span>Total</span><span>Rs. {orderReceipt.totalAmount?.toFixed(2)}</span>
              </Box>
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<Download />} onClick={() => generateAndDownloadSlip(orderReceipt)} sx={{ borderColor: BORDER, color: ROSE, minHeight: 44 }}>Download receipt</Button>
            <Button variant="outlined" startIcon={<Print />} onClick={handlePrint} sx={{ borderColor: BORDER, color: ROSE, minHeight: 44 }}>Print</Button>
            <Button variant="contained" onClick={onClose} sx={{ bgcolor: ROSE, boxShadow: 'none', minHeight: 44, '&:hover': { bgcolor: '#74263D', boxShadow: 'none' } }}>Continue shopping</Button>
          </Stack>
        </DialogContent>
      ) : (
        <Box component="form" onSubmit={handleSubmitOrder} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <DialogContent sx={{ p: { xs: 2, sm: 3 }, minHeight: 0 }}>
            {errorMessage && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMessage('')}>{errorMessage}</Alert>}

            <Box sx={{ ...panelSx, mb: 2.5, display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ width: { xs: 64, sm: 80 }, height: { xs: 76, sm: 90 }, flexShrink: 0, bgcolor: '#FCF8F5', borderRadius: 2, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                {product.imageUrl ? <Box component="img" src={resolveImageUrl(product.imageUrl)} alt={product.name} decoding="async" sx={{ width: '100%', height: '100%', objectFit: 'contain', p: .75 }} /> : <ShoppingBag sx={{ color: '#B8A49D', fontSize: 28 }} />}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '.65rem', color: ROSE, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', overflowWrap: 'anywhere' }}>{product.brand || 'SEKKIN.LK'}{(typeof product.category === 'string' ? product.category : product.category?.name) ? ` / ${typeof product.category === 'string' ? product.category : product.category.name}` : ''}</Typography>
                <Typography sx={{ mt: .5, fontSize: { xs: '.85rem', sm: '.95rem' }, fontWeight: 600, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{product.name}</Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ mt: .5, flexWrap: 'wrap', alignItems: 'baseline' }}>
                  <Typography sx={{ fontSize: '.9rem', color: ROSE, fontWeight: 600 }}>Rs. {unitPrice.toLocaleString()}</Typography>
                  {product.discountPrice && product.discountPrice < product.price ? <Typography component="span" sx={{ color: '#857570', fontSize: '.75rem', textDecoration: 'line-through' }}>Rs. {product.price?.toLocaleString()}</Typography> : null}
                </Stack>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.35fr) minmax(0, 1fr)' }, gap: 2.5, alignItems: 'start' }}>
              <Stack spacing={2.5} sx={{ minWidth: 0 }}>
                <Box component="section" aria-labelledby="checkout-delivery-heading" sx={panelSx}>
                  <Typography id="checkout-delivery-heading" component="h3" sx={{ fontSize: '1rem', fontWeight: 600, mb: .5 }}>01. Delivery details</Typography>
                  <Typography sx={{ fontSize: '.76rem', color: '#726661', mb: 3 }}>Let us know where your order should arrive.</Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 12 }}>
                      <TextField fullWidth size="small" label="Full name" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 12 }}>
                      <TextField fullWidth size="small" label="Phone number" type="tel" autoComplete="tel" required value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} helperText="For delivery updates" />
                    </Grid>
                    <Grid size={12}>
                      <TextField fullWidth size="small" label="Email address" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} helperText="Your order and receipt details" />
                    </Grid>
                    <Grid size={12}>
                      <TextField fullWidth size="small" label="Delivery address" autoComplete="street-address" required multiline rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="House number, street, city, province" />
                    </Grid>
                    <Grid size={12}>
                      <TextField fullWidth size="small" label="Postal code (optional)" autoComplete="postal-code" value={postalCode} onChange={e => setPostalCode(e.target.value)} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
                    </Grid>
                  </Grid>
                </Box>

                <Box component="section" aria-labelledby="checkout-payment-heading" sx={panelSx}>
                  <Typography id="checkout-payment-heading" component="h3" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>02. Payment method</Typography>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}><LocalShipping sx={{ color: ROSE }} /><Box><Typography sx={{ fontWeight: 500, fontSize: '.85rem' }}>Cash on delivery</Typography><Typography sx={{ fontSize: '.75rem', color: '#726661', mt: .5 }}>Payment is due on delivery. No online payment is taken.</Typography></Box></Stack>
                  <Alert severity="info" sx={{ fontSize: '.75rem', borderRadius: 2 }}>Card and KOKO payments are unavailable until a verified payment provider is connected. Do not enter or send card details.</Alert>
                  <PolicyLinks />
                </Box>
              </Stack>

              <Box component="section" aria-labelledby="checkout-summary-heading" sx={{ ...panelSx, position: { md: 'sticky' }, top: 0 }}>
                <Typography id="checkout-summary-heading" component="h3" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2.5 }}>Your order</Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: '.8rem', color: '#726661' }}>Quantity</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${BORDER}`, borderRadius: 2, overflow: 'hidden' }}>
                    <IconButton aria-label="Decrease quantity" size="small" onClick={() => setQty(q => Math.max(1, q - 1))} sx={{ width: 36, height: 36, borderRadius: 0 }}><Remove sx={{ fontSize: 16 }} /></IconButton>
                    <Typography aria-live="polite" sx={{ px: 1, minWidth: 28, textAlign: 'center', fontSize: '.85rem', fontWeight: 600 }}>{qty}</Typography>
                    <IconButton aria-label="Increase quantity" size="small" onClick={() => setQty(q => Math.min(product.stockQuantity || 99, q + 1))} sx={{ width: 36, height: 36, borderRadius: 0 }}><Add sx={{ fontSize: 16 }} /></IconButton>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 2.5 }} />
                <Stack spacing={1.5}>
                  <SummaryRow label={`Subtotal (${qty} ${qty > 1 ? 'items' : 'item'})`}>Rs. {subtotal.toFixed(2)}</SummaryRow>
                  <SummaryRow label="Delivery">{deliveryCharge > 0 ? `Rs. ${deliveryCharge.toFixed(2)}` : 'Free'}</SummaryRow>
                  {couponDiscount > 0 && <SummaryRow label="Coupon savings" highlight>− Rs. {couponDiscount.toFixed(2)}</SummaryRow>}
                </Stack>

                <Box sx={{ my: 2.5, pt: 2.5, borderTop: `1px solid ${BORDER}` }}>
                  <Typography sx={{ fontSize: '.75rem', color: '#726661', mb: 1.5, display: 'flex', alignItems: 'center', gap: .75 }}><LocalOffer sx={{ fontSize: 15 }} /> Have a discount code?</Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <TextField size="small" fullWidth label="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} error={Boolean(couponError)} sx={{ minWidth: 0 }} />
                    <Button variant="outlined" onClick={handleApplyCoupon} sx={{ color: ROSE, borderColor: BORDER, minHeight: 40, px: 1.5 }}>Apply</Button>
                  </Stack>
                  {couponError && <Typography role="alert" variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>{couponError}</Typography>}
                  {appliedCoupon && <Alert severity="success" sx={{ mt: 1.5, py: .25, borderRadius: 2, fontSize: '.72rem' }} onClose={() => setAppliedCoupon('')}><strong>{appliedCoupon}</strong> applied. You saved Rs. {couponDiscount.toFixed(2)}.</Alert>}
                </Box>
                <Box sx={{ p: 2, bgcolor: '#FCF8F5', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: .5 }}>
                  <Typography sx={{ fontSize: '.75rem', color: '#726661' }}>Total due</Typography>
                  <Typography sx={{ fontSize: { xs: '1.45rem', sm: '1.6rem' }, fontWeight: 600, color: ROSE, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>Rs. {grandTotal.toFixed(2)}</Typography>
                </Box>
                <Typography sx={{ mt: 2, color: '#8C7C76', fontSize: '.68rem', lineHeight: 1.7 }}>Your receipt will download after your order is confirmed.</Typography>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'white', borderTop: `1px solid ${BORDER}`, flexShrink: 0, display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, alignItems: 'stretch', justifyContent: 'space-between', gap: 1, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
            <Button onClick={onClose} disabled={loading} sx={{ color: '#726661', minHeight: { xs: 36, sm: 46 }, fontSize: '.8rem' }}>Continue shopping</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              aria-busy={loading}
              startIcon={loading ? <CircularProgress size={17} color="inherit" /> : undefined}
              endIcon={!loading ? <ArrowForward sx={{ fontSize: 18 }} /> : undefined}
              sx={{ bgcolor: ROSE, color: 'white', fontSize: '.82rem', px: { xs: 2, sm: 3 }, minHeight: 46, borderRadius: 2.5, boxShadow: 'none', '&:hover': { bgcolor: '#74263D', boxShadow: 'none' } }}
            >
              {loading ? 'Placing your order…' : `Place COD order · Rs. ${grandTotal.toFixed(2)}`}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
}
