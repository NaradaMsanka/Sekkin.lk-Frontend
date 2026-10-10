import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addToCart } from "../services/cartService"; // 1. Cart Service එක Import කිරීම

export default function ProductDetail() {
    const { id } = useParams(); 
    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8080/api/products/${id}`)
            .then((res) => res.json())
            .then((data) => setProduct(data));
    }, [id]);

    // 2. Add to Cart බොත්තම එබූ විට ක්‍රියාත්මක වන Function එක
    const handleAddToCart = async () => {
        try {
            await addToCart(id, 1); // භාණ්ඩයේ ID එක සහ ප්‍රමාණය (1) යවයි
            alert("Product added to cart successfully!");
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Failed to add product. Please login first.");
        }
    };

    if (!product) return <h2>Loading...</h2>;

    return (
        <div style={{ padding: "50px", textAlign: "center" }}>
            <h1>{product.name}</h1>
            <h3 style={{ color: "green" }}>Rs. {product.price}</h3>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Skin Type:</strong> {product.skinType}</p>
            <p><strong>Stock Available:</strong> {product.stockQuantity}</p>
            <p>{product.description}</p>
            
            {/* 3. onClick එක හරහා Function එක Button එකට සම්බන්ධ කිරීම */}
            <button 
                onClick={handleAddToCart} 
                style={{ padding: "10px 20px", background: "black", color: "white", cursor: "pointer" }}
            >
                Add to Cart
            </button>
        </div>
    );
}