import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';

export default function PromoCodeField({ promotion, disabled = false }) {
  return <Box>
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
      <TextField fullWidth size="small" label="Promo code" value={promotion.code}
        onChange={event => promotion.changeCode(event.target.value)} disabled={disabled || promotion.checking}
        error={Boolean(promotion.error)} helperText={promotion.error || undefined}
        slotProps={{ htmlInput: { maxLength: 40, autoCapitalize: 'characters' } }} sx={{ minWidth: 0 }} />
      <Button type="button" variant="outlined" disabled={disabled || promotion.checking || !promotion.code.trim()} onClick={promotion.apply} sx={{ minHeight: 40 }}>
        {promotion.checking ? <CircularProgress size={18} aria-label="Checking promo code" /> : 'Apply'}
      </Button>
    </Stack>
    {promotion.quote && <Alert severity="success" sx={{ mt: 1.5 }} onClose={disabled ? undefined : promotion.remove}>
      {promotion.quote.couponCode}: {promotion.quote.couponPercentage}% off eligible products. You saved Rs. {promotion.quote.couponDiscount.toFixed(2)}.
    </Alert>}
    {!promotion.quote && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
      {promotion.checking ? 'Checking your code. You can still check out at the regular price.' : 'Promo codes are optional. Without an applied offer, you can check out at the regular price.'}
    </Typography>}
  </Box>;
}
