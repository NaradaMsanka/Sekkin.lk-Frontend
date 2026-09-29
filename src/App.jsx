import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [products, setProducts] = useState([])

  // පිටුව Load වෙද්දි Backend එකෙන් Data ගේනවා
  useEffect(() => {
    axios.get('http://localhost:8080/api/products')
      .then(response => {
        setProducts(response.data)
      })
      .catch(error => {
        console.error("There was an error fetching the products!", error)
      })
  }, [])

  return (
    <div className="container">
      <h1>Sekkin.lk - Product Catalog</h1>
      
      <div className="product-grid">
        {products.length === 0 ? (
          <p>No products found. Please add products from Backend.</p>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card">
              <h2>{product.name}</h2>
              <p className="price">Rs. {product.price}</p>
              <p>Skin Type: {product.skinType}</p>
              <p>In Stock: {product.stockQuantity}</p>
              {/* Product එකේ Category එකක් තියෙනවා නම් ඒකත් පෙන්නමු */}
              {product.category && <p className="category">Category: {product.category.name}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App