import api from './api';

// 1. Cart එකට item add කිරීම
export const addToCart = async (productId, quantity) => {
    const response = await api.post('/api/cart/items', { productId, quantity });
    return response.data;
};

// 2. Cart එක load කිරීම
export const getCart = async () => {
    const response = await api.get('/api/cart');
    return response.data;
};

// 3. Cart item quantity update කිරීම
export const updateCartItem = async (productId, quantity) => {
    const response = await api.put(`/api/cart/items/${productId}?quantity=${quantity}`, {});
    return response.data;
};

// 4. Cart item delete කිරීම
export const removeCartItem = async (productId) => {
    const response = await api.delete(`/api/cart/items/${productId}`);
    return response.data;
};