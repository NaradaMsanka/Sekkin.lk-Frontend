import { useState, useRef, useEffect, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Check,
  Close,
  CropSquareOutlined,
  Flip,
  ImageOutlined,
  OpenWithOutlined,
  RestartAlt,
  RotateLeft,
  RotateRight,
  UploadOutlined,
} from "@mui/icons-material";
import api, { resolveImageUrl } from "../services/api";

const PREVIEW_SIZE = 340;
const PRESETS = [
  {
    id: "normal",
    label: "Original",
    description: "Natural colours",
    values: [100, 100, 100],
  },
  {
    id: "studio",
    label: "Bright studio",
    description: "Light and balanced",
    values: [108, 112, 110],
  },
  {
    id: "warm",
    label: "Warm",
    description: "A softer finish",
    values: [104, 105, 118],
  },
  {
    id: "crisp",
    label: "High clarity",
    description: "More defined detail",
    values: [102, 122, 100],
  },
];

// Share the drawing operation so the 800px export matches the preview.
function paintImage(
  canvas,
  image,
  { scale, rotation, flipH, pan, brightness, contrast, saturation },
) {
  const context = canvas?.getContext("2d");
  if (!context || !image) return false;
  const size = canvas.width;
  context.clearRect(0, 0, size, size);
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, size, size);
  context.save();
  context.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  const ratio = size / PREVIEW_SIZE;
  context.translate(size / 2 + pan.x * ratio, size / 2 + pan.y * ratio);
  context.rotate((rotation * Math.PI) / 180);
  context.scale(flipH ? -1 : 1, 1);
  context.scale(scale, scale);
  const fit = size / Math.max(image.width, image.height);
  const width = image.width * fit;
  const height = image.height * fit;
  context.drawImage(image, -width / 2, -height / 2, width, height);
  context.restore();
  return true;
}

function AdjustmentSlider({
  id,
  label,
  value,
  readout,
  min,
  max,
  step = 1,
  onChange,
  disabled,
}) {
  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mb: 0.5,
        }}
      >
        <Typography id={id} variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            minWidth: 58,
            textAlign: "right",
            fontVariantNumeric: "tabular-nums",
            color: "text.secondary",
          }}
        >
          {readout}
        </Typography>
      </Stack>
      <Box sx={{ px: 1 }}>
        <Slider
          aria-labelledby={id}
          value={value}
          min={min}
          max={max}
          step={step}
          getAriaValueText={(number) =>
            label === "Zoom"
              ? `${number.toFixed(2)} times`
              : `${number} percent`
          }
          onChange={(_, number) => onChange(number)}
          disabled={disabled}
          size="small"
          sx={{
            py: 1.5,
            "& .MuiSlider-rail": { opacity: 1, bgcolor: "#E8EBEF" },
            "& .MuiSlider-thumb": { width: 14, height: 14 },
          }}
        />
      </Box>
    </Box>
  );
}

export default function ImageEditorModal(props) {
  return props.open && props.imageSrc ? (
    <ImageEditorContent key={props.imageSrc} {...props} />
  ) : null;
}

