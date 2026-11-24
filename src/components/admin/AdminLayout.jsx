import { Link, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tab,
  Tabs,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
} from "@mui/material";
import {
  DashboardOutlined,
  Inventory2Outlined,
  LogoutOutlined,
  ReceiptLongOutlined,
  StorefrontOutlined,
  WarehouseOutlined,
  LocalOfferOutlined,
} from "@mui/icons-material";

const adminTheme = createTheme({
  palette: {
    primary: { main: "#8F344D", dark: "#6D2338", light: "#B7657A" },
    background: { default: "#F6F7F9", paper: "#FFFFFF" },
    text: { primary: "#202735", secondary: "#647082" },
    divider: "#E8EBEF",
    success: { main: "#28734F" },
    warning: { main: "#946200" },
    error: { main: "#BC3545" },
    info: { main: "#3266A8" },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: {
      fontSize: "1.75rem",
      fontWeight: 600,
      letterSpacing: "-0.8px",
      lineHeight: 1.3,
    },
    h2: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "1rem" },
    body2: { fontSize: "0.875rem", lineHeight: 1.7 },
    caption: { fontSize: "0.8125rem", lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 500, fontSize: "0.875rem" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, minHeight: 40 },
        sizeSmall: { minHeight: 36 },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: 12, boxShadow: "none" } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: "#FFF", fontSize: "0.875rem" },
        notchedOutline: { borderColor: "#DADEE5" },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { fontSize: "0.875rem" } } },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#E8EBEF",
          padding: "16px 20px",
          fontSize: "0.875rem",
          verticalAlign: "middle",
        },
        head: {
          backgroundColor: "#FAFBFC",
          color: "#647082",
          fontSize: "0.875rem",
          fontWeight: 500,
          whiteSpace: "nowrap",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: { root: { "&:last-child td": { borderBottom: 0 } } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500, fontSize: "0.8125rem" },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { minWidth: 40, minHeight: 40 } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          backgroundImage: "none",
          margin: 16,
          width: "calc(100% - 32px)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontSize: "1.125rem", fontWeight: 600 } },
    },
    MuiAlert: {
      styleOverrides: { root: { fontSize: "0.875rem", borderRadius: 8 } },
    },
  },
});

const sections = [
  { label: "Overview", icon: DashboardOutlined },
  { label: "Products", icon: Inventory2Outlined },
  { label: "Inventory", icon: WarehouseOutlined },
  { label: "Orders", icon: ReceiptLongOutlined },
  { label: "Promo codes", icon: LocalOfferOutlined },
];

function AdminNavigation({ tab, onChange, counts, mobile = false }) {
  return (
    <Tabs
      value={tab}
      onChange={(_, value) => onChange(value)}
      orientation={mobile ? "horizontal" : "vertical"}
      variant={mobile ? "scrollable" : "standard"}
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label={mobile ? "Admin sections on mobile" : "Admin sections"}
      sx={{
        minHeight: 48,
        "& .MuiTabs-indicator": { display: mobile ? "block" : "none" },
        "& .MuiTabs-list": { gap: mobile ? 0 : 0.75 },
        "& .MuiTab-root": {
          minHeight: 46,
          minWidth: mobile ? 110 : 0,
          px: 1.75,
          borderRadius: mobile ? 0 : 1,
          color: "text.secondary",
          fontSize: "0.875rem",
          fontWeight: 500,
          textTransform: "none",
          justifyContent: "flex-start",
          "&.Mui-selected": { color: "primary.main", bgcolor: "#F8EEF1" },
          "& .MuiTab-icon": { fontSize: 21, mr: 1.5 },
        },
      }}
    >
      {sections.map(({ label, icon: Icon }, index) => (
        <Tab
          key={label}
          id={`${mobile ? "mobile-" : ""}admin-tab-${index}`}
          aria-controls="admin-section-panel"
          icon={<Icon />}
          iconPosition="start"
          label={
            <Stack
              component="span"
              direction="row"
              sx={{ alignItems: "center", gap: 1, width: "100%" }}
            >
              {label}
              {!mobile && counts[index] > 0 && (
                <Chip
                  component="span"
                  label={counts[index]}
                  size="small"
                  sx={{
                    ml: "auto",
                    height: 23,
                    bgcolor: index === 2 ? "#FFF3DC" : "#F0F2F5",
                    color: index === 2 ? "#946200" : "text.secondary",
                  }}
                />
              )}
            </Stack>
          }
        />
      ))}
    </Tabs>
  );
}

