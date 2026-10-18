import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data States
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockProducts: [],
    recentOrders: [],
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    price: "",
    stockQuantity: "",
    skinType: "",
    description: "",
  });

  // Token එක localStorage එකෙන් ලබා ගැනීම
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = getAuthHeaders();

      // 1. Dashboard Summary ලබා ගැනීම
      const statsRes = await axios.get(`${API_BASE_URL}/admin/dashboard`, headers);
      setDashboardStats(statsRes.data);

      // 2. සියලුම භාණ්ඩ (Products) ලබා ගැනීම
      const productsRes = await axios.get(`${API_BASE_URL}/products`);
      setProducts(productsRes.data);

      // 3. ඇණවුම් (Orders) ලබා ගැනීම (සියලුම orders endpoint එකක් නැතිනම් recentOrders භාවිතා කරයි)
      try {
        const ordersRes = await axios.get(`${API_BASE_URL}/orders`, headers);
        setOrders(ordersRes.data);
      } catch {
        setOrders(statsRes.data.recentOrders || []);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      setError("දත්ත ලබා ගැනීමට නොහැකි විය. ඔබ Admin ගිණුමකින් Login වී ඇත්දැයි පරීක්ෂා කරන්න.");
    } finally {
      setLoading(false);
    }
  };

  // අලුත් භාණ්ඩයක් එකතු කිරීම
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockQuantity: parseInt(newProduct.stockQuantity, 10),
        status: "ACTIVE",
      };
      await axios.post(`${API_BASE_URL}/products`, payload, getAuthHeaders());
      alert("භාණ්ඩය සාර්ථකව එකතු කරන ලදී!");
      setNewProduct({ name: "", brand: "", price: "", stockQuantity: "", skinType: "", description: "" });
      fetchAllAdminData();
    } catch (err) {
      alert("භාණ්ඩය එකතු කිරීමට නොහැකි විය.");
    }
  };

  // භාණ්ඩයක් මකා දැමීම (Delete Product)
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("මෙම භාණ්ඩය ඉවත් කිරීමට ඔබට විශ්වාසද?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/products/${id}`, getAuthHeaders());
      setProducts(products.filter((p) => p.id !== id));
      fetchAllAdminData();
    } catch (err) {
      alert("භාණ්ඩය ඉවත් කිරීමට නොහැකි විය.");
    }
  };

  // Order Status එක වෙනස් කිරීම
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/orders/${orderId}/status`,
        { status: newStatus },
        getAuthHeaders()
      );
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      fetchAllAdminData();
    } catch (err) {
      alert("Order status යාවත්කාලීන කිරීමට නොහැකි විය.");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Admin Dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Admin Dashboard</h2>
        <div style={styles.tabGroup}>
          <button
            style={activeTab === "overview" ? styles.activeTabBtn : styles.tabBtn}
            onClick={() => setActiveTab("overview")}
          >
            Overview & Stats
          </button>
          <button
            style={activeTab === "products" ? styles.activeTabBtn : styles.tabBtn}
            onClick={() => setActiveTab("products")}
          >
            Product Management
          </button>
          <button
            style={activeTab === "orders" ? styles.activeTabBtn : styles.tabBtn}
            onClick={() => setActiveTab("orders")}
          >
            Order Management
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* TAB 1: OVERVIEW & BASIC SALES STATS */}
      {activeTab === "overview" && (
        <div>
          {/* Sales Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h4>Total Revenue</h4>
              <p style={styles.statValue}>Rs. {dashboardStats.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div style={styles.statCard}>
              <h4>Total Orders</h4>
              <p style={styles.statValue}>{dashboardStats.totalOrders}</p>
            </div>
            <div style={styles.statCard}>
              <h4>Total Products</h4>
              <p style={styles.statValue}>{dashboardStats.totalProducts}</p>
            </div>
            <div style={styles.statCard}>
              <h4>Total Customers</h4>
              <p style={styles.statValue}>{dashboardStats.totalUsers}</p>
            </div>
          </div>

          <div style={styles.twoColGrid}>
            {/* Low Stock Alerts */}
            <div style={styles.card}>
              <h3>⚠️ Low-Stock Alerts (≤ 10 items)</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Brand</th>
                    <th style={styles.th}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardStats.lowStockProducts?.length > 0 ? (
                    dashboardStats.lowStockProducts.map((item) => (
                      <tr key={item.id}>
                        <td style={styles.td}>#{item.id}</td>
                        <td style={styles.td}>{item.name}</td>
                        <td style={styles.td}>{item.brand}</td>
                        <td style={{ ...styles.td, color: "#d9534f", fontWeight: "bold" }}>
                          {item.stockQuantity}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={styles.td}>සියලුම භාණ්ඩ ප්‍රමාණවත් තොග ඇත.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Recent Orders */}
            <div style={styles.card}>
              <h3>🕒 Recent Orders</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardStats.recentOrders?.length > 0 ? (
                    dashboardStats.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={styles.td}>#{order.id}</td>
                        <td style={styles.td}>{order.customerEmail}</td>
                        <td style={styles.td}>Rs. {order.totalAmount}</td>
                        <td style={styles.td}>
                          <span style={styles.badge}>{order.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={styles.td}>ඇණවුම් කිසිවක් නොමැත.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT TABLE */}
      {activeTab === "products" && (
        <div>
          <div style={styles.card}>
            <h3>Add New Product</h3>
            <form onSubmit={handleAddProduct} style={styles.formGrid}>
              <input
                style={styles.input}
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Brand"
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                required
              />
              <input
                style={styles.input}
                type="number"
                placeholder="Price (Rs.)"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
              <input
                style={styles.input}
                type="number"
                placeholder="Stock Quantity"
                value={newProduct.stockQuantity}
                onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                required
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Skin Type (e.g. Oily, All)"
                value={newProduct.skinType}
                onChange={(e) => setNewProduct({ ...newProduct, skinType: e.target.value })}
              />
              <button type="submit" style={styles.primaryBtn}>+ Add Product</button>
            </form>
          </div>

          <div style={{ ...styles.card, marginTop: "20px" }}>
            <h3>Product Management Table</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Brand</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Skin Type</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td style={styles.td}>#{product.id}</td>
                    <td style={styles.td}>{product.name}</td>
                    <td style={styles.td}>{product.brand}</td>
                    <td style={styles.td}>Rs. {product.price}</td>
                    <td style={styles.td}>{product.stockQuantity}</td>
                    <td style={styles.td}>{product.skinType || "All"}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER MANAGEMENT */}
      {activeTab === "orders" && (
        <div style={styles.card}>
          <h3>Order Management</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Total Amount</th>
                <th style={styles.th}>Current Status</th>
                <th style={styles.th}>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={styles.td}>#{order.id}</td>
                  <td style={styles.td}>{order.customerEmail || order.user?.email || "Customer"}</td>
                  <td style={styles.td}>Rs. {order.totalAmount}</td>
                  <td style={styles.td}>
                    <span style={styles.badge}>{order.status}</span>
                  </td>
                  <td style={styles.td}>
                    <select
                      style={styles.select}
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Simple Inline Styles (Tailwind නොමැති වුවත් පිරිසිදුව පෙනීම සඳහා)
const styles = {
  container: { maxWidth: "1200px", margin: "0 auto", padding: "24px", fontFamily: "sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" },
  tabGroup: { display: "flex", gap: "10px" },
  tabBtn: { padding: "10px 16px", border: "1px solid #ddd", background: "#f8f9fa", borderRadius: "6px", cursor: "pointer" },
  activeTabBtn: { padding: "10px 16px", border: "none", background: "#d63384", color: "#fff", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
  errorBox: { background: "#ffe3e3", color: "#c92a2a", padding: "12px", borderRadius: "6px", marginBottom: "16px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderLeft: "4px solid #d63384" },
  statValue: { fontSize: "24px", fontWeight: "bold", margin: "8px 0 0 0", color: "#333" },
  twoColGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "20px" },
  card: { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "12px" },
  th: { textAlign: "left", padding: "12px", borderBottom: "2px solid #eee", color: "#555" },
  td: { padding: "12px", borderBottom: "1px solid #eee" },
  badge: { padding: "4px 8px", borderRadius: "4px", background: "#f1f3f5", fontSize: "12px", fontWeight: "bold" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginTop: "12px" },
  input: { padding: "10px", border: "1px solid #ccc", borderRadius: "6px" },
  primaryBtn: { background: "#d63384", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" },
  deleteBtn: { background: "#e03131", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" },
  select: { padding: "6px", borderRadius: "4px", border: "1px solid #ccc" },
};

export default AdminDashboard;