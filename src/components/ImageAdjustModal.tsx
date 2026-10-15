"use client";

import { useEffect, useRef, useState, useCallback, type PointerEvent, type WheelEvent } from "react";
import { createPortal } from "react-dom";
import {
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Check,
  X,
  Move,
  Upload,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export type AspectType = "circle" | "portrait" | "landscape" | "square";

interface ImageAdjustModalProps {
  imageSrc: string;
  aspectType: AspectType;
  title?: string;
  onApply: (adjustedFile: File, previewUrl: string) => void;
  onCancel: () => void;
}

export function ImageAdjustModal({
  imageSrc,
  aspectType,
  title = "Adjust & Crop Image",
  onApply,
  onCancel,
}: ImageAdjustModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [zoom, setZoom] = useState<number>(1); // 1.0 = 100% fit, up to 3.0 = 300%
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({ x: 0, y: 0, panX: 0, panY: 0 });
  const [exporting, setExporting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while this overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Viewport display size inside modal
  const viewSize = { width: 320, height: 320 };

  // Crop frame dimensions inside viewport
  const cropBox = (() => {
    if (aspectType === "circle" || aspectType === "square") {
      const size = 250;
      return { width: size, height: size, x: (viewSize.width - size) / 2, y: (viewSize.height - size) / 2, radius: size / 2 };
    }
    if (aspectType === "portrait") {
      const w = 210;
      const h = 280; // 3:4
      return { width: w, height: h, x: (viewSize.width - w) / 2, y: (viewSize.height - h) / 2, radius: 12 };
    }
    // Landscape 16:9
    const w = 290;
    const h = 163;
    return { width: w, height: h, x: (viewSize.width - w) / 2, y: (viewSize.height - h) / 2, radius: 10 };
  })();

  // Safe Image Loading without CORS blocks
  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    const img = new Image();

    // Only set crossOrigin for external http(s) URLs, never for data: or blob:
    if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      if (cancelled) return;
      setImageElement(img);
      setPan({ x: 0, y: 0 });
      setZoom(1);
    };

    img.onerror = () => {
      if (cancelled) return;
      console.error("Image failed to load in adjuster:", imageSrc);
      setLoadError(true);
    };

    img.src = imageSrc;

    return () => {
      cancelled = true;
    };
  }, [imageSrc]);

  // Redraw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageElement) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== viewSize.width * dpr || canvas.height !== viewSize.height * dpr) {
      canvas.width = viewSize.width * dpr;
      canvas.height = viewSize.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, viewSize.width, viewSize.height);

    // Calculate base fit scale based on rotation
    const isRotated = rotation === 90 || rotation === 270;
    const imgW = isRotated ? imageElement.naturalHeight : imageElement.naturalWidth;
    const imgH = isRotated ? imageElement.naturalWidth : imageElement.naturalHeight;

    const scaleX = cropBox.width / (imgW || 1);
    const scaleY = cropBox.height / (imgH || 1);
    const baseFitScale = Math.max(scaleX, scaleY);
    const effectiveScale = baseFitScale * zoom;

    const cx = viewSize.width / 2;
    const cy = viewSize.height / 2;

    // Draw transformed image
    ctx.save();
    ctx.translate(cx + pan.x, cy + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(effectiveScale, effectiveScale);

    ctx.drawImage(
      imageElement,
      -imageElement.naturalWidth / 2,
      -imageElement.naturalHeight / 2,
      imageElement.naturalWidth,
      imageElement.naturalHeight,
    );
    ctx.restore();

    // Dark mask overlay with cutout
    ctx.save();
    ctx.fillStyle = "rgba(4, 9, 20, 0.74)";
    ctx.beginPath();
    ctx.rect(0, 0, viewSize.width, viewSize.height);

    if (aspectType === "circle") {
      ctx.arc(cx, cy, cropBox.radius, 0, Math.PI * 2, true);
    } else {
      const r = cropBox.radius;
      const x = cropBox.x;
      const y = cropBox.y;
      const w = cropBox.width;
      const h = cropBox.height;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }
    ctx.fill("evenodd");
    ctx.restore();

    // Border guideline around crop frame
    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#38bdf8";

    if (aspectType === "circle") {
      ctx.beginPath();
      ctx.arc(cx, cy, cropBox.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Subtle center guide crosshair
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy);
      ctx.lineTo(cx + 24, cy);
      ctx.moveTo(cx, cy - 24);
      ctx.lineTo(cx, cy + 24);
      ctx.stroke();
    } else {
      ctx.beginPath();
      const r = cropBox.radius;
      const x = cropBox.x;
      const y = cropBox.y;
      const w = cropBox.width;
      const h = cropBox.height;
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.rect(x, y, w, h);
      }
      ctx.stroke();

      // Rule of thirds lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x + w / 3, y);
      ctx.lineTo(x + w / 3, y + h);
      ctx.moveTo(x + (2 * w) / 3, y);
      ctx.lineTo(x + (2 * w) / 3, y + h);
      ctx.moveTo(x, y + h / 3);
      ctx.lineTo(x + w, y + h / 3);
      ctx.moveTo(x, y + (2 * h) / 3);
      ctx.lineTo(x + w, y + (2 * h) / 3);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }, [imageElement, zoom, pan, rotation, aspectType, cropBox, viewSize.width, viewSize.height]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Pointer dragging
  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const ratio = viewSize.width / (rect.width || viewSize.width);
    const dx = (e.clientX - dragStartRef.current.x) * ratio;
    const dy = (e.clientY - dragStartRef.current.y) * ratio;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
      setIsDragging(false);
    }
  };

  // Wheel zoom
  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((z) => Math.max(0.8, Math.min(3.5, z + delta)));
  };

  // Directional step shifts for precise button adjustment
  const shift = (dx: number, dy: number) => {
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Export cropped high-res image
  const handleApply = async () => {
    if (!imageElement) return;
    setExporting(true);

    try {
      let exportWidth = 600;
      let exportHeight = 600;
      if (aspectType === "portrait") {
        exportWidth = 600;
        exportHeight = 800;
      } else if (aspectType === "landscape") {
        exportWidth = 1200;
        exportHeight = 675;
      }

      const offscreen = document.createElement("canvas");
      offscreen.width = exportWidth;
      offscreen.height = exportHeight;
      const ctx = offscreen.getContext("2d");
      if (!ctx) throw new Error("Could not create offscreen context");

      // White background for clean export
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, exportWidth, exportHeight);

      const isRotated = rotation === 90 || rotation === 270;
      const imgW = isRotated ? imageElement.naturalHeight : imageElement.naturalWidth;
      const imgH = isRotated ? imageElement.naturalWidth : imageElement.naturalHeight;

      const scaleX = cropBox.width / (imgW || 1);
      const scaleY = cropBox.height / (imgH || 1);
      const baseFitScale = Math.max(scaleX, scaleY);
      const effectiveScale = baseFitScale * zoom;

      // Scale multiplier from preview to export resolution
      const exportRatio = exportWidth / cropBox.width;

      const ecx = exportWidth / 2;
      const ecy = exportHeight / 2;

      ctx.save();
      ctx.translate(ecx + pan.x * exportRatio, ecy + pan.y * exportRatio);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(effectiveScale * exportRatio, effectiveScale * exportRatio);

      ctx.drawImage(
        imageElement,
        -imageElement.naturalWidth / 2,
        -imageElement.naturalHeight / 2,
        imageElement.naturalWidth,
        imageElement.naturalHeight,
      );
      ctx.restore();

      offscreen.toBlob(
        (blob) => {
          if (!blob) {
            setExporting(false);
            return;
          }
          const file = new File([blob], `adjusted-${aspectType}-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          const previewUrl = URL.createObjectURL(blob);
          onApply(file, previewUrl);
        },
        "image/jpeg",
        0.92,
      );
    } catch (err) {
      console.error("Export failed", err);
      setExporting(false);
    }
  };

  if (!mounted) return null;

  const content = (
    <div className="imageAdjustOverlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="imageAdjustCard">
        <div className="imageAdjustHeader">
          <div className="imageAdjustTitle">
            <Crop size={18} />
            <h4>{title}</h4>
          </div>
          <button type="button" className="imageAdjustClose" onClick={onCancel} aria-label="Close adjuster">
            <X size={18} />
          </button>
        </div>

        <p className="imageAdjustHint">
          <Move size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
          <strong>Drag</strong> with mouse/touch or use <strong>Arrow buttons</strong> below to center the photo.
        </p>

        {loadError ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#f87171" }}>
            <p>Could not load the image for adjustment.</p>
            <button type="button" className="secondary" onClick={onCancel}>
              Go back
            </button>
          </div>
        ) : (
          <>
            <div className="imageAdjustCanvasWrapper">
              <canvas
                ref={canvasRef}
                className={`imageAdjustCanvas${isDragging ? " isDragging" : ""}`}
                style={{ width: viewSize.width, height: viewSize.height }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
              />
            </div>

            <div className="imageAdjustControls">
              {/* Zoom Slider */}
              <div className="imageAdjustZoomRow">
                <button
                  type="button"
                  className="adjustIconBtn"
                  title="Zoom Out (-)"
                  onClick={() => setZoom((z) => Math.max(0.8, z - 0.15))}
                >
                  <ZoomOut size={16} />
                </button>
                <input
                  type="range"
                  min="0.8"
                  max="3.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  aria-label="Image Zoom"
                  className="adjustZoomSlider"
                />
                <button
                  type="button"
                  className="adjustIconBtn"
                  title="Zoom In (+)"
                  onClick={() => setZoom((z) => Math.min(3.0, z + 0.15))}
                >
                  <ZoomIn size={16} />
                </button>
                <span style={{ fontSize: 11, minWidth: 38, textAlign: "right", color: "#38bdf8", fontWeight: 700 }}>
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Nudge Arrows & Actions */}
              <div className="imageAdjustNudgeRow">
                <div className="imageAdjustDpad" aria-label="Nudge image position">
                  <button type="button" className="adjustIconBtn" title="Move Left" onClick={() => shift(-15, 0)}>
                    <ArrowLeft size={14} />
                  </button>
                  <div className="imageAdjustDpadVertical">
                    <button type="button" className="adjustIconBtn dpadHalf" title="Move Up" onClick={() => shift(0, -15)}>
                      <ArrowUp size={12} />
                    </button>
                    <button type="button" className="adjustIconBtn dpadHalf" title="Move Down" onClick={() => shift(0, 15)}>
                      <ArrowDown size={12} />
                    </button>
                  </div>
                  <button type="button" className="adjustIconBtn" title="Move Right" onClick={() => shift(15, 0)}>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="imageAdjustSecondaryActions">
                  <button type="button" className="adjustSmallBtn" onClick={handleRotate} title="Rotate 90 degrees">
                    <RotateCw size={14} /> Rotate
                  </button>
                  <button type="button" className="adjustSmallBtn" onClick={handleReset} title="Reset pan & zoom">
                    <RefreshCw size={14} /> Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="imageAdjustFooter">
              <button type="button" className="secondary" onClick={onCancel} disabled={exporting}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={handleApply} disabled={exporting}>
                <Check size={16} /> {exporting ? "Applying..." : "Apply & Crop"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

interface ImageFieldWithAdjusterProps {
  label: string;
  id: string;
  aspectType: AspectType;
  currentImageUrl?: string | null;
  selectedFile: File | null;
  adjustedPreviewUrl: string | null;
  helpText?: string;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
}

export function ImageFieldWithAdjuster({
  label,
  id,
  aspectType,
  currentImageUrl,
  selectedFile,
  adjustedPreviewUrl,
  helpText,
  onImageChange,
}: ImageFieldWithAdjusterProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSrcForModal, setActiveSrcForModal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Derive preview from adjusted URL, current selected file, or existing server URL
  const displayPreview = adjustedPreviewUrl || (selectedFile ? URL.createObjectURL(selectedFile) : currentImageUrl);

  // When a file is picked from device
  const handleFilePicked = (file: File | null) => {
    if (!file) return;

    // Use FileReader for guaranteed local DataURL
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Immediately set the file in the form so it is selected
      onImageChange(file, dataUrl);
      // Open the adjuster automatically for instant alignment
      setActiveSrcForModal(dataUrl);
      setModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const openAdjusterForCurrent = () => {
    if (!displayPreview) return;
    setActiveSrcForModal(displayPreview);
    setModalOpen(true);
  };

  const handleApply = (file: File, previewUrl: string) => {
    onImageChange(file, previewUrl);
    setModalOpen(false);
  };

  const handleRemove = () => {
    onImageChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="imageFieldWithAdjuster">
      <label htmlFor={id} className="imageFieldLabel">{label}</label>

      {displayPreview ? (
        <div className="imagePreviewCard">
          <div className={`imagePreviewBox ${aspectType}`}>
            <img src={displayPreview} alt="Preview" className="imagePreviewImg" />
          </div>
          <div className="imagePreviewActions">
            <button
              type="button"
              className="adjustTriggerBtn primaryAction"
              onClick={openAdjusterForCurrent}
            >
              <Crop size={14} /> Adjust &amp; Crop
            </button>
            <button
              type="button"
              className="adjustTriggerBtn secondaryAction"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                  fileInputRef.current.click();
                }
              }}
            >
              <Upload size={14} /> Change Photo
            </button>
            {selectedFile && (
              <button
                type="button"
                className="adjustTriggerBtn deleteAction"
                onClick={handleRemove}
                title="Remove selected image"
              >
                <X size={14} /> Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="imageUploadDropzone"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
              fileInputRef.current.click();
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
                fileInputRef.current.click();
              }
            }
          }}
        >
          <Upload size={22} className="uploadIcon" />
          <span>Click to select {aspectType === "circle" ? "avatar or logo" : "portrait photo"}</span>
          <small>PNG, JPEG, or WebP up to 4 MB · Interactive crop &amp; adjustment tool</small>
        </div>
      )}

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={(e) => handleFilePicked(e.target.files?.[0] || null)}
      />

      {helpText && <span className="formHelp">{helpText}</span>}

      {modalOpen && activeSrcForModal && (
        <ImageAdjustModal
          imageSrc={activeSrcForModal}
          aspectType={aspectType}
          title={`Adjust ${label}`}
          onApply={handleApply}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
