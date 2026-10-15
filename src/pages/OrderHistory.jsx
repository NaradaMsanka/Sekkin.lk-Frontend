import React, { useEffect, useState } from 'react';
import api from '../services/api'; // අපි අලුතින් හැදූ api.js එක ඉම්පෝට් කිරීම

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // දැන් වෙනම headers ලියන්න අවශ්‍ය නැත, api එක මඟින් token එක ඔටෝ යයි
                const response = await api.get('/api/orders');
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <p style={{ color: 'white', padding: '20px' }}>Loading orders...</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', color: 'white' }}>
            <h2>My Order History</h2>
            {orders.length === 0 ? (
                <p>You haven't placed any orders yet.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Order ID</th>
                            <th style={{ padding: '10px' }}>Address</th>
                            <th style={{ padding: '10px' }}>Total Amount</th>
                            <th style={{ padding: '10px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #444' }}>
                                <td style={{ padding: '10px' }}>#{order.id}</td>
                                <td style={{ padding: '10px' }}>{order.shippingAddress}</td>
                                <td style={{ padding: '10px' }}>Rs. {order.totalAmount}</td>
                                <td style={{ padding: '10px' }}>
                                    <strong style={{ 
                                        color: order.status === 'PENDING' ? 'orange' : 
                                               order.status === 'SHIPPED' ? 'blue' : 'green' 
                                    }}>
                                        {order.status}
                                    </strong>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OrderHistory;