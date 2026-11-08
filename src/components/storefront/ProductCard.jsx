import { Link } from 'react-router-dom';
import { Box, Button, Card, Chip, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { ArrowForward, Check, Favorite, FavoriteBorder, ShoppingCart, VisibilityOutlined } from '@mui/icons-material';
import ProductMedia from './ProductMedia';

export function ProductPrice({ product, large = false }) {
  const discounted = product.discountPrice > 0 && product.discountPrice < product.price;
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1, minHeight: large ? 44 : 32 }}>
      <Typography component="span" sx={{ fontSize: large ? '1.8rem' : '1.12rem', fontWeight: 600, color: '#302326', fontVariantNumeric: 'tabular-nums' }}>
        Rs. {(discounted ? product.discountPrice : product.price).toLocaleString('en-LK', { maximumFractionDigits: 2 })}
      </Typography>
      {discounted && <Typography component="del" variant="caption" color="text.secondary">Rs. {product.price.toLocaleString('en-LK')}</Typography>}
    </Box>
  );
}

export default function ProductCard({ product, list = false, priority = false, wishlisted, onWishlist, onQuickView, onAddToCart, onBuy, cartStatus }) {
  const inStock = product.stockQuantity > 0;
  const discounted = product.discountPrice > 0 && product.discountPrice < product.price;
  const busy = cartStatus === 'loading';
  const added = cartStatus === 'success';

  return (
    <Card component="article" className="store-product-card" variant="outlined"
      sx={{ height: '100%', minWidth: 0, display: 'flex', flexDirection: list ? { xs: 'column', sm: 'row' } : 'column', borderColor: '#E9DFD8', borderRadius: 3, overflow: 'hidden', boxShadow: 'none',
        transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
        '@media (hover: hover) and (prefers-reduced-motion: no-preference)': { '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px #3023260B', borderColor: '#CEB5AA' }, '&:hover .product-media img': { transform: 'scale(1.035)' } } }}>
      <Box sx={{ position: 'relative', flexShrink: 0, width: list ? { xs: '100%', sm: 225 } : '100%' }}>
        <Box component={Link} to={`/product/${product.id}`} aria-label={`View ${product.name}`} sx={{ display: 'block' }}>
          <ProductMedia src={product.imageUrl} alt={product.name} priority={priority} />
        </Box>
        {discounted && <Chip size="small" label={`−${Math.round((1 - product.discountPrice / product.price) * 100)}%`} sx={{ position: 'absolute', left: 12, top: 12, bgcolor: '#FFFDFC', color: '#8F344D', fontWeight: 600, border: '1px solid #E6D7D1' }} />}
        <Box sx={{ position: 'absolute', right: 9, top: 9, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Tooltip title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}>
            <IconButton aria-label={`${wishlisted ? 'Remove' : 'Save'} ${product.name} ${wishlisted ? 'from' : 'to'} wishlist`} aria-pressed={wishlisted} onClick={() => onWishlist(product.id)} sx={{ bgcolor: '#FFFDFAF5', width: 40, height: 40, border: '1px solid #E9DFD8', '&:hover': { bgcolor: 'white' } }}>
              {wishlisted ? <Favorite className="wishlist-confirmation" fontSize="small" color="primary" /> : <FavoriteBorder fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Quick view">
            <IconButton aria-label={`Quick view ${product.name}`} onClick={() => onQuickView(product)} sx={{ bgcolor: '#FFFDFAF5', width: 40, height: 40, border: '1px solid #E9DFD8', '&:hover': { bgcolor: 'white' } }}>
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', minHeight: 25, fontSize: '0.63rem', letterSpacing: '0.12em', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{product.brand || product.category}</Typography>
        <Typography component={Link} to={`/product/${product.id}`} title={product.name} sx={{ color: 'text.primary', textDecoration: 'none', fontSize: '0.94rem', fontWeight: 500, lineHeight: 1.55, height: '2.92rem', mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', '&:hover': { color: 'primary.main' } }}>
          {product.name}
        </Typography>
        <ProductPrice product={product} />
        <Typography variant="caption" sx={{ minHeight: 28, mt: 0.5, color: inStock ? '#4F6958' : 'text.secondary' }}>{inStock ? product.skinType || 'Available now' : 'Currently out of stock'}</Typography>
        <Box sx={{ mt: 'auto', pt: 1.5, display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr)', gap: 1 }}>
          <Tooltip title={added ? 'Added to cart' : 'Add to cart'}>
            <span><Button className={`store-cart-button${added ? ' store-cart-button--added' : ''}`} variant="outlined" onClick={() => onAddToCart(product)} disabled={!inStock || busy} aria-label={`Add ${product.name} to cart`} aria-busy={busy}
              sx={{ minWidth: 44, width: 44, height: 44, p: 0, borderColor: added ? '#C5D5C8' : '#E7CCD4', bgcolor: added ? '#F0F6F0' : '#FCF3F6', color: added ? '#4F6958' : '#B5385C', transition: 'background-color 180ms ease, border-color 180ms ease, transform 180ms ease', '&:hover': { borderColor: '#B5385C', bgcolor: '#F7E6EC' } }}>
              {busy ? <CircularProgress size={18} color="inherit" /> : added ? <Check className="cart-confirmation" fontSize="small" /> : <ShoppingCart sx={{ fontSize: 22 }} />}
            </Button></span>
          </Tooltip>
          <Button className="store-primary-action" variant="contained" disableElevation endIcon={inStock ? <ArrowForward sx={{ fontSize: 17 }} /> : null} onClick={() => onBuy(product)} disabled={!inStock} sx={{ minWidth: 0, minHeight: 44, px: 1.5, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            {inStock ? 'Buy now' : 'Out of stock'}
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
