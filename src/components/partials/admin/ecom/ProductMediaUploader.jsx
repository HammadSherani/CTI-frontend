"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";

/* Marks a drag as "re-ordering an image" so it is never mistaken for a file being dropped. */
const REORDER_TYPE = "application/x-product-image";

export const isFileDrag = (e) => {
  const types = Array.from(e.dataTransfer?.types || []);
  return types.includes("Files") && !types.includes(REORDER_TYPE);
};

/* ── Allowed formats, size and count — always visible ───────── */
function UploadRules({ rules }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
      <span className="font-semibold text-gray-600">Allowed:</span>
      {rules.extensions.map((ext) => (
        <span key={ext} className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 font-bold uppercase text-gray-700">
          {ext}
        </span>
      ))}
      <span>• max {rules.maxSizeMB}MB each • up to {rules.maxCount} {rules.noun}s</span>
    </div>
  );
}

function ErrorText({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-red-500 text-xs flex items-start gap-1 whitespace-pre-line">
      <Icon icon="mdi:alert-circle-outline" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
      {message}
    </p>
  );
}

/* ── Click-or-drop area ─────────────────────────────────────── */
function DropZone({ rules, onFiles, icon, hasError, children }) {
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOver(false);
      }}
      onDrop={(e) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        setOver(false);
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length) onFiles(files);
      }}
    >
      <label
        className={`flex flex-col items-center justify-center gap-1.5 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center focus-within:ring-2 focus-within:ring-primary-300 ${
          over
            ? "border-primary-500 bg-primary-50"
            : hasError
              ? "border-red-300 bg-red-50/40 hover:border-red-400"
              : "border-gray-200 hover:border-primary-400 hover:bg-primary-50/20"
        }`}
      >
        <Icon icon={icon} className={`w-8 h-8 ${over ? "text-primary-600" : "text-gray-400"}`} />
        <p className="text-xs font-semibold text-gray-700">
          {over ? `Drop to add ${rules.noun}s` : <>Drag &amp; drop {rules.noun}s here, or <span className="text-primary-600 underline">browse</span></>}
        </p>
        <input
          type="file"
          multiple
          accept={rules.accept}
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) onFiles(files);
            e.target.value = ""; // lets the same file be selected again
          }}
        />
      </label>
      {children}
    </div>
  );
}

function TileButton({ icon, label, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors ${className}`}
    >
      <Icon icon={icon} className="w-4 h-4" />
    </button>
  );
}

/* ── Images: add, drag to reorder, choose the main one, remove ── */
export function ImageUploader({ urls, rules, error, onFiles, onRemove, onMove }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="space-y-3">
      <UploadRules rules={rules} />

      {urls.length > 0 && (
        <>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {urls.map((url, i) => (
              <li
                key={url}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(REORDER_TYPE, String(i));
                  e.dataTransfer.effectAllowed = "move";
                  setDragIndex(i);
                }}
                onDragOver={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  setOverIndex(i);
                }}
                onDrop={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  onMove(dragIndex, i);
                  endDrag();
                }}
                onDragEnd={endDrag}
                className={`rounded-xl border-2 overflow-hidden bg-white cursor-grab active:cursor-grabbing transition-all ${
                  dragIndex === i ? "opacity-40" : ""
                } ${
                  overIndex === i && dragIndex !== i
                    ? "border-primary-500 ring-2 ring-primary-200"
                    : i === 0 ? "border-primary-400" : "border-gray-100"
                }`}
              >
                <div className="relative aspect-square bg-gray-50">
                  <img src={url} alt={`Product image ${i + 1}`} draggable={false} className="w-full h-full object-cover" />
                  <span
                    className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      i === 0 ? "bg-primary-600 text-white" : "bg-black/60 text-white"
                    }`}
                  >
                    {i === 0 ? "Main image" : i + 1}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 p-1 border-t border-gray-100 text-gray-600">
                  <TileButton icon="mdi:chevron-left" label="Move left" disabled={i === 0} onClick={() => onMove(i, i - 1)} />
                  <TileButton
                    icon={i === 0 ? "mdi:star" : "mdi:star-outline"}
                    label={i === 0 ? "This is the main image" : "Set as main image"}
                    disabled={i === 0}
                    onClick={() => onMove(i, 0)}
                    className={i === 0 ? "!opacity-100 text-amber-500" : "hover:text-amber-500"}
                  />
                  <TileButton icon="mdi:chevron-right" label="Move right" disabled={i === urls.length - 1} onClick={() => onMove(i, i + 1)} />
                  <TileButton icon="mdi:trash-can-outline" label="Remove image" onClick={() => onRemove(i)} className="text-red-500 hover:!bg-red-50" />
                </div>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-gray-400">
            Drag images to change their order, or use the arrows. The star makes an image the main one.
          </p>
        </>
      )}

      {urls.length < rules.maxCount && (
        <DropZone rules={rules} onFiles={onFiles} icon="mdi:image-plus-outline" hasError={Boolean(error)} />
      )}
      <ErrorText message={error} />
    </div>
  );
}

/* ── Videos: add and remove ─────────────────────────────────── */
export function VideoUploader({ urls, rules, error, getFile, onFiles, onRemove }) {
  return (
    <div className="space-y-3">
      <UploadRules rules={rules} />

      {urls.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {urls.map((url, i) => {
            const file = getFile(url);
            return (
              <li key={url} className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                <video src={url} className="w-full h-32 object-contain bg-gray-900" controls muted preload="metadata" />
                <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                  <span className="text-[11px] text-gray-500 truncate" title={file?.name}>
                    {file ? `${file.name} • ${(file.size / (1024 * 1024)).toFixed(1)}MB` : `Video ${i + 1}`}
                  </span>
                  <button type="button" onClick={() => onRemove(i)} aria-label="Remove video" title="Remove video" className="p-1 rounded-md text-red-500 hover:bg-red-50">
                    <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {urls.length < rules.maxCount && (
        <DropZone rules={rules} onFiles={onFiles} icon="mdi:video-plus-outline" hasError={Boolean(error)} />
      )}
      <ErrorText message={error} />
    </div>
  );
}
