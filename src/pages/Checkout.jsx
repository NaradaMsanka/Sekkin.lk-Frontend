import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
    const [address, setAddress] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleCheckout = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token'); // Login වීමේදී Save කරගත් Token එක
            
            // Backend එකට Address එක යැවීම (POST /api/orders)
            await axios.post(`http://localhost:8080/api/orders?shippingAddress=${address}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage("Order placed successfully! 🎉");
            setTimeout(() => {
                navigate('/orders'); // තත්පර 2කින් Order History පිටුවට යවයි
            }, 2000);

        } catch (error) {
            setMessage(error.response?.data || "Checkout failed. Please try again.");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
            <h2>Checkout</h2>
            {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
            
            <form onSubmit={handleCheckout}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Shipping Address:</label>
                    <textarea 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        required 
                        rows="4"
                        style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                        placeholder="Enter your full address here..."
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Place Order
                </button>
            </form>
        </div>
    );
};

export default Checkout;