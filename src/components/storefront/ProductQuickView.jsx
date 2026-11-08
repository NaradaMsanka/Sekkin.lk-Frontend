import { Link } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Dialog, DialogContent, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { Add, ArrowForward, Close, Remove, ShoppingCart, WhatsApp } from '@mui/icons-material';
import ProductMedia from './ProductMedia';
import { ProductPrice } from './ProductCard';

export default function ProductQuickView({ product, onClose, quantity, setQuantity, onAddToCart, onBuy, busy }) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <Dialog open={Boolean(product)} onClose={onClose} maxWidth="md" fullWidth aria-labelledby="quick-view-title" transitionDuration={reducedMotion ? 0 : 200}
      slotProps={{ paper: { sx: { borderRadius: 4, m: { xs: 1.5, sm: 3 }, width: { xs: 'calc(100% - 24px)', sm: 'calc(100% - 48px)' }, maxHeight: 'calc(100dvh - 24px)' } } }}>
      <IconButton aria-label="Close product preview" onClick={onClose} sx={{ position: 'absolute', right: 10, top: 10, zIndex: 1, bgcolor: '#FFFFFFED' }}><Close /></IconButton>
      {product && <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1fr)' }, gap: { xs: 3, sm: 4 }, alignItems: 'center' }}>
          <ProductMedia src={product.imageUrl} alt={product.name} priority sx={{ borderRadius: 3, maxHeight: { xs: 230, sm: 'none' } }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="primary">{[product.brand, product.category].filter(Boolean).join(' / ')}</Typography>
            <Typography id="quick-view-title" variant="h5" component="h2" sx={{ fontFamily: 'Georgia, serif', lineHeight: 1.35, mb: 2 }}>{product.name}</Typography>
            <ProductPrice product={product} large />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, my: 2, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</Typography>
            <Chip variant="outlined" size="small" label={product.stockQuantity > 0 ? 'In stock' : 'Out of stock'} sx={{ mb: 2 }} />
            <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
              <Typography variant="body2">Quantity</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #E4D9D2', borderRadius: 2 }}>
                <IconButton aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))}><Remove fontSize="small" /></IconButton>
                <Typography aria-live="polite" sx={{ minWidth: 28, textAlign: 'center', fontSize: '0.85rem' }}>{quantity}</Typography>
                <IconButton aria-label="Increase quantity" disabled={quantity >= product.stockQuantity} onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}><Add fontSize="small" /></IconButton>
              </Box>
            </Stack>
            <Stack spacing={1}>
              <Button variant="contained" endIcon={<ArrowForward />} disabled={product.stockQuantity <= 0} onClick={() => onBuy(product, quantity)}>Pay now</Button>
              <Button className="store-cart-button" variant="outlined" startIcon={busy ? <CircularProgress size={17} /> : <ShoppingCart />} disabled={busy || product.stockQuantity <= 0} onClick={() => onAddToCart(product, quantity)}>{busy ? 'Adding to cart…' : 'Add to cart'}</Button>
              <Button component={Link} to={`/product/${product.id}`} onClick={onClose} color="inherit">View full details</Button>
              <Button component="a" href={`https://wa.me/94788153473?text=${encodeURIComponent(`Hello Sekkin.lk, I have a question about ${product.name}`)}`} target="_blank" rel="noopener noreferrer" startIcon={<WhatsApp />} size="small" sx={{ color: '#4F6958' }}>Ask about this product</Button>
            </Stack>
          </Box>
        </Box>
      </DialogContent>}
    </Dialog>
  );
}
