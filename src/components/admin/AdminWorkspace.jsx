import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  Inventory2Outlined,
  PaymentsOutlined,
  ReceiptLongOutlined,
  Refresh,
  ShoppingBagOutlined,
} from "@mui/icons-material";
import AdminLayout from "./AdminLayout";
import AdminPromotions from './AdminPromotions';
import {
  EmptyState,
  Pagination,
  ProductIdentity,
  SearchField,
  StatusChip,
  StockChip,
} from "./AdminUi";
import { formatCount, formatDate, formatMoney } from "./adminFormat";
import { formatDeliveryCharge } from "../../content/delivery";
import {
  allowedOrderTransitions,
  canRecordCodCollection,
} from "../../services/orderRequest";

const pageDetails = [
  ["Dashboard overview", "A clear view of your store, orders, and inventory."],
  ["Products", "Manage your catalog, pricing, and product details."],
  ["Inventory", "Keep track of stock levels and restock with confidence."],
  ["Orders", "Review customer requests, fulfilment, and verified collections."],
  ["Promo codes", "Manage percentage offers for selected products."],
];
const orderStatuses = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const readableStatus = (status) =>
  status.charAt(0) + status.slice(1).toLowerCase();
const paymentLabel = (order) => {
  if (order.paymentStatus === "PAID") return "Payment collected";
  if (order.status === "CANCELLED" && order.paymentStatus === "PENDING_COD")
    return "COD not collected";
  if (order.paymentStatus === "PENDING_COD") return "COD awaiting collection";
  return order.paymentStatus || "Payment unrecorded";
};

