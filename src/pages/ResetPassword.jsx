import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField } from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../services/api';
import { getConfirmationError, getPasswordError, readPasswordResetLink, recoveryRetryMessage } from '../content/passwordPolicy';
import PasswordRecoveryLayout from './PasswordRecoveryLayout';

export default function ResetPassword() {
  const [resetLink] = useState(() => readPasswordResetLink(window.location.href));
  const [currentLink, setCurrentLink] = useState(resetLink);

  useLayoutEffect(() => {
    const captureLink = () => {
      const currentUrl = new URL(window.location.href);
      const hasToken = new URLSearchParams(currentUrl.hash.slice(1)).has('token') || currentUrl.searchParams.has('token');
      const nextLink = readPasswordResetLink(window.location.href);
      window.history.replaceState(window.history.state, '', nextLink.cleanUrl);
      // Navigation anchors, including the keyboard skip link, must not replace
      // the valid token already held in memory with a missing-token state.
      if (hasToken) setCurrentLink(nextLink);
    };
    // Keep the router history entry while removing secrets from address/history.
    window.history.replaceState(window.history.state, '', resetLink.cleanUrl);
    window.addEventListener('hashchange', captureLink);
    return () => window.removeEventListener('hashchange', captureLink);
  }, [resetLink.cleanUrl]);

  return <ResetPasswordForm key={currentLink.token || 'invalid'} initialToken={currentLink.token} />;
}

function ResetPasswordForm({ initialToken }) {
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [invalidLink, setInvalidLink] = useState(!initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const pendingRequest = useRef(null);
  const navigate = useNavigate();
  const passwordError = getPasswordError(password);
  const confirmationError = getConfirmationError(password, confirmation);

  useEffect(() => () => pendingRequest.current?.abort(), []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    if (submitting.current || invalidLink || passwordError || confirmationError) return;
    submitting.current = true;
    setLoading(true);
    setError('');
    pendingRequest.current = new AbortController();
    try {
      await api.post('/api/auth/reset-password', { token, newPassword: password, confirmPassword: confirmation }, { skipAuth: true, signal: pendingRequest.current.signal });
      setToken('');
      setPassword('');
      setConfirmation('');
      // Password reset revokes server sessions. Remove this browser's old session
      // as well, but never create a new login session from the reset response.
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch {
        // Storage can be disabled; the server has still revoked old JWTs.
      }
      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (requestError) {
      if (requestError.code === 'ERR_CANCELED') return;
      if (requestError.response?.status === 400) {
        setInvalidLink(true);
        setToken('');
        setPassword('');
        setConfirmation('');
      } else {
        setError(requestError.response?.status === 429
          ? recoveryRetryMessage(requestError.response.headers?.['retry-after'])
          : 'We could not reset your password right now. Please try again later.');
      }
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <PasswordRecoveryLayout title={invalidLink ? 'Request a new reset link' : 'Create a new password'} description={invalidLink ? 'This password reset link is invalid, has expired, or has already been used.' : 'Choose a new password for your SEKKIN.LK account.'}>
      {invalidLink ? (
        <>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>For your security, reset links can only be used once and expire after 20 minutes.</Alert>
          <Button fullWidth component={Link} to="/forgot-password" replace variant="contained" size="large" sx={{ py: 1.5, mb: 1 }}>Request a new reset link</Button>
        </>
      ) : (
        <Box component="form" onSubmit={handleSubmit} aria-busy={loading} noValidate>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          <TextField fullWidth id="new-password" label="New password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required disabled={loading}
            value={password} onChange={event => setPassword(event.target.value)} error={attempted && !!passwordError}
            helperText={attempted && passwordError ? passwordError : 'Use at least 6 characters. Maximum 72 UTF-8 bytes.'}
            slotProps={{ input: {
              startAdornment: <InputAdornment position="start"><LockOutlined color="primary" /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton type="button" aria-label={showPassword ? 'Hide passwords' : 'Show passwords'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} disabled={loading} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
            } }}
            sx={{ mb: 2.5, '& .MuiInputBase-input': { fontSize: '1rem' }, '& .MuiInputLabel-root': { fontSize: '0.9375rem' }, '& .MuiFormHelperText-root': { fontSize: '0.875rem' } }} />
          <TextField fullWidth id="confirm-password" label="Confirm new password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required disabled={loading}
            value={confirmation} onChange={event => setConfirmation(event.target.value)} error={(attempted || !!confirmation) && !!confirmationError}
            helperText={(attempted || !!confirmation) && confirmationError ? confirmationError : ' '}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockOutlined color="primary" /></InputAdornment> } }}
            sx={{ mb: 2.5, '& .MuiInputBase-input': { fontSize: '1rem' }, '& .MuiInputLabel-root': { fontSize: '0.9375rem' }, '& .MuiFormHelperText-root': { fontSize: '0.875rem' } }} />
          <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined} sx={{ py: 1.5, mb: 1 }}>
            {loading ? 'Resetting password...' : 'Reset password'}
          </Button>
        </Box>
      )}
      <Button fullWidth component={Link} to="/login" replace sx={{ mt: 1 }}>Back to login</Button>
    </PasswordRecoveryLayout>
  );
}
