import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Avatar, Box, Button, CircularProgress, Rating, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { CheckCircleOutlined, LockOutlined, Send, StarOutlined } from '@mui/icons-material';
import api from '../../services/api';

const panel = { p: { xs: 2.5, sm: 3 }, border: '1px solid #E6DBD3', borderRadius: '20px', bgcolor: '#FFFDFC', minWidth: 0 };
const failureMessage = error => {
  const data = error.response?.data;
  return data?.message || data?.error || (typeof data === 'string' && data) || 'Your review could not be saved. Please try again.';
};

export default function ProductReviews({ productId, reviews, loading, error, onRetry, onSaved }) {
  const savedToken = localStorage.getItem('token');
  const token = savedToken && !['undefined', 'null'].includes(savedToken) ? savedToken : null;
  const [access, setAccess] = useState({ status: token ? 'loading' : 'anonymous' });
  const [attempt, setAttempt] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    api.get(`/api/products/${productId}/reviews/eligibility`, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          if (typeof data?.eligible !== 'boolean') throw new Error('Invalid review eligibility');
          setAccess({ status: 'ready', ...data });
        }
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        setAccess({ status: err.response?.status === 401 ? 'anonymous' : 'error' });
      });
    return () => controller.abort();
  }, [productId, token, attempt]);

  const submit = async event => {
    event.preventDefault();
    if (submitting || !access.eligible || rating < 1 || !comment.trim()) return;
    setSubmitting(true); setSubmitError('');
    try {
      const { data } = await api.post(`/api/products/${productId}/reviews`, { rating, comment: comment.trim() });
      onSaved(data);
      setSuccess(true); setComment(''); setRating(0);
      setAccess({ status: 'ready', eligible: false, alreadyReviewed: true });
    } catch (err) {
      setSubmitError(failureMessage(err));
      if (err.response?.status === 401) setAccess({ status: 'anonymous' });
      if ([403, 409].includes(err.response?.status)) setAccess({ status: 'ready', eligible: false, alreadyReviewed: err.response.status === 409, message: failureMessage(err) });
    } finally { setSubmitting(false); }
  };

  const average = reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1) : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography component="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '1.7rem', sm: '2rem' } }}>Customer reviews</Typography>
        {average && <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><Rating value={Number(average)} precision={0.1} readOnly size="small" /><Typography variant="body2" color="text.secondary">{average} / 5 · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</Typography></Stack>}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.2fr) minmax(0, 0.85fr)' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
        <Box sx={{ minWidth: 0, order: { xs: 1, md: 0 } }}>
          {loading ? <><Skeleton height={70} /><Skeleton height={100} /></> : error ? <Alert severity="warning" action={<Button size="small" onClick={onRetry}>Retry</Button>}>{error}</Alert> : reviews.length === 0 ? (
            <Box sx={{ ...panel, py: 5, textAlign: 'center' }}><StarOutlined sx={{ color: '#A88B79', fontSize: 36, mb: 1 }} /><Typography sx={{ fontWeight: 500, mb: 1 }}>No reviews yet</Typography><Typography variant="body2" color="text.secondary">Purchased this product? Share your experience once your order is delivered.</Typography></Box>
          ) : reviews.map(review => {
            const author = review.userEmail?.split('@')[0] || 'Customer';
            const date = review.createdAt ? new Date(review.createdAt) : null;
            return <Box component="article" key={review.id} sx={{ ...panel, mb: 2.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ bgcolor: '#F0E0E2', color: 'primary.main', width: 38, height: 38, fontSize: '.85rem' }}>{author[0].toUpperCase()}</Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontWeight: 500, fontSize: '.88rem', overflowWrap: 'anywhere' }}>{author}</Typography><Rating value={review.rating} readOnly size="small" /></Box>
                {date && !Number.isNaN(date.getTime()) && <Typography component="time" dateTime={review.createdAt} variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{date.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{review.comment}</Typography>
            </Box>;
          })}
        </Box>
        <Box sx={{ ...panel, order: { xs: 0, md: 1 }, bgcolor: '#F8F1EC' }}>
          {success && <Alert severity="success" sx={{ mb: 2 }}>Thank you. Your review has been published.</Alert>}
          {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
          {access.status === 'loading' ? <Box role="status"><Typography variant="body2" sx={{ mb: 1 }}>Checking your purchase…</Typography><Skeleton height={40} /><Skeleton height={65} /></Box> : access.status === 'error' ? <>
            <Typography component="h3" sx={{ fontWeight: 600, mb: 1 }}>Review access unavailable</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>We couldn’t check your purchase. Please try again shortly.</Typography>
            <Button variant="outlined" onClick={() => { setAccess({ status: 'loading' }); setAttempt(value => value + 1); }}>Check again</Button>
          </> : access.status === 'anonymous' ? <>
            <LockOutlined color="primary" sx={{ mb: 1.5 }} /><Typography component="h3" sx={{ fontWeight: 600, mb: 1 }}>Review a purchase</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2.5 }}>Sign in with the account used for your order. Reviews open after your order is delivered or completed.</Typography>
            <Button component={Link} to="/login" variant="contained">Sign in to continue</Button>
          </> : access.alreadyReviewed ? <>
            <CheckCircleOutlined color="success" sx={{ mb: 1.5 }} /><Typography component="h3" sx={{ fontWeight: 600, mb: 1 }}>You’ve shared your experience</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>One review per customer keeps the feedback helpful for everyone.</Typography>
          </> : !access.eligible ? <>
            <LockOutlined color="primary" sx={{ mb: 1.5 }} /><Typography component="h3" sx={{ fontWeight: 600, mb: 1 }}>For customers who purchased</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2.5 }}>{access.message || 'You can review this product after your order is delivered or completed.'}</Typography>
            <Button component={Link} to="/orders" variant="outlined">View my orders</Button>
          </> : <Box component="form" onSubmit={submit}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}><CheckCircleOutlined color="success" sx={{ fontSize: 19 }} /><Typography variant="caption" color="success.main">Your purchase is verified</Typography></Stack>
            <Typography component="h3" sx={{ fontWeight: 600, mb: 2.5 }}>Share your experience</Typography>
            <Typography component="p" id="review-rating-label" variant="body2" sx={{ mb: .75 }}>Your rating</Typography>
            <Rating name="product-review-rating" aria-labelledby="review-rating-label" value={rating} onChange={(_, value) => setRating(value || 0)} size="large" disabled={submitting} getLabelText={value => `${value} ${value === 1 ? 'star' : 'stars'}`} sx={{ mb: 2.5 }} />
            <TextField id="product-review-comment" fullWidth multiline minRows={4} maxRows={8} label="Your review" placeholder="What was your experience with this product?" required value={comment} onChange={event => setComment(event.target.value)} disabled={submitting} slotProps={{ htmlInput: { maxLength: 1000 } }} helperText={`${comment.length}/1000 characters`} sx={{ mb: 2.5 }} />
            <Button type="submit" variant="contained" fullWidth startIcon={submitting ? <CircularProgress color="inherit" size={17} /> : <Send sx={{ fontSize: 17 }} />} disabled={submitting || !rating || !comment.trim()} aria-busy={submitting}>{submitting ? 'Publishing review…' : 'Publish review'}</Button>
          </Box>}
        </Box>
      </Box>
    </Box>
  );
}
