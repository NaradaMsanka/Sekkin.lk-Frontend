import axios from 'axios';

const API_URL = 'http://localhost:8080/api/cart';

// Token එක Header එකට දාන Helper Function එක
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

// 1. භාණ්ඩ Cart එකට දාන Function එක (කලින් මේක මිස් වෙලා තිබුණේ)
export const addToCart = async (productId, quantity) => {
    const response = await axios.post(`${API_URL}/items`, { productId, quantity }, getAuthHeaders());
    return response.data;
};

// 2. Cart එක බලන Function එක
export const getCart = async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
};

// 3. Quantity එක වෙනස් කරන Function එක
export const updateCartItem = async (productId, quantity) => {
    const response = await axios.put(`${API_URL}/items/${productId}?quantity=${quantity}`, {}, getAuthHeaders());
    return response.data;
};

// 4. Cart එකෙන් අයින් කරන Function එක
export const removeCartItem = async (productId) => {
    const response = await axios.delete(`${API_URL}/items/${productId}`, getAuthHeaders());
    return response.data;
};