export default function AdminLayout({
  tab,
  onTabChange,
  counts,
  title,
  description,
  actions,
  children,
}) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "224px minmax(0, 1fr)",
          },
          minHeight: "100dvh",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <Box
          component="aside"
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            position: "sticky",
            top: 0,
            height: "100dvh",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            px: 2,
            py: 3,
          }}
        >
          <Stack
            component={Link}
            to="/"
            direction="row"
            aria-label="Sekkin.lk store home"
            sx={{
              alignItems: "center",
              gap: 1.25,
              px: 1.25,
              textDecoration: "none",
              mb: 5,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt=""
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                bgcolor: "#111",
              }}
            />
            <Box>
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "primary.main",
                  letterSpacing: "-0.5px",
                }}
              >
                Sekkin.lk
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Admin workspace
              </Typography>
            </Box>
          </Stack>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", px: 1.75, mb: 1.5 }}
          >
            Store management
          </Typography>
          <AdminNavigation tab={tab} onChange={onTabChange} counts={counts} />
          <Box
            sx={{
              mt: "auto",
              pt: 3,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              component={Link}
              to="/"
              color="inherit"
              startIcon={<StorefrontOutlined />}
              fullWidth
              sx={{ justifyContent: "flex-start", color: "text.secondary" }}
            >
              View storefront
            </Button>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", px: 1.5, mt: 2 }}
            >
              Sekkin.lk administration
            </Typography>
          </Box>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Stack
            component="header"
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              height: 76,
              px: { xs: 2, sm: 3, lg: 4 },
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              <Box
                component="span"
                sx={{ display: { xs: "none", sm: "inline" } }}
              >
                Workspace
                <Box component="span" sx={{ mx: 1.5, color: "#B1B8C4" }}>
                  /
                </Box>
              </Box>
              <Box
                component="span"
                sx={{ color: "text.primary", fontWeight: 500 }}
              >
                {sections[tab].label}
              </Box>
            </Typography>
            <Stack direction="row" sx={{ gap: 1.25, alignItems: "center" }}>
              <Button
                component={Link}
                to="/"
                size="small"
                color="inherit"
                startIcon={<StorefrontOutlined />}
                sx={{ display: { xs: "inline-flex", md: "none" } }}
              >
                Store
              </Button>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: "#F4E8EC",
                  color: "primary.main",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                A
              </Avatar>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, display: { xs: "none", sm: "block" } }}
              >
                Administrator
              </Typography>
              <Tooltip title="Log out">
                <IconButton
                  aria-label="Log out"
                  onClick={logout}
                  size="small"
                  sx={{ color: "text.secondary" }}
                >
                  <LogoutOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <AdminNavigation
              tab={tab}
              onChange={onTabChange}
              counts={counts}
              mobile
            />
          </Box>
          <Box
            sx={{
              px: { xs: 2, sm: 3, lg: 4 },
              py: { xs: 3, lg: 4 },
              maxWidth: 1600,
              mx: "auto",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
                mb: 3.5,
              }}
            >
              <Box>
                <Typography
                  component="h1"
                  variant="h1"
                  sx={{ fontSize: { xs: "1.5rem", lg: "1.75rem" } }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.75 }}
                >
                  {description}
                </Typography>
              </Box>
              <Stack direction="row" sx={{ gap: 1.25, flexShrink: 0 }}>
                {actions}
              </Stack>
            </Stack>
            <Box
              id="admin-section-panel"
              role="tabpanel"
              aria-label={sections[tab].label}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