function ImageEditorContent({ open, imageSrc, onApply, onClose }) {
  const canvasRef = useRef(null);
  const imageObjRef = useRef(null);
  const dragRef = useRef(null);
  const uploadPending = useRef(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [activePreset, setActivePreset] = useState("normal");
  const [uploading, setUploading] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const disabled = uploading || !imageReady;

  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
    setFlipH(false);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setActivePreset("normal");
  }, []);

  useEffect(() => {
    imageObjRef.current = null;
    const image = new Image();
    if (/^https?:\/\//.test(imageSrc)) image.crossOrigin = "anonymous";
    image.onload = () => {
      imageObjRef.current = image;
      handleReset();
      setImageReady(true);
    };
    image.onerror = () =>
      setLoadError(
        "This image could not be loaded. Close the editor and choose a local image to replace it.",
      );
    image.src = resolveImageUrl(imageSrc);
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [imageSrc, handleReset]);

  useEffect(() => {
    paintImage(canvasRef.current, imageObjRef.current, {
      scale,
      rotation,
      flipH,
      pan,
      brightness,
      contrast,
      saturation,
    });
  }, [
    scale,
    rotation,
    flipH,
    pan,
    brightness,
    contrast,
    saturation,
    imageReady,
  ]);

  const stopDragging = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const handlePointerDown = (event) => {
    if (disabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      pan,
      pointerId: event.pointerId,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    const start = dragRef.current;
    if (!start || event.pointerId !== start.pointerId || disabled) return;
    const ratio =
      PREVIEW_SIZE / canvasRef.current.getBoundingClientRect().width;
    setPan({
      x: start.pan.x + (event.clientX - start.x) * ratio,
      y: start.pan.y + (event.clientY - start.y) * ratio,
    });
  };

  const handlePreviewKeyDown = (event) => {
    if (
      disabled ||
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    const step =
      ((event.shiftKey ? 20 : 5) * PREVIEW_SIZE) /
      canvasRef.current.getBoundingClientRect().width;
    setPan((previous) => ({
      x:
        previous.x +
        (event.key === "ArrowLeft"
          ? -step
          : event.key === "ArrowRight"
            ? step
            : 0),
      y:
        previous.y +
        (event.key === "ArrowUp"
          ? -step
          : event.key === "ArrowDown"
            ? step
            : 0),
    }));
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setBrightness(preset.values[0]);
    setContrast(preset.values[1]);
    setSaturation(preset.values[2]);
  };

  const handleApply = async () => {
    if (disabled || uploadPending.current || !imageObjRef.current) return;
    uploadPending.current = true;
    setUploading(true);
    setUploadError("");
    try {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 800;
      exportCanvas.height = 800;
      if (
        !paintImage(exportCanvas, imageObjRef.current, {
          scale,
          rotation,
          flipH,
          pan,
          brightness,
          contrast,
          saturation,
        })
      ) {
        throw new Error("Could not prepare the image. Please try again.");
      }
      const blob = await new Promise((resolve) =>
        exportCanvas.toBlob(resolve, "image/webp", 0.9),
      );
      if (!blob)
        throw new Error("Could not prepare the image. Please try again.");
      const formData = new FormData();
      const extension = blob.type === "image/webp" ? "webp" : "png";
      formData.append("file", blob, `prod-${Date.now()}.${extension}`);
      const response = await api.post("/api/upload", formData, {
        headers: { "Content-Type": undefined },
        timeout: 120000,
      });
      if (!response.data?.url?.startsWith("https://res.cloudinary.com/")) {
        throw new Error(
          "The server did not return a valid image URL. Please try again or contact support.",
        );
      }
      onApply(response.data.url);
      onClose();
    } catch (error) {
      const status = error.response?.status;
      const serverMessage =
        error.response?.data?.message || error.response?.data?.error;
      setUploadError(
        status === 401 || status === 403
          ? "Image upload requires an active Admin session. Please sign in again as Admin."
          : typeof serverMessage === "string"
            ? serverMessage
            : "We couldn’t upload this image. Your edits are still here. Please try again.",
      );
    } finally {
      uploadPending.current = false;
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={uploading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="image-editor-title"
      aria-describedby="image-editor-description"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px",
            bgcolor: "background.paper",
            backgroundImage: "none",
            maxHeight: "calc(100dvh - 32px)",
            m: 2,
            width: "calc(100% - 32px)",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        id="image-editor-header"
        component="div"
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          <Stack direction="row" sx={{ alignItems: "flex-start", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: { xs: "none", sm: "grid" },
                placeItems: "center",
                bgcolor: "#F8EEF1",
                color: "primary.main",
                borderRadius: 1,
                flexShrink: 0,
              }}
            >
              <ImageOutlined sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                component="h2"
                id="image-editor-title"
                sx={{ fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.5 }}
              >
                Edit product image
              </Typography>
              <Typography
                id="image-editor-description"
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.25 }}
              >
                Adjust the crop and appearance before uploading.
              </Typography>
            </Box>
          </Stack>
          <IconButton
            aria-label="Close image editor"
            onClick={onClose}
            disabled={uploading}
            size="small"
            sx={{ color: "text.secondary", mt: -0.5, mr: -0.75 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{ p: { xs: 2, sm: 3 }, "&.MuiDialogContent-root": { pt: 3 } }}
        aria-busy={uploading}
      >
        {(loadError || uploadError) && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {loadError || uploadError}
          </Alert>
        )}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "minmax(0, 1fr) minmax(0, 1fr)",
            },
            gap: { xs: 3, sm: 3.5 },
            alignItems: "start",
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 1.5,
              bgcolor: "#F6F7F9",
              border: "1px solid",
              borderColor: "divider",
              minWidth: 0,
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Image preview
              </Typography>
              <Stack
                direction="row"
                sx={{ alignItems: "center", gap: 0.5, color: "text.secondary" }}
              >
                <CropSquareOutlined sx={{ fontSize: 17 }} />
                <Typography variant="caption">1:1</Typography>
              </Stack>
            </Stack>
            <Box
              role="group"
              tabIndex={disabled ? -1 : 0}
              aria-label="Image position"
              aria-describedby="image-position-help"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onLostPointerCapture={stopDragging}
              onKeyDown={handlePreviewKeyDown}
              sx={{
                width: "100%",
                aspectRatio: "1",
                bgcolor: "#FFF",
                border: "1px solid #DADEE5",
                borderRadius: 1,
                overflow: "hidden",
                position: "relative",
                touchAction: "none",
                cursor: disabled ? "default" : isDragging ? "grabbing" : "grab",
              }}
            >
              <canvas
                ref={canvasRef}
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                style={{ display: "block", width: "100%", height: "100%" }}
              >
                Preview of the edited product image.
              </canvas>
              {!imageReady && (
                <Stack
                  role="status"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    bgcolor: "#FFF",
                    color: "text.secondary",
                  }}
                >
                  {loadError ? (
                    <ImageOutlined />
                  ) : (
                    <CircularProgress size={24} />
                  )}
                  <Typography variant="body2">
                    {loadError ? "Image unavailable" : "Loading image…"}
                  </Typography>
                </Stack>
              )}
            </Box>
            <Stack
              direction="row"
              sx={{
                alignItems: "flex-start",
                gap: 1,
                mt: 2,
                color: "text.secondary",
              }}
            >
              <OpenWithOutlined
                sx={{ fontSize: 17, mt: 0.25, flexShrink: 0 }}
              />
              <Typography id="image-position-help" variant="caption">
                Drag or use the arrow keys to position the image. Use zoom to
                adjust the crop.
              </Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                gap: 1,
                mt: 2,
                pt: 1.5,
                borderTop: "1px solid",
                borderColor: "divider",
                color: "text.secondary",
              }}
            >
              <Typography variant="caption">Square image</Typography>
              <Typography variant="caption">800 × 800 px</Typography>
            </Stack>
          </Box>

          <Stack spacing={2.5} sx={{ minWidth: 0 }}>
            <Box role="group" aria-labelledby="image-appearance-label">
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Typography
                  id="image-appearance-label"
                  component="h3"
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                >
                  Appearance
                </Typography>
                {activePreset === "custom" && (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Custom
                  </Typography>
                )}
              </Stack>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 1,
                }}
              >
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outlined"
                    color="inherit"
                    aria-pressed={activePreset === preset.id}
                    onClick={() => applyPreset(preset)}
                    disabled={disabled}
                    sx={{
                      textAlign: "left",
                      justifyContent: "space-between",
                      px: 1.5,
                      py: 1,
                      minHeight: 64,
                      gap: 0.5,
                      borderColor:
                        activePreset === preset.id ? "primary.main" : "#DADEE5",
                      bgcolor:
                        activePreset === preset.id
                          ? "#F8EEF1"
                          : "background.paper",
                      color:
                        activePreset === preset.id
                          ? "primary.main"
                          : "text.primary",
                      "&:hover": {
                        bgcolor: "#F8EEF1",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Box component="span">
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ display: "block", fontWeight: 500 }}
                      >
                        {preset.label}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "text.secondary",
                          mt: 0.25,
                        }}
                      >
                        {preset.description}
                      </Typography>
                    </Box>
                    <Check
                      sx={{
                        fontSize: 17,
                        flexShrink: 0,
                        visibility:
                          activePreset === preset.id ? "visible" : "hidden",
                      }}
                    />
                  </Button>
                ))}
              </Box>
            </Box>

            <Box
              role="group"
              aria-labelledby="image-orientation-label"
              sx={{ pt: 2.5, borderTop: "1px solid", borderColor: "divider" }}
            >
              <Typography
                id="image-orientation-label"
                component="h3"
                variant="body2"
                sx={{ fontWeight: 600, mb: 1.5 }}
              >
                Rotate & flip
              </Typography>
              <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                <Tooltip title="Rotate left 90 degrees">
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    aria-label="Rotate left 90 degrees"
                    startIcon={<RotateLeft />}
                    onClick={() =>
                      setRotation((previous) => (previous - 90 + 360) % 360)
                    }
                    disabled={disabled}
                    sx={{ borderColor: "#DADEE5", px: 1.25 }}
                  >
                    −90°
                  </Button>
                </Tooltip>
                <Tooltip title="Rotate right 90 degrees">
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    aria-label="Rotate right 90 degrees"
                    startIcon={<RotateRight />}
                    onClick={() =>
                      setRotation((previous) => (previous + 90) % 360)
                    }
                    disabled={disabled}
                    sx={{ borderColor: "#DADEE5", px: 1.25 }}
                  >
                    +90°
                  </Button>
                </Tooltip>
                <Button
                  variant="outlined"
                  color={flipH ? "primary" : "inherit"}
                  size="small"
                  aria-label="Flip horizontally"
                  aria-pressed={flipH}
                  startIcon={<Flip />}
                  onClick={() => setFlipH((previous) => !previous)}
                  disabled={disabled}
                  sx={{
                    borderColor: flipH ? "primary.main" : "#DADEE5",
                    bgcolor: flipH ? "#F8EEF1" : "transparent",
                    px: 1.25,
                  }}
                >
                  Flip
                </Button>
              </Stack>
            </Box>

            <Box
              role="group"
              aria-labelledby="image-adjustments-label"
              sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}
            >
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Typography
                  id="image-adjustments-label"
                  component="h3"
                  variant="body2"
                  sx={{ fontWeight: 600 }}
                >
                  Adjustments
                </Typography>
                <Button
                  size="small"
                  startIcon={<RestartAlt sx={{ fontSize: 17 }} />}
                  onClick={handleReset}
                  disabled={disabled}
                  sx={{ minHeight: 32, px: 0.75 }}
                >
                  Reset edits
                </Button>
              </Stack>
              <Stack spacing={1.5}>
                <AdjustmentSlider
                  id="image-zoom"
                  label="Zoom"
                  value={scale}
                  readout={`${scale.toFixed(2)}×`}
                  min={0.8}
                  max={3}
                  step={0.05}
                  onChange={setScale}
                  disabled={disabled}
                />
                <AdjustmentSlider
                  id="image-brightness"
                  label="Brightness"
                  value={brightness}
                  readout={`${brightness}%`}
                  min={60}
                  max={150}
                  onChange={(value) => {
                    setBrightness(value);
                    setActivePreset("custom");
                  }}
                  disabled={disabled}
                />
                <AdjustmentSlider
                  id="image-contrast"
                  label="Contrast"
                  value={contrast}
                  readout={`${contrast}%`}
                  min={60}
                  max={150}
                  onChange={(value) => {
                    setContrast(value);
                    setActivePreset("custom");
                  }}
                  disabled={disabled}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          px: { xs: 2, sm: 3 },
          py: 2,
          gap: 1.25,
          flexWrap: "wrap",
          justifyContent: "space-between",
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            maxWidth: { xs: "100%", sm: 290 },
            flexBasis: { xs: "100%", sm: "auto" },
          }}
          role="status"
          aria-live="polite"
        >
          {uploading
            ? "Uploading your edited image. Please keep this window open."
            : "After uploading, save the product to publish your image changes."}
        </Typography>
        <Stack
          direction="row"
          sx={{
            gap: 1,
            ml: "auto",
            width: { xs: "100%", sm: "auto" },
            "& > .MuiButton-root": { minWidth: 0 },
          }}
        >
          <Button onClick={onClose} disabled={uploading} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={disabled}
            startIcon={
              uploading ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <UploadOutlined />
              )
            }
            sx={{
              px: { xs: 2, sm: 2.5 },
              flex: { xs: 1, sm: "initial" },
              borderRadius: 1,
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            }}
          >
            {uploading ? "Uploading…" : "Apply & upload"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
