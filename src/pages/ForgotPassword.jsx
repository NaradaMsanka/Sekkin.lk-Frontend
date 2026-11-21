import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, InputAdornment, TextField, Typography } from '@mui/material';
import { EmailOutlined } from '@mui/icons-material';
import api from '../services/api';
import { recoveryRetryMessage } from '../content/passwordPolicy';
import PasswordRecoveryLayout from './PasswordRecoveryLayout';

const CONFIRMATION = 'If an account exists for that email address, you will receive a password reset link shortly. Please check your inbox and spam folder.';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() }, { skipAuth: true });
      setSent(true);
      setEmail('');
    } catch (requestError) {
      setError(requestError.response?.status === 429
        ? recoveryRetryMessage(requestError.response.headers?.['retry-after'])
        : 'We could not send a reset link right now. Please try again later.');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <PasswordRecoveryLayout title={sent ? 'Check your inbox' : 'Forgot your password?'} description={sent ? 'Your next step is in your email.' : 'Enter your account email and we will send you a link to reset your password.'}>
      {sent ? (
        <>
          <Alert severity="success" role="status" sx={{ mb: 3, borderRadius: 2, fontSize: '0.9375rem' }}>{CONFIRMATION}</Alert>
          <Typography sx={{ fontSize: '0.9375rem', lineHeight: 1.75, color: 'text.secondary', mb: 3 }}>The link expires after 20 minutes. If you did not request it, you can ignore the email.</Typography>
          <Button fullWidth variant="outlined" onClick={() => { setSent(false); setError(''); }} sx={{ mb: 1 }}>Try another email</Button>
        </>
      ) : (
        <Box component="form" onSubmit={handleSubmit} aria-busy={loading}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          <TextField fullWidth id="recovery-email" label="Email address" type="email" autoComplete="email" required disabled={loading}
            value={email} onChange={event => setEmail(event.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlined color="primary" /></InputAdornment> }, htmlInput: { maxLength: 254 } }}
            sx={{ mb: 3, '& .MuiInputBase-input': { fontSize: '1rem' }, '& .MuiInputLabel-root': { fontSize: '0.9375rem' } }} />
          <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined} sx={{ py: 1.5, mb: 1 }}>
            {loading ? 'Sending reset link...' : 'Send reset link'}
          </Button>
        </Box>
      )}
      <Button fullWidth component={Link} to="/login" sx={{ mt: 1 }}>Back to login</Button>
    </PasswordRecoveryLayout>
  );
}
