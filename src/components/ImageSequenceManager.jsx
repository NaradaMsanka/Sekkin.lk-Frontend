import { useState, useRef } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddPhotoAlternateOutlined,
  DeleteOutlined,
  EditOutlined,
  StarBorderOutlined,
} from "@mui/icons-material";
import ImageEditorModal from "./ImageEditorModal";
import { resolveImageUrl } from "../services/api";

export default function ImageSequenceManager({
  images = [],
  onChange,
  maxImages = 6,
}) {
  const fileInputRef = useRef(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [fileError, setFileError] = useState("");

  const handleSelectFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      ) ||
      file.size > 15 * 1024 * 1024
    ) {
      setFileError("Choose a JPEG, PNG, WebP, or GIF image up to 15 MB.");
      return;
    }
    if (images.length >= maxImages) return;
    setFileError("");
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentImageSrc(reader.result);
      setEditingIndex(null);
      setEditorOpen(true);
    };
    reader.onerror = () =>
      setFileError(
        "This file could not be opened. Please choose another image.",
      );
    reader.readAsDataURL(file);
  };

  const handleEditorApply = (url) => {
    const updated = [...images];
    if (
      editingIndex !== null &&
      editingIndex >= 0 &&
      editingIndex < images.length
    )
      updated[editingIndex] = url;
    else updated.push(url);
    onChange(updated, updated[0] || "");
  };

  const handleReEdit = (index) => {
    setFileError("");
    setCurrentImageSrc(images[index]);
    setEditingIndex(index);
    setEditorOpen(true);
  };

  const moveImage = (index, change) => {
    const target = index + change;
    if (target < 0 || target >= images.length) return;
    const updated = [...images];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated, updated[0]);
  };

  const makeCover = (index) => {
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    onChange(updated, updated[0]);
  };

  const removeImage = (index) => {
    const updated = images.filter((_, imageIndex) => imageIndex !== index);
    onChange(updated, updated[0] || "");
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleSelectFile}
        style={{ display: "none" }}
        aria-label="Choose product image"
      />
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mb: 0.75,
        }}
      >
        <Typography component="h3" variant="body2" sx={{ fontWeight: 600 }}>
          Product images
        </Typography>
        <Chip
          label={`${images.length} / ${maxImages}`}
          size="small"
          sx={{ bgcolor: "#F1F3F6", color: "text.secondary", height: 25 }}
        />
      </Stack>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        The first image is your product cover. Save the product to publish
        gallery changes.
      </Typography>
      {fileError && (
        <Alert severity="error" onClose={() => setFileError("")} sx={{ mb: 2 }}>
          {fileError}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          py: 0.75,
          px: 0.5,
          mx: -0.5,
        }}
        aria-label="Product image gallery"
      >
        {images.map((url, index) => (
          <Box
            key={`${url}-${index}`}
            sx={{
              width: 180,
              flexShrink: 0,
              border: "1px solid",
              borderColor: index === 0 ? "#D7B4BF" : "divider",
              borderRadius: 1.5,
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ position: "relative", height: 144, p: 1 }}>
              <Box
                component="img"
                src={resolveImageUrl(url)}
                alt={`Product image ${index + 1}${index === 0 ? ", cover image" : ""}`}
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              {index === 0 && (
                <Chip
                  label="Cover image"
                  size="small"
                  sx={{
                    position: "absolute",
                    left: 8,
                    top: 8,
                    bgcolor: "#F8EEF1",
                    color: "primary.main",
                    height: 24,
                  }}
                />
              )}
            </Box>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                gap: 0.25,
                px: 0.75,
                py: 0.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                size="small"
                startIcon={<EditOutlined sx={{ fontSize: 17 }} />}
                onClick={() => handleReEdit(index)}
                aria-label={`Edit product image ${index + 1}`}
                sx={{ px: 1, minWidth: 0 }}
              >
                Edit
              </Button>
              <Box sx={{ display: "flex" }}>
                {index !== 0 && (
                  <Tooltip title="Set as cover">
                    <IconButton
                      size="small"
                      onClick={() => makeCover(index)}
                      aria-label={`Set image ${index + 1} as cover`}
                      sx={{ color: "text.secondary" }}
                    >
                      <StarBorderOutlined sx={{ fontSize: 19 }} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Remove from gallery">
                  <IconButton
                    size="small"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove product image ${index + 1}`}
                    sx={{
                      color: "text.secondary",
                      "&:hover": { color: "error.main", bgcolor: "#FCEEF0" },
                    }}
                  >
                    <DeleteOutlined sx={{ fontSize: 19 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                gap: 0.25,
                px: 0.5,
                py: 0.5,
                bgcolor: "#FAFBFC",
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                size="small"
                color="inherit"
                disabled={index === 0}
                onClick={() => moveImage(index, -1)}
                aria-label={`Move image ${index + 1} earlier`}
                sx={{ minWidth: 0, px: 0.75, fontSize: "0.8125rem" }}
              >
                Earlier
              </Button>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {index + 1}
              </Typography>
              <Button
                size="small"
                color="inherit"
                disabled={index === images.length - 1}
                onClick={() => moveImage(index, 1)}
                aria-label={`Move image ${index + 1} later`}
                sx={{ minWidth: 0, px: 0.75, fontSize: "0.8125rem" }}
              >
                Later
              </Button>
            </Stack>
          </Box>
        ))}
        {images.length < maxImages && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Add product image"
            sx={{
              width: images.length ? 180 : "100%",
              flexShrink: 0,
              minHeight: images.length ? 240 : 160,
              p: 2,
              border: "1px dashed #C9CFD9",
              borderRadius: 1.5,
              bgcolor: "#FAFBFC",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              "&:hover": { bgcolor: "#F8EEF1", borderColor: "primary.main" },
            }}
          >
            <Box
              component="span"
              sx={{
                display: "grid",
                placeItems: "center",
                width: 44,
                height: 44,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                bgcolor: "background.paper",
                color: "primary.main",
              }}
            >
              <AddPhotoAlternateOutlined />
            </Box>
            <Typography
              component="span"
              variant="body2"
              sx={{ fontWeight: 500 }}
            >
              {images.length ? "Add image" : "Add product image"}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                fontWeight: 400,
              }}
            >
              JPEG, PNG, WebP or GIF
              <br />
              Up to 15 MB per image
            </Typography>
          </Button>
        )}
      </Box>
      <ImageEditorModal
        open={editorOpen}
        imageSrc={currentImageSrc}
        onApply={handleEditorApply}
        onClose={() => setEditorOpen(false)}
      />
    </Box>
  );
}
