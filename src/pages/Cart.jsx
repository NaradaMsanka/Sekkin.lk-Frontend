import { useEffect, useState } from 'react';
import { getCart, updateCartItem, removeCartItem } from '../services/cartService';

function Cart() {
    const [cart, setCart] = useState(null);

    // Cart එක Load කරගැනීම
    const fetchCart = async () => {
        try {
            const data = await getCart();
            setCart(data);
        } catch (error) {
            console.error("Error fetching cart", error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Quantity එක වෙනස් කිරීම
    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await updateCartItem(productId, newQuantity);
            fetchCart(); // Update වුණාට පස්සේ ආයෙත් Cart එක Load කරනවා
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update quantity");
        }
    };

    // භාණ්ඩයක් අයින් කිරීම
    const handleRemoveItem = async (productId) => {
        try {
            await removeCartItem(productId);
            fetchCart();
        } catch (error) {
            alert("Failed to remove item");
        }
    };

    if (!cart) return <div className="p-5">Loading Cart...</div>;

    return (
        <div className="p-5">
            <h2>My Shopping Cart</h2>
            
            {cart.items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    {cart.items.map(item => (
                        <div key={item.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                            <h4>{item.product.name}</h4>
                            <p>Price: Rs. {item.product.price}</p>
                            
                            <label>Quantity: </label>
                            <button onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}>-</button>
                            <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}>+</button>
                            
                            <p>Subtotal: Rs. {item.price}</p>
                            <button 
                                onClick={() => handleRemoveItem(item.product.id)}
                                style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px' }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    
                    <h3 style={{ marginTop: '20px' }}>Total Price: Rs. {cart.totalPrice}</h3>
                    <button style={{ backgroundColor: 'green', color: 'white', padding: '10px', marginTop: '10px' }}>
                        Proceed to Checkout
                    </button>
                </div>
            )}
        </div>
    );
}

export default Cart;