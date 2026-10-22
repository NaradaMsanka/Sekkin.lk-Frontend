import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  TextField, Button, Grid, Card, CardContent, Divider, Stack, Chip,
  IconButton, Alert, CircularProgress, InputAdornment, Tooltip
} from '@mui/material';
import {
  Close, CreditCard, LocalShipping, CheckCircle, Receipt,
  Print, ShoppingBag, Person, Phone, Email, LocationOn,
  LocalOffer, ElectricBolt, Security, Lock, Add, Remove,
  Payment, Verified, Download
} from '@mui/icons-material';

const VALID_COUPONS = {
  GLOW10: { desc: '10% OFF Storewide', rate: 0.10, flat: 0, min: 0 },
  WELCOME10: { desc: '10% Welcome Discount', rate: 0.10, flat: 0, min: 0 },
  SAVE500: { desc: 'Rs. 500 OFF (Min. Rs. 2,500)', rate: 0, flat: 500, min: 2500 }
};

export default function DirectCheckoutModal({ open, onClose, product, initialQty = 1 }) {
  if (!product) return null;

  // Quantity
  const [qty, setQty] = useState(initialQty);

  // Form Details
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Payment Method: 'CARD', 'KOKO', 'COD'
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  // Simulated Card Details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Auto-fill from logged in user if available
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name && !name) setName(u.name);
        if (u.email && !email) setEmail(u.email);
        if (u.phone && !phoneNumber) setPhoneNumber(u.phone);
        if (u.address && !address) setAddress(u.address);
      }
    } catch (e) {
      // ignore
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setQty(initialQty || 1);
      setErrorMessage('');
      setOrderReceipt(null);
    }
  }, [open, initialQty, product]);

  // Pricing calculations
  const unitPrice = Number(product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product.price) || 0;

  const subtotal = unitPrice * qty;

  // Delivery charge rule: CARD = 350, KOKO = 350, COD = 0
  const deliveryCharge = (paymentMethod === 'CARD' || paymentMethod === 'KOKO') ? 350.0 : 0.0;

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
  const kokoInstallment = (grandTotal / 3).toFixed(2);

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

  const handleFormatCardNumber = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleFormatExpiry = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
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
      setErrorMessage('Please enter a valid email address so we can send your payment receipt.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please enter your complete delivery address.');
      return;
    }

    if (paymentMethod === 'CARD') {
      if (cardNumber.replace(/\s/g, '').length < 15) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setErrorMessage('Please enter card expiry date (MM/YY).');
        return;
      }
      if (!cardCvc || cardCvc.length < 3) {
        setErrorMessage('Please enter 3-digit CVV/CVC code.');
        return;
      }
    }

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
        couponCode: appliedCoupon || null,
        cardNumber: paymentMethod === 'CARD' ? cardNumber.replace(/\s/g, '') : null,
        cardExpiry: paymentMethod === 'CARD' ? cardExpiry : null,
        cardCvc: paymentMethod === 'CARD' ? cardCvc : null
      };

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await axios.post('http://localhost:8080/api/orders/direct', payload, { headers });
      setOrderReceipt(res.data);
      // Auto-download official payment receipt slip directly to customer's device
      generateAndDownloadSlip(res.data);
    } catch (err) {
      console.error('Direct order failed:', err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to place order. Please verify your details.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAndDownloadSlip = (receipt) => {
    if (!receipt) return;
    const dateStr = new Date(receipt.orderDate || Date.now()).toLocaleString();
    const paymentBadge = receipt.paymentMethod === 'CARD'
      ? 'Credit / Debit Card (PAID)'
      : receipt.paymentMethod === 'KOKO'
      ? 'KOKO Buy Now Pay Later (APPROVED)'
      : 'Cash on Delivery (PENDING_COD)';

    const kokoBreakdownHtml = receipt.paymentMethod === 'KOKO' ? `
      <div style="margin-top: 14px; padding: 12px; background: #FAF5FF; border: 1px solid #DDD6FE; border-radius: 8px;">
        <div style="font-weight: 800; color: #6B21A8; font-size: 13px; margin-bottom: 6px;">🟣 KOKO Installment Schedule:</div>
        <div style="font-size: 12px; color: #444; line-height: 1.6;">
          • 1st Installment (Paid Today): <b>Rs. ${(receipt.totalAmount / 3).toFixed(2)}</b><br/>
          • 2nd Installment (In 30 Days): <b>Rs. ${(receipt.totalAmount / 3).toFixed(2)}</b><br/>
          • 3rd Installment (In 60 Days): <b>Rs. ${(receipt.totalAmount / 3).toFixed(2)}</b>
        </div>
      </div>
    ` : '';

    const slipHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment_Slip_Order_#${receipt.orderId}_Sekkin_lk</title>
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
      <div class="brand-sub">Luxury Cosmetics Boutique • Official Payment Slip</div>
    </div>
    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #EFE6E1; padding-bottom: 14px;">
        <div>
          <div style="font-size: 11px; color: #8C7568; text-transform: uppercase; font-weight: 800;">Official Slip</div>
          <div style="font-size: 22px; font-weight: 900; color: #1A1A1A;">Order #${receipt.orderId}</div>
          <div style="font-size: 12px; color: #777; margin-top: 2px;">${dateStr}</div>
        </div>
        <div>
          <span class="status-badge">✔ ${receipt.paymentStatus || 'CONFIRMED'}</span>
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
          ${kokoBreakdownHtml}
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
        <p style="margin: 4px 0 0 0;">WhatsApp Support: +94 77 123 4567 • Colombo, Sri Lanka</p>
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
      a.download = `Sekkin_Payment_Slip_Order_#${receipt.orderId}.html`;
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
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
          bgcolor: '#FFFFFF'
        }
      }}
    >
      {/* Header Banner */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1A1A1A 0%, #2E1A29 60%, #B5385C 100%)',
        color: '#FFFFFF',
        p: { xs: 2.5, sm: 3 },
        position: 'relative'
      }}>
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            color: 'rgba(255,255,255,0.7)',
            '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <Close />
        </IconButton>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            p: 1,
            borderRadius: 2.5,
            display: 'flex',
            backdropFilter: 'blur(10px)'
          }}>
            <ElectricBolt sx={{ color: '#FFE082', fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '0.5px', lineHeight: 1.2 }}>
              Instant Pay & Direct Checkout
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem' }}>
              ⚡ Bypass cart • Select Card, KOKO, or COD • Official payment slip auto-downloaded
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Confirmation / Receipt View if order is placed */}
      {orderReceipt ? (
        <DialogContent sx={{ p: { xs: 2.5, sm: 4 }, bgcolor: '#FAF7F5' }}>
          <Box id="printable-receipt" sx={{ bgcolor: 'white', borderRadius: 3, p: { xs: 2.5, sm: 3.5 }, border: '1px solid #EFE6E1', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            {/* Top Success Badge */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle sx={{ fontSize: 60, color: '#2E7D32', mb: 1 }} />
              <Typography variant="h5" fontWeight={800} color="#1A1A1A">
                Payment & Order Confirmed! 🎉
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Order #{orderReceipt.orderId} • {new Date(orderReceipt.orderDate || Date.now()).toLocaleString()}
              </Typography>
            </Box>

            {/* Auto download confirmation banner */}
            <Alert
              severity="success"
              icon={<Download fontSize="inherit" />}
              sx={{ mb: 3, borderRadius: 2, alignItems: 'center' }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<Download />}
                  onClick={() => generateAndDownloadSlip(orderReceipt)}
                  sx={{ fontWeight: 700 }}
                >
                  Download Again
                </Button>
              }
            >
              🎉 Official payment slip has been <strong>automatically downloaded</strong> to your device!
            </Alert>

            {/* Details Breakdown */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#FAF8F5', borderRadius: 2.5, border: '1px solid #F0E8E4' }}>
                  <Typography variant="caption" sx={{ color: '#8C7568', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                    Delivery Recipient
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="#222">
                    {orderReceipt.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    📞 {orderReceipt.customerPhone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📍 {orderReceipt.shippingAddress} {orderReceipt.postalCode ? `(${orderReceipt.postalCode})` : ''}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#FAF8F5', borderRadius: 2.5, border: '1px solid #F0E8E4' }}>
                  <Typography variant="caption" sx={{ color: '#8C7568', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                    Payment Summary
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {orderReceipt.paymentMethod === 'CARD' ? '💳 Card (Simulated)' : orderReceipt.paymentMethod === 'KOKO' ? '🟣 KOKO (3 Installments)' : '💵 Cash on Delivery'}
                    </Typography>
                    <Chip
                      size="small"
                      label={orderReceipt.paymentStatus || 'CONFIRMED'}
                      color={orderReceipt.paymentStatus === 'PAID' ? 'success' : orderReceipt.paymentStatus === 'KOKO_APPROVED' ? 'secondary' : 'warning'}
                      sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Delivery Charge: <strong>{orderReceipt.deliveryCharge > 0 ? `Rs. ${orderReceipt.deliveryCharge.toFixed(2)}` : 'FREE'}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: <strong style={{ color: '#2E7D32' }}>{orderReceipt.status}</strong>
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Item Table */}
            <Box sx={{ border: '1px solid #EFE6E1', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
              <Box sx={{ display: 'flex', bgcolor: '#FAF3F0', p: 1.5, fontWeight: 700, fontSize: '0.82rem', color: '#8C7568' }}>
                <Box sx={{ flexGrow: 1 }}>Product</Box>
                <Box sx={{ width: 60, textAlign: 'center' }}>Qty</Box>
                <Box sx={{ width: 100, textAlign: 'right' }}>Price</Box>
                <Box sx={{ width: 100, textAlign: 'right' }}>Total</Box>
              </Box>
              <Box sx={{ display: 'flex', p: 1.5, fontSize: '0.88rem', alignItems: 'center' }}>
                <Box sx={{ flexGrow: 1, fontWeight: 600 }}>{orderReceipt.productName || product.name}</Box>
                <Box sx={{ width: 60, textAlign: 'center' }}>{orderReceipt.quantity}</Box>
                <Box sx={{ width: 100, textAlign: 'right', color: 'text.secondary' }}>Rs. {orderReceipt.unitPrice?.toFixed(2)}</Box>
                <Box sx={{ width: 100, textAlign: 'right', fontWeight: 700 }}>Rs. {(orderReceipt.unitPrice * orderReceipt.quantity).toFixed(2)}</Box>
              </Box>
            </Box>

            {/* Total breakdown block */}
            <Box sx={{ ml: 'auto', maxWidth: 300, fontSize: '0.9rem', lineHeight: 1.8 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                <span>Subtotal:</span>
                <span>Rs. {orderReceipt.subtotal?.toFixed(2)}</span>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                <span>Delivery Charge:</span>
                <span>{orderReceipt.deliveryCharge > 0 ? `Rs. ${orderReceipt.deliveryCharge.toFixed(2)}` : 'FREE'}</span>
              </Box>
              {orderReceipt.discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32', fontWeight: 600 }}>
                  <span>Discount Saved:</span>
                  <span>- Rs. {orderReceipt.discountAmount.toFixed(2)}</span>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#B5385C' }}>
                <span>Grand Total:</span>
                <span>Rs. {orderReceipt.totalAmount?.toFixed(2)}</span>
              </Box>
            </Box>

            {/* KOKO installment schedule note if paid via KOKO */}
            {orderReceipt.paymentMethod === 'KOKO' && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color="#6B21A8" gutterBottom>
                  🟣 KOKO Installment Breakdown:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1.5, border: '1px solid #DDD6FE' }}>
                      <Typography variant="caption" color="text.secondary" display="block">1st (Today)</Typography>
                      <Typography variant="body2" fontWeight={700} color="#6B21A8">Rs. {(orderReceipt.totalAmount / 3).toFixed(2)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1.5, border: '1px solid #DDD6FE' }}>
                      <Typography variant="caption" color="text.secondary" display="block">2nd (30 Days)</Typography>
                      <Typography variant="body2" fontWeight={700} color="#6B21A8">Rs. {(orderReceipt.totalAmount / 3).toFixed(2)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'white', borderRadius: 1.5, border: '1px solid #DDD6FE' }}>
                      <Typography variant="caption" color="text.secondary" display="block">3rd (60 Days)</Typography>
                      <Typography variant="body2" fontWeight={700} color="#6B21A8">Rs. {(orderReceipt.totalAmount / 3).toFixed(2)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => generateAndDownloadSlip(orderReceipt)}
              sx={{ borderRadius: 2.5, px: 3, color: '#B5385C', borderColor: '#B5385C', fontWeight: 700 }}
            >
              📥 Download Slip Again
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={handlePrint}
              sx={{ borderRadius: 2.5, px: 3, color: '#4A3B32', borderColor: '#C9956A' }}
            >
              🖨️ Print Slip
            </Button>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                borderRadius: 2.5,
                px: 4,
                bgcolor: '#B5385C',
                '&:hover': { bgcolor: '#9B00A1' }
              }}
            >
              Done / Continue Shopping
            </Button>
          </Stack>
        </DialogContent>
      ) : (
        /* Order Input Form */
        <Box component="form" onSubmit={handleSubmitOrder}>
          <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, maxHeight: '72vh', overflowY: 'auto' }}>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            )}

            {/* Product Summary Row */}
            <Card elevation={0} sx={{ border: '1px solid #EFE6E1', bgcolor: '#FAF7F5', borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3} sm={2}>
                    <Box sx={{
                      width: '100%',
                      height: 75,
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: 'white',
                      border: '1px solid rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {product.imageUrl ? (
                        <Box component="img" src={product.imageUrl} alt={product.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ShoppingBag sx={{ color: '#C9956A', opacity: 0.5, fontSize: 32 }} />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={9} sm={6}>
                    <Typography variant="caption" sx={{ color: '#9B00A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {product.brand || 'Sekkin'} • {product.category || 'Cosmetics'}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1A1A1A', lineHeight: 1.3, mt: 0.2 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={800} sx={{ color: '#B5385C', mt: 0.5 }}>
                      Rs. {unitPrice.toLocaleString()} {product.discountPrice && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.8rem', fontWeight: 400, marginLeft: 6 }}>Rs. {product.price?.toLocaleString()}</span>}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>Qty:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #D5C7BD', borderRadius: 2, bgcolor: 'white', overflow: 'hidden' }}>
                        <IconButton size="small" onClick={() => setQty(q => Math.max(1, q - 1))} sx={{ px: 1, py: 0.5, borderRadius: 0 }}>
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography sx={{ px: 1.5, fontWeight: 700, minWidth: 28, textAlign: 'center', fontSize: '0.88rem' }}>
                          {qty}
                        </Typography>
                        <IconButton size="small" onClick={() => setQty(q => Math.min(product.stockQuantity || 99, q + 1))} sx={{ px: 1, py: 0.5, borderRadius: 0 }}>
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* SECTION 1: Delivery Details */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#8C7568', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ fontSize: 18 }} /> 1. Customer & Delivery Address
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Full Name"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Kasun Perera"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Person fontSize="small" sx={{ color: '#8C7568' }} /></InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  required
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 077 123 4567"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Phone fontSize="small" sx={{ color: '#8C7568' }} /></InputAdornment>
                  }}
                  helperText="Required for delivery rider dispatch"
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email fontSize="small" sx={{ color: '#8C7568' }} /></InputAdornment>
                  }}
                  helperText="For order tracking and slip record"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Postal Code"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="e.g. 00300"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Shipping Address"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="House / Apt No, Street Address, City, Province"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocationOn fontSize="small" sx={{ color: '#8C7568', mt: 0.5 }} /></InputAdornment>
                  }}
                />
              </Grid>
            </Grid>

            {/* SECTION 2: Select Payment Method */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#8C7568', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment sx={{ fontSize: 18 }} /> 2. Select Payment Method
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {/* Option 1: Card */}
              <Grid item xs={12} sm={4}>
                <Box
                  onClick={() => setPaymentMethod('CARD')}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: paymentMethod === 'CARD' ? '#B5385C' : '#E8DDD6',
                    bgcolor: paymentMethod === 'CARD' ? '#FFF5F8' : 'white',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    height: '100%',
                    boxShadow: paymentMethod === 'CARD' ? '0 4px 14px rgba(181,56,92,0.18)' : 'none',
                    '&:hover': { borderColor: '#B5385C' }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <CreditCard sx={{ color: paymentMethod === 'CARD' ? '#B5385C' : '#8C7568' }} />
                    <Chip
                      size="small"
                      label="+ Rs. 350 Delivery"
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: paymentMethod === 'CARD' ? '#FFE4EC' : '#F0EBE8',
                        color: paymentMethod === 'CARD' ? '#B5385C' : '#666'
                      }}
                    />
                  </Stack>
                  <Typography variant="subtitle2" fontWeight={800} color="#1A1A1A">
                    Credit / Debit Card
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Visa, Mastercard, Amex. Simulated instant gateway.
                  </Typography>
                </Box>
              </Grid>

              {/* Option 2: KOKO */}
              <Grid item xs={12} sm={4}>
                <Box
                  onClick={() => setPaymentMethod('KOKO')}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: paymentMethod === 'KOKO' ? '#6800E8' : '#E8DDD6',
                    bgcolor: paymentMethod === 'KOKO' ? '#FAF5FF' : 'white',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    height: '100%',
                    boxShadow: paymentMethod === 'KOKO' ? '0 4px 14px rgba(104,0,232,0.18)' : 'none',
                    '&:hover': { borderColor: '#6800E8' }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box sx={{
                      bgcolor: '#6800E8', color: 'white', px: 1, py: 0.2, borderRadius: 1.5,
                      fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.5px'
                    }}>
                      KOKO
                    </Box>
                    <Chip
                      size="small"
                      label="+ Rs. 350 Delivery"
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: paymentMethod === 'KOKO' ? '#EDE9FE' : '#F0EBE8',
                        color: paymentMethod === 'KOKO' ? '#6800E8' : '#666'
                      }}
                    />
                  </Stack>
                  <Typography variant="subtitle2" fontWeight={800} color="#1A1A1A">
                    3x Installments
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Pay <strong>Rs. {kokoInstallment}</strong> today, rest in 2 months.
                  </Typography>
                </Box>
              </Grid>

              {/* Option 3: COD */}
              <Grid item xs={12} sm={4}>
                <Box
                  onClick={() => setPaymentMethod('COD')}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: paymentMethod === 'COD' ? '#2E7D32' : '#E8DDD6',
                    bgcolor: paymentMethod === 'COD' ? '#F1F8E9' : 'white',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    height: '100%',
                    boxShadow: paymentMethod === 'COD' ? '0 4px 14px rgba(46,125,50,0.18)' : 'none',
                    '&:hover': { borderColor: '#2E7D32' }
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                    <LocalShipping sx={{ color: paymentMethod === 'COD' ? '#2E7D32' : '#8C7568' }} />
                    <Chip
                      size="small"
                      label="FREE Delivery"
                      color="success"
                      sx={{ fontSize: '0.68rem', fontWeight: 800 }}
                    />
                  </Stack>
                  <Typography variant="subtitle2" fontWeight={800} color="#1A1A1A">
                    Cash on Delivery
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Pay with cash at your doorstep upon arrival.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Simulated Card Fields when CARD is selected */}
            {paymentMethod === 'CARD' && (
              <Box sx={{ p: 2.5, bgcolor: '#FFF8FA', border: '1px solid #FCE4EC', borderRadius: 3, mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Lock sx={{ fontSize: 18, color: '#B5385C' }} />
                  <Typography variant="subtitle2" fontWeight={700} color="#B5385C">
                    Simulated Card Gateway (Payment gateway will be integrated)
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Card Number"
                      value={cardNumber}
                      onChange={e => handleFormatCardNumber(e.target.value)}
                      placeholder="•••• •••• •••• ••••"
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><CreditCard fontSize="small" /></InputAdornment>
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Expiry Date"
                      value={cardExpiry}
                      onChange={e => handleFormatExpiry(e.target.value)}
                      placeholder="MM/YY"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="CVV / CVC"
                      type="password"
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* KOKO Schedule when KOKO is selected */}
            {paymentMethod === 'KOKO' && (
              <Box sx={{ p: 2.5, bgcolor: '#F8F4FF', border: '1px solid #E9D5FF', borderRadius: 3, mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <Verified sx={{ fontSize: 20, color: '#6800E8' }} />
                  <Typography variant="subtitle2" fontWeight={700} color="#6800E8">
                    KOKO Buy Now Pay Later — 3 Interest-Free Installments
                  </Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid item xs={4}>
                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #DDD6FE', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>1st (Today)</Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="#6800E8">Rs. {kokoInstallment}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #DDD6FE', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>2nd (In 30 Days)</Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="#6800E8">Rs. {kokoInstallment}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #DDD6FE', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>3rd (In 60 Days)</Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="#6800E8">Rs. {kokoInstallment}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* SECTION 3: Optional Coupon Code */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  fullWidth
                  label="Discount Coupon Code (Optional)"
                  placeholder="e.g. GLOW10, SAVE500"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LocalOffer fontSize="small" sx={{ color: '#8C7568' }} /></InputAdornment>
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleApplyCoupon}
                  sx={{ whiteSpace: 'nowrap', px: 3, py: 1, borderRadius: 2, color: '#B5385C', borderColor: '#B5385C' }}
                >
                  Apply
                </Button>
              </Stack>
              {couponError && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{couponError}</Typography>}
              {appliedCoupon && (
                <Alert severity="success" sx={{ mt: 1, py: 0.2, borderRadius: 2 }} onClose={() => setAppliedCoupon('')}>
                  Coupon <strong>{appliedCoupon}</strong> applied! You saved Rs. {couponDiscount.toFixed(2)}.
                </Alert>
              )}
            </Box>

            {/* SECTION 4: Order Breakdown Summary */}
            <Box sx={{ p: 2.5, bgcolor: '#FAF7F5', borderRadius: 3, border: '1px solid #EFE6E1' }}>
              <Typography variant="subtitle2" fontWeight={800} color="#4A3B32" gutterBottom>
                Order Summary
              </Typography>
              <Stack spacing={1} sx={{ fontSize: '0.9rem', color: '#555' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal ({qty} {qty > 1 ? 'items' : 'item'}):</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    Delivery Charge:
                    {deliveryCharge > 0 ? (
                      <Chip label="+ Rs. 350.00" size="small" sx={{ ml: 1, height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
                    ) : (
                      <Chip label="FREE" size="small" color="success" sx={{ ml: 1, height: 20, fontSize: '0.68rem', fontWeight: 800 }} />
                    )}
                  </span>
                  <span>{deliveryCharge > 0 ? `Rs. ${deliveryCharge.toFixed(2)}` : 'FREE (Rs. 0.00)'}</span>
                </Box>
                {couponDiscount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32', fontWeight: 700 }}>
                    <span>Coupon Discount:</span>
                    <span>- Rs. {couponDiscount.toFixed(2)}</span>
                  </Box>
                )}
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#1A1A1A">
                    Total Due:
                  </Typography>
                  <Typography variant="h5" fontWeight={900} sx={{
                    background: 'linear-gradient(135deg, #B5385C 0%, #9B00A1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Rs. {grandTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </DialogContent>

          {/* Modal Actions */}
          <DialogActions sx={{ p: 2.5, bgcolor: '#FFFFFF', borderTop: '1px solid #EFE6E1', display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={onClose} disabled={loading} color="inherit" sx={{ fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ElectricBolt />}
              sx={{
                bgcolor: paymentMethod === 'KOKO' ? '#6800E8' : paymentMethod === 'COD' ? '#2E7D32' : '#B5385C',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.95rem',
                px: 4,
                py: 1.2,
                borderRadius: 3,
                boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                '&:hover': {
                  bgcolor: paymentMethod === 'KOKO' ? '#5500BF' : paymentMethod === 'COD' ? '#1B5E20' : '#8E2845'
                }
              }}
            >
              {loading
                ? 'Processing...'
                : paymentMethod === 'CARD'
                ? `Pay Rs. ${grandTotal.toFixed(2)} with Card`
                : paymentMethod === 'KOKO'
                ? `Pay 1st Installment (Rs. ${kokoInstallment}) with KOKO`
                : `Place COD Order (Rs. ${grandTotal.toFixed(2)})`}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
}
