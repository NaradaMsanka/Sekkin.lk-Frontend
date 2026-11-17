import { Alert } from '@mui/material';
import { deliveryPricingNotice } from '../content/delivery';

export default function DeliveryPricingNotice() {
  return <Alert severity="info" sx={{ mt: 2, mb: 2, borderRadius: 2, fontSize: '.75rem', overflowWrap: 'anywhere' }}>{deliveryPricingNotice}</Alert>;
}
