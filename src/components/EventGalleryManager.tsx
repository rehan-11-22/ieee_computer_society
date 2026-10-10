"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { EventGalleryImage } from "@/lib/types";

type Notify = (msg: string, type?: "success" | "error" | "info") => void;

export function EventGalleryManager({ eventId, notify, onUnauthorized }: { eventId: string; notify: Notify; onUnauthorized: () => void }) {
  const [gallery, setGallery] = useState<EventGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [descriptions, setDescriptions] = useState<Record<number, string>>({});
  const selectedFiles = files ? Array.from(files) : [];

  const loadGallery = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/gallery`, { cache: "no-store" });
      const data = await response.json().catch(() => []);
      if (!response.ok) return notify(data.error || "Failed to load gallery", "error");
      setGallery(data);
    } catch {
      notify("Failed to load gallery", "error");
    } finally {
      setLoading(false);
    }
  }, [eventId, notify]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/gallery`, { cache: "no-store" });
        const data = await response.json().catch(() => []);
        if (cancelled) return;
        if (!response.ok) {
          notify(data.error || "Failed to load gallery", "error");
          return;
        }
        setGallery(data);
      } catch {
        if (!cancelled) notify("Failed to load gallery", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, notify]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const form = new FormData();
        form.set("image", file);
        form.set("description", descriptions[i] || "");
        const response = await fetch(`/api/events/${eventId}/gallery`, { method: "POST", body: form });
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) return onUnauthorized();
        if (!response.ok) {
          notify(data.error || `Failed to upload ${file.name}`, "error");
          continue;
        }
        notify(`Uploaded ${file.name}`);
      }
      await loadGallery();
      setFiles(null);
      setDescriptions({});
      const input = document.getElementById("event-gallery-images") as HTMLInputElement | null;
      if (input) input.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/gallery/${imageId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) return onUnauthorized();
      if (!response.ok) return notify(data.error || "Failed to delete image", "error");
      notify("Image deleted");
      await loadGallery();
    } catch {
      notify("Failed to delete image", "error");
    }
  };

  return (
    <section className="galleryManager">
      <div className="galleryManagerHead">
        <div>
          <div className="eyebrow">Event Media</div>
          <h3>Gallery Images</h3>
        </div>
        <span className="adminCount">{gallery.length}</span>
      </div>
      <form onSubmit={handleUpload} className="galleryUploadForm">
        <label className="galleryFileDrop" htmlFor="event-gallery-images">
          <strong>Select event photos</strong>
          <span>PNG, JPEG, or WebP. You can select multiple images at once.</span>
          <input
            id="event-gallery-images"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(event) => {
              setFiles(event.target.files);
              setDescriptions({});
            }}
          />
        </label>
        {selectedFiles.length > 0 && (
          <div className="galleryUploadList">
            {selectedFiles.map((file, index) => (
              <label key={`${file.name}-${file.lastModified}-${file.size}`}>
                <span>{file.name}</span>
                <input
                  maxLength={240}
                  value={descriptions[index] || ""}
                  onChange={(event) => setDescriptions((current) => ({ ...current, [index]: event.target.value }))}
                  placeholder="Short description or caption"
                />
              </label>
            ))}
          </div>
        )}
        <div className="galleryUploadActions">
          <span>{selectedFiles.length > 0 ? `${selectedFiles.length} image${selectedFiles.length === 1 ? "" : "s"} selected` : "No images selected"}</span>
          <button type="submit" disabled={uploading || selectedFiles.length === 0} className="primary">
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>
      </form>
      {loading ? (
        <p className="adminEmpty">Loading gallery...</p>
      ) : gallery.length === 0 ? (
        <p className="adminEmpty">No gallery images yet.</p>
      ) : (
        <div className="galleryGrid">
          {gallery.map((img) => (
            <article key={img.id} className="galleryItem">
              <div className="galleryImageFrame">
                <Image src={img.imageUrl} alt={img.description || "Event gallery image"} fill unoptimized loading="lazy" sizes="(max-width: 600px) 100vw, 33vw" style={{ objectFit: "cover" }} />
              </div>
              {img.description && <p className="galleryCaption">{img.description}</p>}
              <button type="button" className="dangerButton" onClick={() => void handleDelete(img.id)}>
                Delete
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
