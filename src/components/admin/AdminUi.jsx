import {
  Avatar,
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import {
  Inventory2Outlined,
  SearchOutlined,
  SpaOutlined,
} from "@mui/icons-material";
import ImageSequenceManager from "../ImageSequenceManager";
import { resolveImageUrl } from "../../services/api";

const statusStyles = {
  PENDING: { color: "#946200", bgcolor: "#FFF4DB" },
  PROCESSING: { color: "#3266A8", bgcolor: "#EBF2FC" },
  SHIPPED: { color: "#6550A4", bgcolor: "#F0EDFA" },
  DELIVERED: { color: "#28734F", bgcolor: "#EAF5EF" },
  CANCELLED: { color: "#BC3545", bgcolor: "#FCEEF0" },
};

export function StatusChip({ status }) {
  return (
    <Chip
      size="small"
      label={
        status ? status.charAt(0) + status.slice(1).toLowerCase() : "Unknown"
      }
      sx={statusStyles[status] || {}}
    />
  );
}

export function StockChip({ quantity }) {
  const count = Number(quantity || 0);
  return (
    <Chip
      size="small"
      label={
        count <= 0 ? "Out of stock" : count <= 10 ? "Low stock" : "In stock"
      }
      sx={
        count <= 0
          ? statusStyles.CANCELLED
          : count <= 10
            ? statusStyles.PENDING
            : statusStyles.DELIVERED
      }
    />
  );
}

export function ProductIdentity({ product, compact = false }) {
  return (
    <Stack direction="row" sx={{ gap: 1.5, alignItems: "center", minWidth: 0 }}>
      <Avatar
        variant="rounded"
        src={resolveImageUrl(product.imageUrl)}
        alt=""
        sx={{
          width: compact ? 38 : 44,
          height: compact ? 38 : 44,
          bgcolor: "#F5F2F4",
          color: "primary.light",
          border: "1px solid",
          borderColor: "divider",
          "& img": { objectFit: "contain" },
        }}
      >
        <SpaOutlined fontSize="small" />
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, overflowWrap: "anywhere" }}
        >
          {product.name}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {product.brand || "No brand"}
          {!compact && ` · #${product.id}`}
        </Typography>
      </Box>
    </Stack>
  );
}

export function SearchField({ label, value, onChange }) {
  return (
    <TextField
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined sx={{ fontSize: 20, color: "text.secondary" }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{ width: { xs: "100%", sm: 300 } }}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  onAction,
  icon: Icon = Inventory2Outlined,
}) {
  return (
    <Stack
      sx={{ alignItems: "center", gap: 1, py: 6, px: 2, textAlign: "center" }}
    >
      <Avatar
        variant="rounded"
        sx={{
          width: 48,
          height: 48,
          bgcolor: "#F1F3F6",
          color: "text.secondary",
          mb: 0.75,
        }}
      >
        <Icon />
      </Avatar>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", maxWidth: 370 }}
      >
        {description}
      </Typography>
      {action && (
        <Button onClick={onAction} sx={{ mt: 1 }}>
          {action}
        </Button>
      )}
    </Stack>
  );
}

export function Pagination({
  count,
  page,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
}) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={(_, value) => onPageChange(value)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(event) =>
        onRowsPerPageChange(Number(event.target.value))
      }
      rowsPerPageOptions={[10, 25, 50]}
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        "& .MuiTablePagination-toolbar": {
          flexWrap: "wrap",
          justifyContent: "flex-end",
          px: { xs: 1, sm: 2 },
        },
        "& .MuiTablePagination-spacer": {
          display: { xs: "none", sm: "block" },
        },
        "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
          { fontSize: "0.8125rem" },
        "& .MuiTablePagination-actions": { ml: 1 },
      }}
    />
  );
}

export function ProductFormFields({ value, onChange, disabled }) {
  const update = (field, fieldValue) =>
    onChange((previous) => ({ ...previous, [field]: fieldValue }));
  const field = (name, label, props = {}) => (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value[name]}
      onChange={(event) => update(name, event.target.value)}
      {...props}
    />
  );
  return (
    <Box
      component="fieldset"
      disabled={disabled}
      sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            component="h3"
            variant="body2"
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Product details
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5,
            }}
          >
            {field("name", "Product name", { required: true })}
            {field("brand", "Brand", { required: true })}
            {field("skinType", "Skin type", {
              placeholder: "e.g. Oily, dry, sensitive",
            })}
            {field("stockQuantity", "Stock quantity", {
              required: true,
              type: "number",
              slotProps: { htmlInput: { min: 0, step: 1 } },
            })}
            {field("price", "Regular price (LKR)", {
              required: true,
              type: "number",
              slotProps: { htmlInput: { min: 0.01, step: "0.01" } },
            })}
            {field("discountPrice", "Sale price (LKR)", {
              type: "number",
              helperText: "Optional. Leave empty for the regular price.",
              slotProps: { htmlInput: { min: 0.01, step: "0.01" } },
            })}
          </Box>
        </Box>
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 2.5 }}>
          <ImageSequenceManager
            images={value.images || []}
            onChange={(images, imageUrl) =>
              onChange((previous) => ({ ...previous, images, imageUrl }))
            }
          />
        </Box>
        <Box sx={{ display: "grid", gap: 2.5 }}>
          {field("description", "Description", { multiline: true, rows: 3 })}
          {field("ingredients", "Key ingredients", {
            multiline: true,
            rows: 2,
          })}
        </Box>
      </Stack>
    </Box>
  );
}
