import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function promoErrorMessage(error) {
  const data = error.response?.data;
  const message = typeof data?.message === 'string' ? data.message : typeof data === 'string' ? data : '';
  if (error.response?.status === 400 && message === 'Promo code is invalid or inactive.') {
    return 'Invalid or inactive promo code. Please check it and try again.';
  }
  if (error.response?.status === 400 && message === 'This promo code does not apply to any products in your order.') {
    return 'This promo code does not apply to these products. Please try another code.';
  }
  if ([400, 409].includes(error.response?.status) && message) return message;
  if (!error.isAxiosError && !error.response && error.message) return error.message;
  return 'We could not check this promo code. Please try again.';
}

export default function usePromotion(items, authState, onPricesChanged) {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [problem, setProblem] = useState(null);
  const [checking, setChecking] = useState(false);
  const sequence = useRef(0);
  useEffect(() => () => { sequence.current += 1; }, []);
  const key = JSON.stringify(items.map(item => [Number(item.productId), Number(item.quantity), Number(item.unitPrice)]).sort((a, b) => a[0] - b[0]));
  const currentKey = useRef(key);
  useLayoutEffect(() => { currentKey.current = key; }, [key]);
  const quote = result?.key === key && result?.code === code.trim().toUpperCase() ? result.quote : null;
  const error = problem?.key === key ? problem.message : '';
  const cancelCheck = () => {
    // Freeze the displayed total when checkout starts; ignore any late promo response.
    sequence.current += 1;
    setChecking(false);
  };
  const changeCode = value => {
    cancelCheck();
    setCode(value.toUpperCase()); setResult(null); setProblem(null);
  };
  const apply = async () => {
    const submittedCode = code.trim().toUpperCase();
    if (!submittedCode) { changeCode(''); return; }
    const attempt = ++sequence.current;
    setChecking(true); setProblem(null); setResult(null);
    try {
      const { data } = await api.post('/api/checkout/quote', {
        couponCode: submittedCode,
        items: items.map(item => ({ productId: Number(item.productId), quantity: Number(item.quantity) })),
      });
      if (attempt !== sequence.current || currentKey.current !== key) return;
      if (data.couponCode !== submittedCode || !['subtotal', 'couponDiscount', 'deliveryCharge', 'total'].every(field => Number.isFinite(data[field]) && data[field] >= 0)
          || !(data.couponPercentage > 0 && data.couponPercentage <= 100) || data.couponDiscount > data.subtotal
          || Math.abs(data.total - (data.subtotal - data.couponDiscount + data.deliveryCharge)) > 0.005) throw new Error('The promo code could not be verified. Please try again.');
      const localSubtotal = items.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
      if (Math.abs(data.subtotal - localSubtotal) > 0.005) {
        onPricesChanged?.();
        throw new Error('Product prices changed. Refresh the product or cart before applying this promo code.');
      }
      setResult({ key, code: submittedCode, quote: data });
    } catch (error) {
      if (attempt !== sequence.current || currentKey.current !== key) return;
      if (error.response?.status === 401) {
        localStorage.removeItem('token'); navigate('/login', { replace: true, state: authState }); return;
      }
      setProblem({ key, message: promoErrorMessage(error) });
    } finally { if (attempt === sequence.current) setChecking(false); }
  };
  return { code, quote, error, checking, changeCode, apply, cancelCheck, remove: () => changeCode('') };
}
