import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Paper, Snackbar, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material';
import { Add, EditOutlined } from '@mui/icons-material';
import api from '../../services/api';

const emptyDraft = () => ({ code: '', percentage: '', active: true, productIds: [] });
const message = (error, fallback) => typeof error.response?.data?.message === 'string' ? error.response.data.message
  : typeof error.response?.data === 'string' ? error.response.data : error.response?.status === 401 ? 'Your session has expired. Please sign in again.' : fallback;

export default function AdminPromotions({ products = [], refreshKey }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const submitting = useRef(false);
  const options = useMemo(() => products.map(product => ({ ...product, id: Number(product.id), name: product.name || `Product #${product.id}` })), [products]);
  const names = useMemo(() => new Map(options.map(product => [product.id, product.name])), [options]);
  const loadPromotions = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const { data } = await api.get('/api/admin/promotions');
      if (!Array.isArray(data)) throw new Error('Invalid response');
      setPromotions(data);
    } catch (error) { setLoadError(message(error, 'Could not load promo codes. Please retry.')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadPromotions(); }, [loadPromotions, refreshKey]);

  const openEditor = (promotion = null) => {
    setEditingId(promotion?.id ?? null);
    setDraft(promotion ? { code: promotion.code, percentage: String(promotion.percentage), active: promotion.active, productIds: promotion.productIds.map(Number) } : emptyDraft());
    setFieldErrors({}); setFormError(''); setOpen(true);
  };
  const update = (field, value) => {
    setDraft(current => ({ ...current, [field]: value }));
    setFieldErrors(current => ({ ...current, [field]: '' })); setFormError('');
  };
  const save = async event => {
    event.preventDefault();
    if (submitting.current) return;
    const code = draft.code.trim();
    const percentage = Number(draft.percentage);
    const productIds = options.filter(product => draft.productIds.includes(product.id)).map(product => product.id);
    const errors = {};
    if (!/^[A-Z0-9_-]{1,40}$/.test(code)) errors.code = 'Use 1–40 letters, numbers, underscores or hyphens.';
    if (!/^\d{1,3}(\.\d{1,2})?$/.test(draft.percentage) || percentage < 0.01 || percentage > 100) errors.percentage = 'Enter 0.01–100%, with at most two decimal places.';
    if (!productIds.length) errors.productIds = 'Select at least one product.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    submitting.current = true; setSaving(true); setFormError('');
    const payload = { code, percentage, active: Boolean(draft.active), productIds };
    try {
      if (editingId !== null) await api.put(`/api/admin/promotions/${editingId}`, payload);
      else await api.post('/api/admin/promotions', payload);
      setOpen(false); setToast(editingId !== null ? 'Promo code updated.' : 'Promo code created.'); await loadPromotions();
    } catch (error) { setFormError(message(error, 'Could not save this promo code. Please retry.')); }
    finally { submitting.current = false; setSaving(false); }
  };

  return <Stack spacing={2.5}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
      <Box><Typography component="h2" variant="h2">Promo codes</Typography><Typography variant="body2" color="text.secondary">Create percentage offers for selected products. Delivery charges stay unchanged.</Typography></Box>
      <Button variant="contained" startIcon={<Add />} disabled={loading || saving || !options.length} onClick={() => openEditor()}>Create promo code</Button>
    </Stack>
    {!options.length && <Alert severity="info">Add a product before creating a promo code.</Alert>}
    {loadError && <Alert severity="error" action={<Button color="inherit" onClick={loadPromotions}>Retry</Button>}>{loadError}</Alert>}
    <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress size={28} aria-label="Loading promo codes" /></Box>
        : promotions.length ? <TableContainer><Table sx={{ minWidth: 660 }} aria-label="Admin promo codes">
          <TableHead><TableRow>{['Code', 'Offer', 'Selected products', 'Status', 'Actions'].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
          <TableBody>{promotions.map(promotion => <TableRow key={promotion.id}>
            <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>{promotion.code}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{Number(promotion.percentage)}% off</TableCell>
            <TableCell sx={{ maxWidth: 360, overflowWrap: 'anywhere' }}>{promotion.productIds.map(id => names.get(Number(id)) || `Unavailable product #${id}`).join(', ')}</TableCell>
            <TableCell><Chip size="small" label={promotion.active ? 'Active' : 'Inactive'} color={promotion.active ? 'success' : 'default'} /></TableCell>
            <TableCell><Button size="small" startIcon={<EditOutlined />} onClick={() => openEditor(promotion)}>Edit</Button></TableCell>
          </TableRow>)}</TableBody>
        </Table></TableContainer> : !loadError && <Box sx={{ p: 4, textAlign: 'center' }}><Typography sx={{ fontWeight: 600 }}>No promo codes yet</Typography><Typography variant="body2" color="text.secondary">Create a code, set its offer rate, and choose eligible products.</Typography></Box>}
    </Paper>
    <Dialog open={open} fullWidth maxWidth="sm" aria-labelledby="promo-editor-title" disableEscapeKeyDown={saving} onClose={() => { if (!saving) setOpen(false); }}>
      <Box component="form" onSubmit={save} noValidate>
        <DialogTitle id="promo-editor-title">{editingId !== null ? 'Edit promo code' : 'Create promo code'}</DialogTitle>
        <DialogContent><Stack spacing={2.5} sx={{ pt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField label="Promo code" value={draft.code} onChange={event => update('code', event.target.value.toUpperCase())}
            error={Boolean(fieldErrors.code)} helperText={fieldErrors.code || 'Customers enter this code at checkout.'}
            slotProps={{ htmlInput: { maxLength: 40, autoCapitalize: 'characters' } }} disabled={saving} required autoFocus fullWidth />
          <TextField label="Discount percentage" type="number" value={draft.percentage} onChange={event => update('percentage', event.target.value)}
            error={Boolean(fieldErrors.percentage)} helperText={fieldErrors.percentage || 'For example, 10 gives 10% off.'}
            slotProps={{ htmlInput: { min: 0.01, max: 100, step: 0.01 } }} disabled={saving} required fullWidth />
          <Autocomplete multiple disableCloseOnSelect filterSelectedOptions options={options}
            value={options.filter(product => draft.productIds.includes(product.id))} getOptionLabel={product => product.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, selected) => update('productIds', selected.map(product => product.id))} disabled={saving}
            renderInput={params => <TextField {...params} label="Selected products" error={Boolean(fieldErrors.productIds)} helperText={fieldErrors.productIds || 'Only these products receive this discount.'} required />} />
          <FormControlLabel label="Active promo code" control={<Switch checked={draft.active} onChange={event => update('active', event.target.checked)} disabled={saving} />} />
        </Stack></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}><Button disabled={saving} onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}>{saving ? 'Saving…' : 'Save promo code'}</Button></DialogActions>
      </Box>
    </Dialog>
    <Snackbar open={Boolean(toast)} autoHideDuration={5000} onClose={(_, reason) => { if (reason !== 'clickaway') setToast(''); }}><Alert severity="success" variant="filled" onClose={() => setToast('')}>{toast}</Alert></Snackbar>
  </Stack>;
}
