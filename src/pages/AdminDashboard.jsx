import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Close, Save } from "@mui/icons-material";
import { API } from "../services/api";
import { formatDeliveryCharge } from "../content/delivery";
import AdminWorkspace from "../components/admin/AdminWorkspace";
import { ProductFormFields } from "../components/admin/AdminUi";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [addingOpen, setAddingOpen] = useState(false);
  const [stockSaving, setStockSaving] = useState(null);
  const stockPending = useRef(false);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // Stats & Data
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockProducts: [],
    recentOrders: [],
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderAction, setOrderAction] = useState(null);
  const [actionReference, setActionReference] = useState("");
  const [collectionAmount, setCollectionAmount] = useState("");
  const [actionAttested, setActionAttested] = useState(false);
  const [actionSaving, setActionSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const actionPending = useRef(false);

  // Add Product State
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    price: "",
    discountPrice: "",
    stockQuantity: "",
    skinType: "",
    description: "",
    ingredients: "",
    status: "ACTIVE",
    imageUrl: "",
    images: [],
  });

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    brand: "",
    price: "",
    discountPrice: "",
    stockQuantity: "",
    skinType: "",
    description: "",
    ingredients: "",
    status: "ACTIVE",
    imageUrl: "",
    images: [],
  });

  const fetchAll = async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const headers = getAuthHeaders();
      const [statsRes, prodsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, headers),
        axios.get(`${API}/products`),
        axios.get(`${API}/admin/orders`, headers),
      ]);
      if (
        !statsRes.data ||
        !Array.isArray(prodsRes.data) ||
        !Array.isArray(ordersRes.data)
      ) {
        throw new Error("Invalid admin data response");
      }
      setStats(statsRes.data);
      setProducts(prodsRes.data);
      setOrders(ordersRes.data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(
        [401, 403].includes(e.response?.status)
          ? "Access denied. You need an active ADMIN account to access this panel."
          : "We couldn't load your store data. Check your connection and try again.",
      );
    } finally {
      if (showSkeleton) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) fetchAll(true);
    });
    return () => {
      active = false;
    };
  }, []);

  // 1. ADD NEW PRODUCT
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddingProduct(true);
    try {
      const primaryImg = newProduct.images?.[0] || newProduct.imageUrl || "";
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockQuantity: parseInt(newProduct.stockQuantity, 10),
        discountPrice: newProduct.discountPrice
          ? parseFloat(newProduct.discountPrice)
          : null,
        status: newProduct.status || "ACTIVE",
        imageUrl: primaryImg,
        images: JSON.stringify(
          newProduct.images || (primaryImg ? [primaryImg] : []),
        ),
      };

      const res = await axios.post(
        `${API}/products`,
        payload,
        getAuthHeaders(),
      );
      setAddingOpen(false);

      setSnack({
        open: true,
        msg: `Product "${newProduct.name}" added successfully.`,
        severity: "success",
      });
      setNewProduct({
        name: "",
        brand: "",
        price: "",
        discountPrice: "",
        stockQuantity: "",
        skinType: "",
        description: "",
        ingredients: "",
        status: "ACTIVE",
        imageUrl: "",
        images: [],
      });

      if (res.data) {
        setProducts((prev) => [res.data, ...prev]);
      }
      fetchAll(false);
    } catch (e) {
      setSnack({
        open: true,
        msg:
          e.response?.data?.message ||
          e.response?.data ||
          "Failed to add product.",
        severity: "error",
      });
    } finally {
      setAddingProduct(false);
    }
  };

  // 2. OPEN EDIT MODAL
  const handleOpenEdit = (product) => {
    let parsedImages = [];
    if (product.images) {
      try {
        parsedImages =
          typeof product.images === "string"
            ? JSON.parse(product.images)
            : product.images;
      } catch {
        parsedImages = product.images.split(",").filter(Boolean);
      }
    } else if (product.imageUrl) {
      parsedImages = [product.imageUrl];
    }

    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      brand: product.brand || "",
      price: product.price || "",
      discountPrice: product.discountPrice || "",
      stockQuantity: product.stockQuantity ?? "",
      skinType: product.skinType || "",
      description: product.description || "",
      ingredients: product.ingredients || "",
      status: product.status || "ACTIVE",
      imageUrl: product.imageUrl || parsedImages[0] || "",
      images: parsedImages,
    });
  };

  // 3. SAVE PRODUCT DETAILS UPDATE
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingEdit(true);
    try {
      const primaryImg = editForm.images?.[0] || editForm.imageUrl || "";
      const payload = {
        name: editForm.name,
        brand: editForm.brand,
        price: parseFloat(editForm.price),
        discountPrice: editForm.discountPrice
          ? parseFloat(editForm.discountPrice)
          : null,
        stockQuantity: parseInt(editForm.stockQuantity, 10),
        skinType: editForm.skinType,
        description: editForm.description,
        ingredients: editForm.ingredients,
        status: editForm.status,
        imageUrl: primaryImg,
        images: JSON.stringify(
          editForm.images || (primaryImg ? [primaryImg] : []),
        ),
      };

      const res = await axios.put(
        `${API}/products/${editingProduct.id}`,
        payload,
        getAuthHeaders(),
      );

      // Optimistic update: show new product values and image immediately without freezing UI
      const updatedProduct = res.data || {
        ...editingProduct,
        ...payload,
        id: editingProduct.id,
      };
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p)),
      );

      setSnack({
        open: true,
        msg: `Product #${editingProduct.id} updated successfully.`,
        severity: "success",
      });
      setEditingProduct(null);
      fetchAll(false);
    } catch (err) {
      setSnack({
        open: true,
        msg: err.response?.data?.message || "Failed to update product details.",
        severity: "error",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  // 4. QUICK STOCK ADJUSTMENT (+10 / -5 / custom)
  const handleQuickStockAdjust = async (product, change) => {
    if (stockPending.current) return;
    stockPending.current = true;
    setStockSaving(product.id);
    const newQty = Math.max(0, Number(product.stockQuantity || 0) + change);
    try {
      await axios.put(
        `${API}/products/${product.id}`,
        {
          name: product.name,
          brand: product.brand,
          price: parseFloat(product.price),
          discountPrice: product.discountPrice
            ? parseFloat(product.discountPrice)
            : null,
          stockQuantity: newQty,
          skinType: product.skinType,
          description: product.description,
          ingredients: product.ingredients,
          status: product.status || "ACTIVE",
          imageUrl: product.imageUrl,
          images: product.images,
        },
        getAuthHeaders(),
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, stockQuantity: newQty } : p,
        ),
      );
      setSnack({
        open: true,
        msg: `Stock updated for ${product.name}: ${newQty} units`,
        severity: "success",
      });
    } catch {
      setSnack({
        open: true,
        msg: "Quick stock update failed.",
        severity: "error",
      });
    } finally {
      stockPending.current = false;
      setStockSaving(null);
    }
  };

  // 5. DELETE PRODUCT
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await axios.delete(`${API}/products/${id}`, getAuthHeaders());
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSnack({
        open: true,
        msg: `Product "${name}" deleted.`,
        severity: "info",
      });
      fetchAll(false);
    } catch {
      setSnack({
        open: true,
        msg: "Delete failed. Check if product is in active orders.",
        severity: "error",
      });
    }
  };

  // 6. UPDATE ORDER STATUS
  const openOrderAction = (order, kind, status) => {
    setOrderAction({ order, kind, status });
    setActionReference("");
    setCollectionAmount(
      order.totalAmount != null ? Number(order.totalAmount).toFixed(2) : "",
    );
    setActionAttested(false);
    setActionError("");
  };

  const submitOrderAction = async (event) => {
    event.preventDefault();
    if (!orderAction || actionPending.current || !actionAttested) return;
    const { order, kind, status } = orderAction;
    if (kind !== "status" && !actionReference.trim()) return;
    if (
      kind === "collection" &&
      (!Number.isFinite(Number(collectionAmount)) ||
        Number(collectionAmount) !== Number(order.totalAmount))
    ) {
      setActionError(
        "The verified collection amount must equal the stored order total.",
      );
      return;
    }
    actionPending.current = true;
    setActionSaving(true);
    setActionError("");
    try {
      if (kind === "acceptance")
        await axios.post(
          `${API}/admin/orders/${order.id}/accept`,
          { reference: actionReference.trim() },
          getAuthHeaders(),
        );
      else if (kind === "collection")
        await axios.post(
          `${API}/admin/orders/${order.id}/cod-collection`,
          {
            amount: Number(collectionAmount),
            reference: actionReference.trim(),
          },
          getAuthHeaders(),
        );
      else
        await axios.patch(
          `${API}/orders/${order.id}/status`,
          { status },
          getAuthHeaders(),
        );
      setOrderAction(null);
      setSnack({
        open: true,
        msg: `Order #${order.id} updated. Refreshing the saved record.`,
        severity: "success",
      });
      await fetchAll(false);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data;
      setActionError(
        typeof message === "string"
          ? message
          : "The result could not be confirmed. Refresh the saved order before retrying; no payment is assumed collected.",
      );
    } finally {
      actionPending.current = false;
      setActionSaving(false);
    }
  };

  return (
    <AdminWorkspace
      stats={stats}
      products={products}
      orders={orders}
      loading={loading}
      refreshing={refreshing}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={() => fetchAll(false)}
      onAddProduct={() => setAddingOpen(true)}
      onEditProduct={handleOpenEdit}
      onDeleteProduct={handleDelete}
      onRestock={handleQuickStockAdjust}
      stockSaving={stockSaving}
      onOrderAction={openOrderAction}
      actionSaving={actionSaving}
    >
      <Dialog
        open={addingOpen}
        onClose={addingProduct ? undefined : () => setAddingOpen(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="add-product-title"
      >
        <Box
          component="form"
          onSubmit={handleAddProduct}
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            maxHeight: "inherit",
          }}
        >
          <DialogTitle
            id="add-product-title"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Add product
            <IconButton
              aria-label="Close add product"
              onClick={() => setAddingOpen(false)}
              disabled={addingProduct}
            >
              <Close fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add the product details, pricing, and images for your store.
            </Typography>
            <ProductFormFields
              value={newProduct}
              onChange={setNewProduct}
              disabled={addingProduct}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => setAddingOpen(false)}
              disabled={addingProduct}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addingProduct}
              startIcon={
                addingProduct ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Add />
                )
              }
            >
              {addingProduct ? "Adding…" : "Add product"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(editingProduct)}
        onClose={savingEdit ? undefined : () => setEditingProduct(null)}
        maxWidth="md"
        fullWidth
        aria-labelledby="edit-product-title"
      >
        <Box
          component="form"
          onSubmit={handleSaveEdit}
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            maxHeight: "inherit",
          }}
        >
          <DialogTitle
            id="edit-product-title"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Edit product #{editingProduct?.id}
            <IconButton
              aria-label="Close edit product"
              onClick={() => setEditingProduct(null)}
              disabled={savingEdit}
            >
              <Close fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <ProductFormFields
              value={editForm}
              onChange={setEditForm}
              disabled={savingEdit}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => setEditingProduct(null)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingEdit}
              startIcon={
                savingEdit ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Save />
                )
              }
            >
              {savingEdit ? "Saving…" : "Save changes"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(orderAction)}
        onClose={actionSaving ? undefined : () => setOrderAction(null)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="order-action-title"
      >
        <Box
          component="form"
          onSubmit={submitOrderAction}
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            maxHeight: "inherit",
          }}
        >
          <DialogTitle id="order-action-title">
            {orderAction?.kind === "acceptance"
              ? "Confirm order acceptance"
              : orderAction?.kind === "collection"
                ? "Record verified COD collection"
                : "Confirm fulfilment update"}{" "}
            #{orderAction?.order.id}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Alert severity="info">
                Stored total: Rs.{" "}
                {Number(orderAction?.order.totalAmount || 0).toFixed(2)}.
                Delivery:{" "}
                {formatDeliveryCharge(orderAction?.order.deliveryCharge)}. A
                delivery update does not record payment.
              </Alert>
              {orderAction?.kind === "acceptance" && (
                <Typography variant="body2">
                  Verify the customer details and reserved stock, communicate
                  acceptance to the customer, then record a nonsecret
                  confirmation reference.
                </Typography>
              )}
              {orderAction?.kind === "collection" && (
                <>
                  <Typography variant="body2">
                    Record COD collection only after verifying the actual
                    courier settlement report and the exact stored order total.
                    A delivered status or failed collection is insufficient.
                  </Typography>
                  <TextField
                    label="Verified collected amount (LKR)"
                    required
                    type="number"
                    value={collectionAmount}
                    onChange={(event) =>
                      setCollectionAmount(event.target.value)
                    }
                    disabled={actionSaving}
                    slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                  />
                </>
              )}
              {orderAction?.kind !== "status" && (
                <TextField
                  label={
                    orderAction?.kind === "acceptance"
                      ? "Acceptance confirmation reference"
                      : "Collection evidence reference"
                  }
                  required
                  slotProps={{ htmlInput: { maxLength: 120 } }}
                  value={actionReference}
                  onChange={(event) => setActionReference(event.target.value)}
                  disabled={actionSaving}
                  helperText="Use a nonsecret operational reference. Do not enter card, banking, identity or customer secrets."
                />
              )}
              {orderAction?.kind === "status" && (
                <Typography variant="body2">
                  Change {orderAction.order.status} to {orderAction.status}.{" "}
                  {orderAction.status === "CANCELLED"
                    ? "Cancellation is available only before dispatch; reserved inventory is released by the server."
                    : "Confirm the actual fulfilment event before recording it."}
                </Typography>
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={actionAttested}
                    onChange={(event) =>
                      setActionAttested(event.target.checked)
                    }
                    disabled={actionSaving}
                  />
                }
                label={
                  <Typography variant="body2">
                    {orderAction?.kind === "acceptance"
                      ? "I verified the details and stock and communicated acceptance to the customer."
                      : orderAction?.kind === "collection"
                        ? "I verified the actual courier settlement report, exact stored total and evidence reference."
                        : "I verified this fulfilment event and understand it does not collect payment."}
                  </Typography>
                }
              />
              {actionError && <Alert severity="error">{actionError}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => setOrderAction(null)}
              disabled={actionSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                actionSaving ||
                !actionAttested ||
                (orderAction?.kind !== "status" && !actionReference.trim())
              }
            >
              {actionSaving ? "Saving…" : "Save verified action"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((previous) => ({ ...previous, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((previous) => ({ ...previous, open: false }))}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </AdminWorkspace>
  );
}
