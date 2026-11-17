const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DIGEST = /^[0-9a-f]{64}$/;
const STORAGE_PREFIX = 'sekkin:order-request:v1:';
const STORAGE_WARNING = 'This browser cannot reliably save retry protection across a refresh. Keep this page open; if the result is unclear, check your orders or contact support before retrying.';

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value ?? null);
}

function uuid(crypto) {
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID();
  if (!crypto?.getRandomValues) throw new Error('Secure retry protection is unavailable in this browser. Please contact support before ordering.');
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Persist only a SHA-256 intent digest, random retry key and completion marker. Never persist the
// address, contact fields, JWT, request body or receipt through this helper.
export function createOrderRequestStore({ storage = () => globalThis.sessionStorage, crypto = globalThis.crypto } = {}) {
  const memory = new Map();
  return {
    async get(scope, intent, { newPurchase = false } = {}) {
      if (!['cart', 'direct'].includes(scope)) throw new Error('Unsupported order request.');
      if (!crypto?.subtle) throw new Error('Secure retry protection is unavailable in this browser. Please contact support before ordering.');
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(intent)));
      const signature = [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
      let record = memory.get(scope);
      let store;
      let readable = true;
      try {
        store = storage();
        if (!store) throw new Error('Session storage unavailable');
        if (!record) {
          const saved = store.getItem(`${STORAGE_PREFIX}${scope}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (!DIGEST.test(parsed?.signature) || !UUID_V4.test(parsed?.key)) throw new Error('Invalid retry information');
            record = { signature: parsed.signature, key: parsed.key, completed: parsed.completed === true };
          }
        }
      } catch { readable = false; }
      if (!record || record.signature !== signature || (record.completed && newPurchase)) record = { signature, key: uuid(crypto), completed: false };
      memory.set(scope, record);
      let persistent = readable;
      try {
        if (!store || !readable) throw new Error('Retry information unavailable');
        store.setItem(`${STORAGE_PREFIX}${scope}`, JSON.stringify(record));
      } catch { persistent = false; }
      return { key: record.key, persistent, warning: persistent ? '' : STORAGE_WARNING };
    },
    complete(scope, key) {
      const record = memory.get(scope);
      if (!record || record.key !== key) return { persistent: false, warning: STORAGE_WARNING };
      record.completed = true;
      try {
        storage().setItem(`${STORAGE_PREFIX}${scope}`, JSON.stringify(record));
        return { persistent: true, warning: '' };
      } catch { return { persistent: false, warning: STORAGE_WARNING }; }
    },
  };
}

export const orderRequests = createOrderRequestStore();

export function validateOrderReceipt(receipt, { direct = false } = {}) {
  const id = receipt?.orderId ?? receipt?.id;
  if (!Number.isInteger(Number(id)) || Number(id) <= 0 ||
    receipt?.totalAmount == null || !Number.isFinite(Number(receipt.totalAmount)) || Number(receipt.totalAmount) < 0 ||
    receipt?.deliveryCharge == null || !Number.isFinite(Number(receipt.deliveryCharge)) || Number(receipt.deliveryCharge) < 0 ||
    !['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(receipt?.status) ||
    receipt?.paymentMethod !== 'COD' || !['PENDING_COD', 'PAID'].includes(receipt?.paymentStatus) ||
    (direct && (!Number.isInteger(receipt?.quantity) || receipt.quantity <= 0 ||
      typeof receipt?.unitPrice !== 'number' || !Number.isFinite(receipt.unitPrice) || receipt.unitPrice < 0 ||
      typeof receipt?.subtotal !== 'number' || !Number.isFinite(receipt.subtotal) || receipt.subtotal < 0))) {
    throw new Error('The server response could not confirm your order. Retry with unchanged details or contact support; do not create a different request while its result is unclear.');
  }
  return receipt;
}

export function allowedOrderTransitions(status) {
  return ({ PENDING: ['CANCELLED'], PROCESSING: ['SHIPPED', 'CANCELLED'], SHIPPED: ['DELIVERED'] })[status] || [];
}

export function canRecordCodCollection(order) {
  return order?.status === 'DELIVERED' && order?.paymentMethod === 'COD' && order?.paymentStatus === 'PENDING_COD';
}
