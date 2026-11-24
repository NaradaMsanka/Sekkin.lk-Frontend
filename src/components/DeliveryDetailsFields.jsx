import { Box, TextField } from '@mui/material';

export default function DeliveryDetailsFields({ value, onChange, disabled = false, idPrefix = 'checkout' }) {
  const field = (name, label, autoComplete, maxLength, extra = {}) => (
    <TextField
      id={`${idPrefix}-${name}`}
      name={name}
      label={label}
      autoComplete={autoComplete}
      value={value[name]}
      onChange={event => onChange({ ...value, [name]: event.target.value })}
      disabled={disabled}
      required
      fullWidth
      slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength } }}
      {...extra}
    />
  );

  return <Box sx={{
    display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5,
    '& .MuiTextField-root': { minWidth: 0 },
    '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '12px', fontSize: '1rem' },
    '& .MuiInputLabel-root': { fontSize: '1rem' },
    '& .MuiOutlinedInput-input': { py: 1.75 },
    '& .MuiOutlinedInput-multiline': { p: 1.75 },
    '& textarea.MuiOutlinedInput-input': { p: 0 },
  }}>
    {field('name', 'Full name', 'name', 160, { sx: { gridColumn: '1 / -1' } })}
    {field('phoneNumber', 'Phone number', 'tel', 40, { type: 'tel' })}
    {field('email', 'Email address', 'email', 254, { type: 'email' })}
    {field('address', 'Delivery address', 'street-address', 2000, {
      multiline: true, minRows: 2, maxRows: 5, placeholder: 'House / building number and street', sx: { gridColumn: '1 / -1' },
    })}
    {field('city', 'City', 'address-level2', 100)}
    {field('postalCode', 'Postal code (optional)', 'postal-code', 40, { required: false })}
  </Box>;
}