function SectionHeading({ title, description, action }) {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        p: { xs: 2, sm: 2.5 },
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box>
        <Typography component="h2" variant="h2">
          {title}
        </Typography>
        {description && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}

function TableHeader({ columns }) {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.label || column}
            align={column.align || "left"}
          >
            {column.label || column}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function LoadingState() {
  return (
    <Box role="status" aria-label="Loading dashboard data">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            xl: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {[0, 1, 2, 3].map((value) => (
          <Skeleton key={value} variant="rounded" height={148} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={390} />
    </Box>
  );
}

export default function AdminWorkspace({
  stats,
  products,
  orders,
  loading,
  refreshing,
  error,
  lastUpdated,
  onRefresh,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onRestock,
  stockSaving,
  onOrderAction,
  actionSaving,
  children,
}) {
  const [tab, setTab] = useState(0);
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [pages, setPages] = useState({ products: 0, inventory: 0, orders: 0 });
  const [pageSizes, setPageSizes] = useState({
    products: 10,
    inventory: 10,
    orders: 10,
  });

  const stockQuantity = (product) => Number(product.stockQuantity || 0);
  const lowStock = products.filter(
    (product) => stockQuantity(product) > 0 && stockQuantity(product) <= 10,
  );
  const outOfStock = products.filter((product) => stockQuantity(product) <= 0);
  const healthyStock = products.filter(
    (product) => stockQuantity(product) > 10,
  );
  const needsAttention = [...outOfStock, ...lowStock];
  const totalUnits = products.reduce(
    (sum, product) => sum + stockQuantity(product),
    0,
  );
  const inventoryValue = products.reduce(
    (sum, product) => sum + Number(product.price || 0) * stockQuantity(product),
    0,
  );
  const orderCount = (status) =>
    orders.filter((order) => order.status === status).length;
  const pendingCount = orderCount("PENDING") + orderCount("PROCESSING");
  const sortedOrders = [...orders].sort(
    (a, b) =>
      (new Date(b.orderDate).getTime() || Number(b.id)) -
      (new Date(a.orderDate).getTime() || Number(a.id)),
  );
  const matchesProduct = (product, query) =>
    [product.name, product.brand, product.skinType, product.id].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  const visibleProducts = products.filter((product) =>
    matchesProduct(product, productSearch),
  );
  const visibleStock = products.filter(
    (product) =>
      matchesProduct(product, stockSearch) &&
      (stockFilter === "ALL" ||
        (stockFilter === "HEALTHY" && stockQuantity(product) > 10) ||
        (stockFilter === "LOW" &&
          stockQuantity(product) > 0 &&
          stockQuantity(product) <= 10) ||
        (stockFilter === "OUT" && stockQuantity(product) <= 0) ||
        (stockFilter === "ATTENTION" && stockQuantity(product) <= 10)),
  );
  const visibleOrders = sortedOrders.filter(
    (order) =>
      (orderFilter === "ALL" || order.status === orderFilter) &&
      [
        order.id,
        order.customerName,
        order.customerEmail,
        order.user?.email,
        order.customerPhone,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(orderSearch.trim().toLowerCase()),
      ),
  );

  const resetPage = (key) =>
    setPages((previous) => ({ ...previous, [key]: 0 }));
  const pageFor = (key, count) =>
    Math.min(pages[key], Math.max(0, Math.ceil(count / pageSizes[key]) - 1));
  const pageRows = (key, rows) =>
    rows.slice(
      pageFor(key, rows.length) * pageSizes[key],
      (pageFor(key, rows.length) + 1) * pageSizes[key],
    );
  const pagination = (key, count) => (
    <Pagination
      count={count}
      page={pageFor(key, count)}
      rowsPerPage={pageSizes[key]}
      onPageChange={(page) =>
        setPages((previous) => ({ ...previous, [key]: page }))
      }
      onRowsPerPageChange={(size) => {
        setPageSizes((previous) => ({ ...previous, [key]: size }));
        resetPage(key);
      }}
    />
  );
  const viewOrders = (status = "ALL", search = "") => {
    setOrderFilter(status);
    setOrderSearch(search);
    resetPage("orders");
    setTab(3);
  };
  const viewInventory = (filter = "ALL") => {
    setStockFilter(filter);
    setStockSearch("");
    resetPage("inventory");
    setTab(2);
  };
  const ready = !loading && Boolean(lastUpdated);
  const metrics = [
    {
      label: "Verified COD collections",
      value: formatMoney(stats.totalRevenue),
      helper: "Confirmed courier settlements",
      icon: PaymentsOutlined,
      color: "#8F344D",
      bg: "#F8EEF1",
    },
    {
      label: "Total orders",
      value: formatCount(stats.totalOrders ?? orders.length),
      helper: `${formatCount(pendingCount)} pending or processing`,
      icon: ReceiptLongOutlined,
      color: "#3266A8",
      bg: "#EEF3FB",
    },
    {
      label: "Catalog products",
      value: formatCount(products.length),
      helper: "Products in your catalog",
      icon: Inventory2Outlined,
      color: "#6550A4",
      bg: "#F2EFF9",
    },
    {
      label: "Stock units",
      value: formatCount(totalUnits),
      helper: `${formatCount(needsAttention.length)} products need attention`,
      icon: ShoppingBagOutlined,
      color: "#28734F",
      bg: "#EDF6F0",
    },
  ];

  return (
    <AdminLayout
      tab={tab}
      onTabChange={setTab}
      counts={[0, products.length, needsAttention.length, orders.length, 0]}
      title={pageDetails[tab][0]}
      description={pageDetails[tab][1]}
      actions={
        <>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Refresh />}
            onClick={onRefresh}
            disabled={loading || refreshing}
            sx={{ borderColor: "#DADEE5", bgcolor: "background.paper" }}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
          {(tab === 0 || tab === 1) && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddProduct}
              disabled={!ready}
            >
              Add product
            </Button>
          )}
        </>
      }
    >
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={onRefresh}
              disabled={refreshing}
            >
              Retry
            </Button>
          }
        >
          {error}
          {lastUpdated && " Previously loaded data is shown below."}
        </Alert>
      )}
      {loading && <LoadingState />}
      {ready && (
        <>
          {tab === 0 && (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                {metrics.map(
                  ({ label, value, helper, icon: Icon, color, bg }) => (
                    <Card key={label} sx={{ p: 2.5 }}>
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {label}
                        </Typography>
                        <Box
                          sx={{
                            display: "grid",
                            placeItems: "center",
                            width: 34,
                            height: 34,
                            flexShrink: 0,
                            borderRadius: 1,
                            bgcolor: bg,
                            color,
                          }}
                        >
                          <Icon sx={{ fontSize: 19 }} />
                        </Box>
                      </Stack>
                      <Typography
                        sx={{
                          fontSize: { xs: "1.6rem", lg: "1.75rem" },
                          fontWeight: 600,
                          letterSpacing: "-0.7px",
                          fontVariantNumeric: "tabular-nums",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {value}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          mt: 0.75,
                        }}
                      >
                        {helper}
                      </Typography>
                    </Card>
                  ),
                )}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    lg: "minmax(0, 1.65fr) minmax(0, 1fr)",
                  },
                  gap: 3,
                  alignItems: "start",
                }}
              >
                <Stack spacing={3} sx={{ minWidth: 0 }}>
                  <Card>
                    <SectionHeading
                      title="Recent orders"
                      description="The latest customer activity in your store"
                      action={
                        <Button size="small" onClick={() => viewOrders()}>
                          View orders
                        </Button>
                      }
                    />
                    {orders.length > 0 ? (
                      <>
                        <Stack sx={{ display: { xs: "flex", sm: "none" } }}>
                          {sortedOrders.slice(0, 5).map((order) => (
                            <Box
                              key={order.id}
                              sx={{
                                px: 2,
                                py: 2,
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                "&:last-child": { borderBottom: 0 },
                              }}
                            >
                              <Stack
                                direction="row"
                                sx={{
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 1,
                                }}
                              >
                                <Button
                                  size="small"
                                  onClick={() =>
                                    viewOrders("ALL", String(order.id))
                                  }
                                  sx={{
                                    p: 0,
                                    minWidth: 0,
                                    minHeight: 30,
                                    fontWeight: 600,
                                  }}
                                >
                                  #{order.id}
                                </Button>
                                <StatusChip status={order.status} />
                              </Stack>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ color: "text.secondary", my: 0.5 }}
                              >
                                {order.customerName ||
                                  order.customerEmail ||
                                  order.user?.email ||
                                  "Customer"}
                              </Typography>
                              <Stack
                                direction="row"
                                sx={{
                                  alignItems: "baseline",
                                  justifyContent: "space-between",
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary" }}
                                >
                                  {formatDate(order.orderDate)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {formatMoney(order.totalAmount)}
                                </Typography>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                        <TableContainer
                          sx={{ display: { xs: "none", sm: "block" } }}
                        >
                          <Table
                            aria-label="Recent customer orders"
                            sx={{ minWidth: 540 }}
                          >
                            <TableHeader
                              columns={[
                                "Order",
                                "Customer",
                                { label: "Total", align: "right" },
                                "Status",
                              ]}
                            />
                            <TableBody>
                              {sortedOrders.slice(0, 5).map((order) => (
                                <TableRow key={order.id} hover>
                                  <TableCell>
                                    <Button
                                      size="small"
                                      onClick={() =>
                                        viewOrders("ALL", String(order.id))
                                      }
                                      sx={{
                                        p: 0,
                                        minWidth: 0,
                                        minHeight: 30,
                                        fontWeight: 600,
                                      }}
                                    >
                                      #{order.id}
                                    </Button>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "block",
                                        color: "text.secondary",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {formatDate(order.orderDate)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ maxWidth: 200 }}>
                                    <Typography
                                      variant="body2"
                                      noWrap
                                      title={
                                        order.customerName ||
                                        order.customerEmail ||
                                        order.user?.email
                                      }
                                      sx={{ fontWeight: 500 }}
                                    >
                                      {order.customerName ||
                                        order.customerEmail ||
                                        order.user?.email ||
                                        "Customer"}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "text.secondary" }}
                                    >
                                      {order.paymentMethod === "COD"
                                        ? "Cash on delivery"
                                        : order.paymentMethod ||
                                          "Method unrecorded"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell
                                    align="right"
                                    sx={{
                                      whiteSpace: "nowrap",
                                      fontVariantNumeric: "tabular-nums",
                                    }}
                                  >
                                    {formatMoney(order.totalAmount)}
                                  </TableCell>
                                  <TableCell>
                                    <StatusChip status={order.status} />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    ) : (
                      <EmptyState
                        icon={ReceiptLongOutlined}
                        title="No orders yet"
                        description="New customer orders will appear here when they are placed."
                      />
                    )}
                  </Card>
                  <Card>
                    <SectionHeading
                      title="Order fulfilment"
                      description="Select a status to review its orders"
                    />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(2, minmax(0, 1fr))",
                          sm: "repeat(4, minmax(0, 1fr))",
                        },
                        gap: 1,
                        p: 2,
                      }}
                    >
                      {orderStatuses.slice(0, 4).map((status) => (
                        <Button
                          key={status}
                          color="inherit"
                          onClick={() => viewOrders(status)}
                          sx={{
                            display: "block",
                            textAlign: "left",
                            p: 1.5,
                            "&:hover": { bgcolor: "#F6F7F9" },
                          }}
                        >
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ color: "text.secondary", display: "block" }}
                          >
                            {readableStatus(status)}
                          </Typography>
                          <Typography
                            component="span"
                            sx={{
                              display: "block",
                              fontSize: "1.5rem",
                              fontWeight: 600,
                              mt: 0.75,
                            }}
                          >
                            {formatCount(orderCount(status))}
                          </Typography>
                        </Button>
                      ))}
                    </Box>
                  </Card>
                </Stack>

                <Card sx={{ minWidth: 0 }}>
                  <SectionHeading
                    title="Inventory health"
                    action={
                      <Button size="small" onClick={() => viewInventory()}>
                        View stock
                      </Button>
                    }
                  />
                  <Box sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: "baseline", gap: 1 }}
                    >
                      <Typography sx={{ fontSize: "1.75rem", fontWeight: 600 }}>
                        {formatCount(totalUnits)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        units in stock
                      </Typography>
                    </Stack>
                    <Box
                      aria-hidden="true"
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        height: 7,
                        overflow: "hidden",
                        borderRadius: 1,
                        bgcolor: "#EDF0F4",
                        mt: 2,
                        mb: 1.5,
                      }}
                    >
                      {[
                        { count: healthyStock.length, color: "#5C9975" },
                        { count: lowStock.length, color: "#D6A84E" },
                        { count: outOfStock.length, color: "#C86C79" },
                      ].map(
                        ({ count, color }) =>
                          count > 0 && (
                            <Box
                              key={color}
                              sx={{ flex: count, bgcolor: color }}
                            />
                          ),
                      )}
                    </Box>
                    <Stack spacing={0.25}>
                      {[
                        ["In stock", healthyStock.length, "HEALTHY", "#28734F"],
                        ["Low stock", lowStock.length, "LOW", "#946200"],
                        ["Out of stock", outOfStock.length, "OUT", "#BC3545"],
                      ].map(([label, count, filter, color]) => (
                        <Button
                          key={label}
                          color="inherit"
                          onClick={() => viewInventory(filter)}
                          sx={{
                            justifyContent: "space-between",
                            px: 0.75,
                            minHeight: 38,
                          }}
                        >
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            {label}
                          </Typography>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ fontWeight: 600, color }}
                          >
                            {formatCount(count)}
                          </Typography>
                        </Button>
                      ))}
                    </Stack>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 1,
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Inventory value at regular price
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatMoney(inventoryValue)}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      borderTop: "1px solid",
                      borderColor: "divider",
                      p: 2.5,
                    }}
                  >
                    <Typography
                      component="h3"
                      variant="body2"
                      sx={{ fontWeight: 600, mb: 1.5 }}
                    >
                      Needs attention
                    </Typography>
                    {needsAttention.length === 0 ? (
                      <Stack
                        direction="row"
                        sx={{ alignItems: "center", gap: 1, py: 1.5 }}
                      >
                        <CheckCircleOutlined color="success" fontSize="small" />
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {products.length
                            ? "All products have healthy stock."
                            : "Add products to start tracking stock."}
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={2}>
                        {needsAttention.slice(0, 3).map((product) => (
                          <Box key={product.id}>
                            <ProductIdentity product={product} compact />
                            <Stack
                              direction="row"
                              sx={{
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1,
                                mt: 1,
                                pl: 6.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    stockQuantity(product) <= 0
                                      ? "error.main"
                                      : "warning.main",
                                }}
                              >
                                {stockQuantity(product) <= 0
                                  ? "Out of stock"
                                  : `${stockQuantity(product)} units left`}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onRestock(product, 10)}
                                disabled={stockSaving !== null}
                                aria-label={`Add 10 units to ${product.name}`}
                                sx={{ minHeight: 32, fontSize: "0.8125rem" }}
                              >
                                {stockSaving === product.id
                                  ? "Saving…"
                                  : "+10 units"}
                              </Button>
                            </Stack>
                          </Box>
                        ))}
                        {needsAttention.length > 3 && (
                          <Button
                            size="small"
                            onClick={() => viewInventory("ATTENTION")}
                          >
                            View all {needsAttention.length} products
                          </Button>
                        )}
                      </Stack>
                    )}
                  </Box>
                </Card>
              </Box>
            </>
          )}

          {tab === 1 && (
            <Card>
              <SectionHeading
                title="Product catalog"
                description={`${formatCount(products.length)} products in your store`}
              />
              <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{
                  alignItems: { xs: "stretch", sm: "center" },
                  justifyContent: "space-between",
                  gap: 2,
                  p: 2.5,
                }}
              >
                <SearchField
                  label="Search products"
                  value={productSearch}
                  onChange={(value) => {
                    setProductSearch(value);
                    resetPage("products");
                  }}
                />
                <Typography
                  variant="caption"
                  role="status"
                  sx={{ color: "text.secondary" }}
                >
                  {formatCount(visibleProducts.length)}{" "}
                  {visibleProducts.length === 1 ? "product" : "products"}
                </Typography>
              </Stack>
              {visibleProducts.length ? (
                <TableContainer>
                  <Table aria-label="Product catalog" sx={{ minWidth: 820 }}>
                    <TableHeader
                      columns={[
                        "Product",
                        { label: "Regular price", align: "right" },
                        { label: "Sale price", align: "right" },
                        "Stock",
                        "Skin type",
                        { label: "Actions", align: "right" },
                      ]}
                    />
                    <TableBody>
                      {pageRows("products", visibleProducts).map((product) => (
                        <TableRow key={product.id} hover>
                          <TableCell sx={{ minWidth: 250, maxWidth: 340 }}>
                            <ProductIdentity product={product} />
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              whiteSpace: "nowrap",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {formatMoney(product.price)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              whiteSpace: "nowrap",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {product.discountPrice &&
                            product.discountPrice < product.price
                              ? formatMoney(product.discountPrice)
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Stack sx={{ gap: 0.75, alignItems: "flex-start" }}>
                              <StockChip quantity={product.stockQuantity} />
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                {formatCount(stockQuantity(product))} units
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{product.skinType || "—"}</TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              sx={{ justifyContent: "flex-end", gap: 0.5 }}
                            >
                              <Tooltip title="Edit product">
                                <IconButton
                                  aria-label={`Edit ${product.name}`}
                                  onClick={() => onEditProduct(product)}
                                >
                                  <EditOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete product">
                                <IconButton
                                  aria-label={`Delete ${product.name}`}
                                  onClick={() =>
                                    onDeleteProduct(product.id, product.name)
                                  }
                                  sx={{ color: "error.main" }}
                                >
                                  <DeleteOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <EmptyState
                  title={
                    products.length
                      ? "No matching products"
                      : "Your catalog is ready to grow"
                  }
                  description={
                    products.length
                      ? "Try a different product name, brand, or skin type."
                      : "Add your first product to start building your store catalog."
                  }
                  action={products.length ? "Clear search" : "Add product"}
                  onAction={
                    products.length
                      ? () => {
                          setProductSearch("");
                          resetPage("products");
                        }
                      : onAddProduct
                  }
                />
              )}
              {pagination("products", visibleProducts.length)}
            </Card>
          )}

          {tab === 2 && (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                {[
                  [
                    "In stock",
                    healthyStock.length,
                    "HEALTHY",
                    "More than 10 units",
                  ],
                  [
                    "Low stock",
                    lowStock.length,
                    "LOW",
                    "Between 1 and 10 units",
                  ],
                  [
                    "Out of stock",
                    outOfStock.length,
                    "OUT",
                    "Restocking required",
                  ],
                ].map(([label, count, filter, helper]) => (
                  <Card
                    key={filter}
                    sx={{
                      borderColor:
                        stockFilter === filter ? "primary.main" : "divider",
                    }}
                  >
                    <Button
                      color="inherit"
                      onClick={() => {
                        setStockFilter(stockFilter === filter ? "ALL" : filter);
                        resetPage("inventory");
                      }}
                      aria-pressed={stockFilter === filter}
                      sx={{
                        display: "block",
                        textAlign: "left",
                        width: "100%",
                        p: 2.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {label}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "1.75rem", fontWeight: 600, my: 0.75 }}
                      >
                        {formatCount(count)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        {helper}
                      </Typography>
                    </Button>
                  </Card>
                ))}
              </Box>
              <Card>
                <SectionHeading
                  title="Stock management"
                  description={`${formatCount(totalUnits)} total units across ${formatCount(products.length)} products`}
                />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  sx={{ gap: 2, justifyContent: "space-between", p: 2.5 }}
                >
                  <SearchField
                    label="Search inventory"
                    value={stockSearch}
                    onChange={(value) => {
                      setStockSearch(value);
                      resetPage("inventory");
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="stock-filter-label">
                      Stock status
                    </InputLabel>
                    <Select
                      labelId="stock-filter-label"
                      label="Stock status"
                      value={stockFilter}
                      onChange={(event) => {
                        setStockFilter(event.target.value);
                        resetPage("inventory");
                      }}
                    >
                      <MenuItem value="ALL">All stock</MenuItem>
                      <MenuItem value="HEALTHY">In stock</MenuItem>
                      <MenuItem value="LOW">Low stock</MenuItem>
                      <MenuItem value="OUT">Out of stock</MenuItem>
                      <MenuItem value="ATTENTION">Needs attention</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                {visibleStock.length ? (
                  <TableContainer>
                    <Table
                      aria-label="Inventory and restocking"
                      sx={{ minWidth: 760 }}
                    >
                      <TableHeader
                        columns={[
                          "Product",
                          { label: "Unit price", align: "right" },
                          { label: "Quantity", align: "right" },
                          "Stock status",
                          { label: "Restock", align: "right" },
                        ]}
                      />
                      <TableBody>
                        {pageRows("inventory", visibleStock).map((product) => (
                          <TableRow key={product.id} hover>
                            <TableCell sx={{ minWidth: 240, maxWidth: 340 }}>
                              <ProductIdentity product={product} />
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {formatMoney(product.price)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: 600,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {formatCount(stockQuantity(product))}
                            </TableCell>
                            <TableCell>
                              <StockChip quantity={product.stockQuantity} />
                            </TableCell>
                            <TableCell align="right">
                              <Stack
                                direction="row"
                                sx={{
                                  gap: 1,
                                  justifyContent: "flex-end",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {[10, 50].map((amount) => (
                                  <Button
                                    key={amount}
                                    size="small"
                                    variant="outlined"
                                    color="inherit"
                                    disabled={stockSaving !== null}
                                    onClick={() => onRestock(product, amount)}
                                    aria-label={`Add ${amount} units to ${product.name}`}
                                    sx={{ borderColor: "#DADEE5" }}
                                  >
                                    +{amount}
                                  </Button>
                                ))}
                                <Tooltip title="Edit stock quantity">
                                  <IconButton
                                    onClick={() => onEditProduct(product)}
                                    aria-label={`Edit stock for ${product.name}`}
                                  >
                                    <EditOutlined fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <EmptyState
                    title={
                      products.length
                        ? "No products match these filters"
                        : "No inventory yet"
                    }
                    description={
                      products.length
                        ? "Try a different search or view all stock."
                        : "Add a product to start managing your stock."
                    }
                    action={products.length ? "Clear filters" : "Add product"}
                    onAction={
                      products.length
                        ? () => {
                            setStockSearch("");
                            setStockFilter("ALL");
                            resetPage("inventory");
                          }
                        : onAddProduct
                    }
                  />
                )}
                {pagination("inventory", visibleStock.length)}
              </Card>
            </>
          )}

          {tab === 4 && <AdminPromotions products={products} refreshKey={lastUpdated?.getTime()} />}
          {tab === 3 && (
            <Card>
              <SectionHeading
                title="Customer orders"
                description="Delivery progress and payment collection are recorded separately."
              />
              <Stack
                direction={{ xs: "column", sm: "row" }}
                sx={{ gap: 2, justifyContent: "space-between", p: 2.5 }}
              >
                <SearchField
                  label="Search orders or customers"
                  value={orderSearch}
                  onChange={(value) => {
                    setOrderSearch(value);
                    resetPage("orders");
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 190 }}>
                  <InputLabel id="order-filter-label">Order status</InputLabel>
                  <Select
                    labelId="order-filter-label"
                    label="Order status"
                    value={orderFilter}
                    onChange={(event) => {
                      setOrderFilter(event.target.value);
                      resetPage("orders");
                    }}
                  >
                    <MenuItem value="ALL">
                      All orders ({orders.length})
                    </MenuItem>
                    {orderStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {readableStatus(status)} ({orderCount(status)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              {visibleOrders.length ? (
                <TableContainer>
                  <Table
                    aria-label="Customer orders and verified actions"
                    sx={{ minWidth: 1080 }}
                  >
                    <TableHeader
                      columns={[
                        "Order",
                        "Customer & delivery",
                        { label: "Total", align: "right" },
                        "Fulfilment & payment",
                        "Actions",
                      ]}
                    />
                    <TableBody>
                      {pageRows("orders", visibleOrders).map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell
                            sx={{ verticalAlign: "top", whiteSpace: "nowrap" }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "primary.main" }}
                            >
                              #{order.id}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              {formatDate(order.orderDate)}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              maxWidth: 300,
                              minWidth: 240,
                              verticalAlign: "top",
                            }}
                          >
                            {order.customerName && (
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {order.customerName}
                              </Typography>
                            )}
                            <Typography
                              variant="body2"
                              sx={{ overflowWrap: "anywhere" }}
                            >
                              {order.customerEmail ||
                                order.user?.email ||
                                "Email not recorded"}
                            </Typography>
                            {order.customerPhone && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  color: "text.secondary",
                                }}
                              >
                                {order.customerPhone}
                              </Typography>
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                color: "text.secondary",
                                mt: 1,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {order.shippingAddress || "Address not recorded"}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ verticalAlign: "top", whiteSpace: "nowrap" }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            >
                              {formatMoney(order.totalAmount)}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              Delivery:{" "}
                              {formatDeliveryCharge(order.deliveryCharge)}
                            </Typography>
                            {order.couponCode && <Typography variant="caption" sx={{ display: 'block', color: 'success.main', mt: 1 }}>
                              Promo: {order.couponCode}{order.couponPercentage != null ? ` (${order.couponPercentage}%)` : ''}
                              {order.couponDiscount != null ? ` · saved ${formatMoney(order.couponDiscount)}` : ''}
                            </Typography>}
                          </TableCell>
                          <TableCell
                            sx={{
                              minWidth: 240,
                              maxWidth: 300,
                              verticalAlign: "top",
                            }}
                          >
                            <StatusChip status={order.status} />
                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                mt: 1,
                                color:
                                  order.paymentStatus === "PAID"
                                    ? "success.main"
                                    : "text.secondary",
                              }}
                            >
                              {paymentLabel(order)}
                            </Typography>
                            {order.paymentMethod &&
                              order.paymentMethod !== "COD" && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    color: "text.secondary",
                                  }}
                                >
                                  Method: {order.paymentMethod}
                                </Typography>
                              )}
                            {(order.acceptanceReference ||
                              order.codCollectionReference) && (
                              <Box
                                component="details"
                                sx={{
                                  mt: 1,
                                  "& summary": {
                                    cursor: "pointer",
                                    fontSize: "0.8125rem",
                                    color: "primary.main",
                                    py: 0.5,
                                  },
                                  "& p": { overflowWrap: "anywhere" },
                                }}
                              >
                                <Box component="summary">
                                  Verification details
                                </Box>
                                {order.acceptanceReference && (
                                  <Typography variant="caption" component="p">
                                    Acceptance: {order.acceptanceReference}
                                    <br />
                                    {formatDate(order.acceptedAt)}
                                  </Typography>
                                )}
                                {order.codCollectionReference && (
                                  <Typography variant="caption" component="p">
                                    Collection: {order.codCollectionReference}
                                    <br />
                                    {formatDate(order.codCollectedAt)}
                                  </Typography>
                                )}
                              </Box>
                            )}
                            {order.inventoryReserved == null && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "warning.main",
                                  display: "block",
                                  mt: 1,
                                }}
                              >
                                Legacy inventory review required
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              minWidth: 200,
                              maxWidth: 230,
                              verticalAlign: "top",
                            }}
                          >
                            <Stack spacing={1}>
                              {order.status === "PENDING" && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={
                                    actionSaving ||
                                    order.inventoryReserved !== true
                                  }
                                  onClick={() =>
                                    onOrderAction(order, "acceptance")
                                  }
                                >
                                  Verify & accept
                                </Button>
                              )}
                              {allowedOrderTransitions(order.status).length >
                                0 && (
                                <FormControl size="small">
                                  <InputLabel id={`order-action-${order.id}`}>
                                    Update status
                                  </InputLabel>
                                  <Select
                                    labelId={`order-action-${order.id}`}
                                    label="Update status"
                                    value={order.status}
                                    disabled={actionSaving}
                                    onChange={(event) =>
                                      onOrderAction(
                                        order,
                                        "status",
                                        event.target.value,
                                      )
                                    }
                                  >
                                    <MenuItem value={order.status}>
                                      {readableStatus(order.status)}
                                    </MenuItem>
                                    {allowedOrderTransitions(order.status).map(
                                      (status) => (
                                        <MenuItem key={status} value={status}>
                                          {readableStatus(status)}
                                        </MenuItem>
                                      ),
                                    )}
                                  </Select>
                                </FormControl>
                              )}
                              {canRecordCodCollection(order) && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="success"
                                  disabled={actionSaving}
                                  onClick={() =>
                                    onOrderAction(order, "collection")
                                  }
                                >
                                  Record COD collection
                                </Button>
                              )}
                              {order.status === "DELIVERED" &&
                                !canRecordCodCollection(order) && (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "text.secondary" }}
                                  >
                                    {order.paymentStatus === "PAID"
                                      ? "Completed"
                                      : "No available actions"}
                                  </Typography>
                                )}
                              {order.status === "CANCELLED" && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "text.secondary" }}
                                >
                                  No available actions
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <EmptyState
                  icon={ReceiptLongOutlined}
                  title={orders.length ? "No matching orders" : "No orders yet"}
                  description={
                    orders.length
                      ? "Try another customer, order number, or order status."
                      : "Customer orders will appear here when they are placed."
                  }
                  action={orders.length ? "Clear filters" : undefined}
                  onAction={() => {
                    setOrderSearch("");
                    setOrderFilter("ALL");
                    resetPage("orders");
                  }}
                />
              )}
              {pagination("orders", visibleOrders.length)}
            </Card>
          )}
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
              mt: 3,
              textAlign: { xs: "left", sm: "right" },
            }}
            role="status"
          >
            Last refreshed{" "}
            {lastUpdated.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Colombo",
            })}{" "}
            · Sri Lanka time
          </Typography>
        </>
      )}
      {children}
    </AdminLayout>
  );
}
