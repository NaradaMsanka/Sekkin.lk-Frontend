import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Slider, Stack, IconButton,
  Tooltip, CircularProgress, Chip, Divider, Paper
} from "@mui/material";
import {
  RotateRight, RotateLeft, Flip, ZoomIn, ZoomOut,
  Tune, RestartAlt, CheckCircle, Close, PhotoCamera,
  Brightness6, Contrast, AutoAwesome
} from "@mui/icons-material";
import axios from "axios";

const API = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

export default function ImageEditorModal({
  open,
  imageSrc,
  onApply,
  onClose,
  aspectRatio = 1 // 1:1 square for cosmetic products
}) {
  const canvasRef = useRef(null);
  const imageObjRef = useRef(null);

  // Transformations
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filters & Adjustments
  const [brightness, setBrightness] = useState(100); // 100% is normal
  const [contrast, setContrast] = useState(100);   // 100% is normal
  const [saturation, setSaturation] = useState(100); // 100% is normal
  const [activePreset, setActivePreset] = useState("normal");
  const [uploading, setUploading] = useState(false);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc || !open) return;
    const img = new Image();
    // Only set crossOrigin on remote http/https URLs; data URLs or blobs can fail or taint canvas
    if (typeof imageSrc === "string" && (imageSrc.startsWith("http://") || imageSrc.startsWith("https://"))) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      imageObjRef.current = img;
      handleReset();
    };
    img.src = imageSrc;
  }, [imageSrc, open]);

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setFlipH(false);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setActivePreset("normal");
  };

  // Draw on Canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear background with crisp clean white (standard for cosmetics)
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Move to center of canvas
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);

    // Rotate
    ctx.rotate((rotation * Math.PI) / 180);

    // Flip Horizontal
    ctx.scale(flipH ? -1 : 1, 1);

    // Scale / Zoom
    ctx.scale(scale, scale);

    // Calculate image draw dimensions to maintain aspect ratio
    const imgRatio = img.width / img.height;
    let drawW, drawH;
    if (imgRatio > 1) {
      drawW = width;
      drawH = width / imgRatio;
    } else {
      drawH = height;
      drawW = height * imgRatio;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [scale, rotation, flipH, pan, brightness, contrast, saturation]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Drag / Pan handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Presets
  const applyPreset = (preset) => {
    setActivePreset(preset);
    if (preset === "normal") {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
    } else if (preset === "studio") {
      // Crisp white background & vivid colors
      setBrightness(108);
      setContrast(112);
      setSaturation(110);
    } else if (preset === "warm") {
      // Warm elegance for skincare
      setBrightness(104);
      setContrast(105);
      setSaturation(118);
    } else if (preset === "crisp") {
      // High detail for labels & ingredients
      setBrightness(102);
      setContrast(122);
      setSaturation(100);
    }
  };

  // Confirm and Export Image
  const handleApply = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setUploading(true);

    try {
      // 1. High resolution render canvas (800x800 square for ecommerce)
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 800;
      exportCanvas.height = 800;
      const expCtx = exportCanvas.getContext("2d");
      const img = imageObjRef.current;

      expCtx.fillStyle = "#FFFFFF";
      expCtx.fillRect(0, 0, 800, 800);
      expCtx.save();
      expCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

      // Scale pan relative to 800x800
      const canvasDisplayW = canvas.width;
      const ratio = 800 / canvasDisplayW;

      expCtx.translate(400 + pan.x * ratio, 400 + pan.y * ratio);
      expCtx.rotate((rotation * Math.PI) / 180);
      expCtx.scale(flipH ? -1 : 1, 1);
      expCtx.scale(scale, scale);

      const imgRatio = img.width / img.height;
      let drawW, drawH;
      if (imgRatio > 1) {
        drawW = 800;
        drawH = 800 / imgRatio;
      } else {
        drawH = 800;
        drawW = 800 * imgRatio;
      }

      expCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      expCtx.restore();

      const dataUrl = exportCanvas.toDataURL("image/webp", 0.92);

      // 2. Upload to Spring Boot Backend /api/upload
      try {
        const blob = await new Promise((resolve) =>
          exportCanvas.toBlob(resolve, "image/webp", 0.90)
        );
        const formData = new FormData();
        formData.append("file", blob, `prod-${Date.now()}.webp`);

        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Important: Do NOT set "Content-Type": "multipart/form-data" manually.
        // Axios automatically sets the proper Content-Type with multipart boundary.
        const res = await axios.post(`${API}/upload`, formData, {
          headers,
          timeout: 15000 // 15-second timeout to prevent infinite stuck state
        });

        if (res.data && res.data.url) {
          onApply(res.data.url, res.data.url);
          onClose();
          return;
        }
      } catch (uploadErr) {
        console.warn("Backend upload failed, evaluating fallback:", uploadErr);
        if (uploadErr.response?.status === 401 || uploadErr.response?.status === 403) {
          alert("Image upload failed: Admin session expired or unauthorized. Please re-login as Admin.");
          setUploading(false);
          return;
        }
        // Fallback: use moderately compressed dataUrl only if backend is unreachable
        const fallbackDataUrl = exportCanvas.toDataURL("image/webp", 0.7);
        onApply(fallbackDataUrl, fallbackDataUrl);
        onClose();
        return;
      }
    } catch (err) {
      console.error("Failed to process image canvas:", err);
      alert("Failed to render and prepare image. Please try again with a different image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={uploading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          bgcolor: "#FAF8F5",
          overflow: "hidden"
        }
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.06)", py: 1.8 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PhotoCamera sx={{ color: "primary.main" }} />
          <Typography variant="h6" fontWeight={800}>
            Product Image Studio & Editor
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={uploading} aria-label="Close">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="center">
          {/* Left Canvas Preview Area */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Paper
              elevation={3}
              sx={{
                width: { xs: 280, sm: 340 },
                height: { xs: 280, sm: 340 },
                borderRadius: 3,
                overflow: "hidden",
                border: "2px solid #C9956A",
                cursor: isDragging ? "grabbing" : "grab",
                position: "relative",
                bgcolor: "#FFFFFF",
                boxShadow: "0 8px 24px rgba(201,149,106,0.2)"
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <canvas
                ref={canvasRef}
                width={340}
                height={340}
                style={{ width: "100%", height: "100%", display: "block" }}
              />

              {/* Helper text overlay */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  right: 8,
                  bgcolor: "rgba(0,0,0,0.65)",
                  color: "white",
                  py: 0.4,
                  px: 1,
                  borderRadius: 1.5,
                  fontSize: "0.72rem",
                  textAlign: "center",
                  pointerEvents: "none"
                }}
              >
                Drag to reposition • Use zoom to fit product
              </Box>
            </Paper>

            <Typography variant="caption" sx={{ mt: 1, color: "text.secondary", fontWeight: 600 }}>
              1:1 Square Cosmetic Aspect Ratio
            </Typography>
          </Box>

          {/* Right Editing Controls */}
          <Box sx={{ flex: 1, width: "100%" }}>
            {/* Quick Presets */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "#8C7568", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>
              Beauty Presets
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: "wrap", gap: 0.8 }}>
              {[
                { id: "normal", label: "Original" },
                { id: "studio", label: "Studio White ✨" },
                { id: "warm", label: "Warm Glow 🌸" },
                { id: "crisp", label: "High Clarity 🔍" },
              ].map((p) => (
                <Chip
                  key={p.id}
                  label={p.label}
                  clickable
                  color={activePreset === p.id ? "primary" : "default"}
                  variant={activePreset === p.id ? "filled" : "outlined"}
                  onClick={() => applyPreset(p.id)}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            {/* Rotation & Flip Controls */}
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "#8C7568", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px" }}>
              Orientation & Flip
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
              <Tooltip title="Rotate 90° Counter-Clockwise">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RotateLeft />}
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                >
                  -90°
                </Button>
              </Tooltip>
              <Tooltip title="Rotate 90° Clockwise">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RotateRight />}
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  +90°
                </Button>
              </Tooltip>
              <Tooltip title="Flip Horizontal">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Flip />}
                  onClick={() => setFlipH((f) => !f)}
                  color={flipH ? "primary" : "inherit"}
                >
                  Flip
                </Button>
              </Tooltip>
              <Tooltip title="Reset all adjustments">
                <IconButton onClick={handleReset} size="small" color="inherit">
                  <RestartAlt />
                </IconButton>
              </Tooltip>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            {/* Zoom / Scale Slider */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ZoomIn fontSize="small" sx={{ color: "primary.main" }} /> Zoom / Scale
                </Typography>
                <Typography variant="caption" fontWeight={700} color="primary.main">
                  {scale.toFixed(1)}x
                </Typography>
              </Box>
              <Slider
                value={scale}
                min={0.8}
                max={3}
                step={0.05}
                onChange={(e, val) => setScale(val)}
                size="small"
              />
            </Box>

            {/* Brightness Slider */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Brightness6 fontSize="small" sx={{ color: "#C9956A" }} /> Brightness
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {brightness}%
                </Typography>
              </Box>
              <Slider
                value={brightness}
                min={60}
                max={150}
                step={1}
                onChange={(e, val) => {
                  setBrightness(val);
                  setActivePreset("custom");
                }}
                size="small"
              />
            </Box>

            {/* Contrast Slider */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Contrast fontSize="small" sx={{ color: "#8C7568" }} /> Contrast
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {contrast}%
                </Typography>
              </Box>
              <Slider
                value={contrast}
                min={60}
                max={150}
                step={1}
                onChange={(e, val) => {
                  setContrast(val);
                  setActivePreset("custom");
                }}
                size="small"
              />
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#FFFFFF", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <Button onClick={onClose} disabled={uploading} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={uploading}
          startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
          sx={{
            background: "linear-gradient(45deg, #B5385C, #C9956A)",
            color: "white",
            fontWeight: 700,
            px: 3,
            borderRadius: 2.5,
            boxShadow: "0 4px 14px rgba(181,56,92,0.3)"
          }}
        >
          {uploading ? "Optimizing & Saving..." : "✓ Apply & Set Image"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
