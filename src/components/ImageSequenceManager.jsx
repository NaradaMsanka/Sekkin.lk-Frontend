import React, { useState, useRef } from "react";
import {
  Box, Typography, Button, Stack, Card, IconButton,
  Tooltip, Chip, Alert, Paper
} from "@mui/material";
import {
  CloudUpload, ArrowBack, ArrowForward, Star, StarBorder,
  Delete, Edit, PhotoLibrary, AddPhotoAlternate
} from "@mui/icons-material";
import ImageEditorModal from "./ImageEditorModal";

export default function ImageSequenceManager({
  images = [],
  onChange,
  maxImages = 6
}) {
  const fileInputRef = useRef(null);

  // Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null); // null = new image, number = re-editing existing index

  // Trigger File Picker
  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCurrentImageSrc(reader.result);
      setEditingIndex(null); // new image
      setEditorOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be picked again if needed
    e.target.value = "";
  };

  // When image editor confirms the edited image
  const handleEditorApply = (savedUrl) => {
    let updated;
    if (editingIndex !== null && editingIndex >= 0 && editingIndex < images.length) {
      // Replaced existing image at that exact sequence index
      updated = [...images];
      updated[editingIndex] = savedUrl;
    } else {
      // Add as new image in sequence
      updated = [...images, savedUrl];
    }

    const primaryUrl = updated.length > 0 ? updated[0] : "";
    onChange(updated, primaryUrl);
  };

  // Re-edit an existing image
  const handleReEdit = (index) => {
    setCurrentImageSrc(images[index]);
    setEditingIndex(index);
    setEditorOpen(true);
  };

  // Reordering Sequence: Move Earlier
  const handleMoveEarlier = (index) => {
    if (index === 0) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onChange(updated, updated[0]);
  };

  // Reordering Sequence: Move Later
  const handleMoveLater = (index) => {
    if (index >= images.length - 1) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onChange(updated, updated[0]);
  };

  // Set as Primary (index 0)
  const handleMakePrimary = (index) => {
    if (index === 0) return;
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected); // Put at index 0
    onChange(updated, updated[0]);
  };

  // Delete from sequence
  const handleDelete = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated, updated.length > 0 ? updated[0] : "");
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleSelectFile}
      />

      {/* Header Info */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PhotoLibrary fontSize="small" sx={{ color: "primary.main" }} />
          Product Image Sequence ({images.length} / {maxImages})
        </Typography>
        <Typography variant="caption" color="text.secondary">
          First image (#1) is the main store display cover
        </Typography>
      </Box>

      {/* Sequence Gallery Grid */}
      <Stack direction="row" spacing={1.5} sx={{ overflowX: "auto", pb: 1.5, minHeight: 140, alignItems: "flex-start" }}>
        {images.map((imgUrl, idx) => {
          const isPrimary = idx === 0;

          return (
            <Paper
              key={`${imgUrl}-${idx}`}
              elevation={isPrimary ? 3 : 1}
              sx={{
                width: 130,
                minWidth: 130,
                borderRadius: 3,
                overflow: "hidden",
                border: "2px solid",
                borderColor: isPrimary ? "#C9956A" : "rgba(0,0,0,0.1)",
                bgcolor: "#FFFFFF",
                position: "relative",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                  borderColor: isPrimary ? "#C9956A" : "primary.main"
                }
              }}
            >
              {/* Sequence Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  bgcolor: isPrimary ? "#C9956A" : "rgba(0,0,0,0.65)",
                  color: "white",
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 1.5,
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.3
                }}
              >
                {isPrimary && <Star sx={{ fontSize: 12, color: "#FFE87C" }} />}
                #{idx + 1} {isPrimary ? "MAIN" : ""}
              </Box>

              {/* Image Thumbnail */}
              <Box
                component="img"
                src={imgUrl}
                alt={`Product angle ${idx + 1}`}
                sx={{
                  width: "100%",
                  height: 100,
                  objectFit: "contain",
                  bgcolor: "#FFFFFF",
                  p: 0.5,
                  display: "block"
                }}
              />

              {/* Sequence Controls Bar */}
              <Box
                sx={{
                  bgcolor: "#FAF8F5",
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  py: 0.5,
                  px: 0.5
                }}
              >
                {/* Move Left */}
                <Tooltip title="Move Earlier in Sequence">
                  <span>
                    <IconButton
                      size="small"
                      disabled={idx === 0}
                      onClick={() => handleMoveEarlier(idx)}
                      sx={{ p: 0.4 }}
                    >
                      <ArrowBack sx={{ fontSize: 15 }} />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Edit in Studio */}
                <Tooltip title="Edit / Re-crop Image">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleReEdit(idx)}
                    sx={{ p: 0.4 }}
                  >
                    <Edit sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>

                {/* Set as Primary */}
                {!isPrimary && (
                  <Tooltip title="Set as Main Cover Image">
                    <IconButton
                      size="small"
                      onClick={() => handleMakePrimary(idx)}
                      sx={{ p: 0.4, color: "#C9956A" }}
                    >
                      <StarBorder sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Move Right */}
                <Tooltip title="Move Later in Sequence">
                  <span>
                    <IconButton
                      size="small"
                      disabled={idx >= images.length - 1}
                      onClick={() => handleMoveLater(idx)}
                      sx={{ p: 0.4 }}
                    >
                      <ArrowForward sx={{ fontSize: 15 }} />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Delete */}
                <Tooltip title="Delete Image">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(idx)}
                    sx={{ p: 0.4 }}
                  >
                    <Delete sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          );
        })}

        {/* Upload Button Box */}
        {images.length < maxImages && (
          <Paper
            elevation={0}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              width: 130,
              minWidth: 130,
              height: 135,
              borderRadius: 3,
              border: "2px dashed rgba(201,149,106,0.5)",
              bgcolor: "rgba(201,149,106,0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "rgba(201,149,106,0.12)",
                borderColor: "#C9956A",
                transform: "translateY(-2px)"
              }
            }}
          >
            <AddPhotoAlternate sx={{ fontSize: 36, color: "primary.main", mb: 0.5 }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: "primary.main", textAlign: "center", px: 1 }}>
              + Add Image & Edit
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.62rem" }}>
              PNG, JPG, WEBP
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* Interactive Image Editor Modal */}
      <ImageEditorModal
        open={editorOpen}
        imageSrc={currentImageSrc}
        onApply={handleEditorApply}
        onClose={() => setEditorOpen(false)}
      />
    </Box>
  );
}
