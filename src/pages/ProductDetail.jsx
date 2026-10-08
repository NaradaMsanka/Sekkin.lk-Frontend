import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductDetail() {
    const { id } = useParams(); // URL එකෙන් Product ID එක ගන්නවා
    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8080/api/products/${id}`)
            .then((res) => res.json())
            .then((data) => setProduct(data));
    }, [id]);

    if (!product) return <h2>Loading...</h2>;

    return (
        <div style={{ padding: "50px", textAlign: "center" }}>
            <h1>{product.name}</h1>
            <h3 style={{ color: "green" }}>Rs. {product.price}</h3>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Skin Type:</strong> {product.skinType}</p>
            <p><strong>Stock Available:</strong> {product.stockQuantity}</p>
            <p>{product.description}</p>
            <button style={{ padding: "10px 20px", background: "black", color: "white" }}>Add to Cart</button>
        </div>
    );
}