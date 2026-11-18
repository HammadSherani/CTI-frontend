"use client"

// Files picked to send, shown above the input like WhatsApp: real thumbnails for images/videos,
// an icon card for documents, remove buttons, and a "+" tile to add more.
import React, { useEffect, useMemo, useRef } from 'react';
import { Icon } from '@iconify/react';

const MAX_FILES = 5;

const fileIcon = (name = '') => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return { icon: 'mdi:file-pdf-box', color: 'text-red-500' };
    if (['doc', 'docx'].includes(ext)) return { icon: 'mdi:file-word-box', color: 'text-blue-600' };
    if (['xls', 'xlsx'].includes(ext)) return { icon: 'mdi:file-excel-box', color: 'text-green-600' };
    if (['zip', 'rar', '7z'].includes(ext)) return { icon: 'mdi:folder-zip', color: 'text-yellow-600' };
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return { icon: 'mdi:music', color: 'text-pink-500' };
    return { icon: 'mdi:file-document-outline', color: 'text-gray-500' };
};

const fmtSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AttachmentTray({ files, onRemove, onClear, onAddMore }) {
    const addInputRef = useRef(null);

    // Local preview URLs for images/videos (freed when the selection changes)
    const previews = useMemo(
        () => files.map((f) => (f.type.startsWith('image/') || f.type.startsWith('video/') ? URL.createObjectURL(f) : null)),
        [files]
    );
    useEffect(() => () => previews.forEach((u) => u && URL.revokeObjectURL(u)), [previews]);

    if (!files.length) return null;
    const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);

    return (
        <div className="border-t bg-gray-50 px-3 pt-2 pb-2">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">
                    {files.length} {files.length === 1 ? 'file' : 'files'} selected · {fmtSize(totalSize)}
                </span>
                <button type="button" onClick={onClear} className="text-xs font-medium text-gray-500 hover:text-red-500">
                    Clear all
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                {files.map((file, index) => {
                    const url = previews[index];
                    const isImage = file.type.startsWith('image/');
                    const isVideo = file.type.startsWith('video/');
                    const icon = fileIcon(file.name);
                    return (
                        <div
                            key={`${file.name}-${file.size}-${index}`}
                            className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm group"
                            title={`${file.name} (${fmtSize(file.size)})`}
                        >
                            {isImage && url && <img src={url} alt={file.name} className="w-full h-full object-cover" />}
                            {isVideo && url && (
                                <>
                                    <video src={url} muted playsInline preload="metadata" className="w-full h-full object-cover bg-black" />
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <span className="w-7 h-7 rounded-full bg-black/55 flex items-center justify-center">
                                            <Icon icon="mdi:play" width={18} className="text-white ml-0.5" />
                                        </span>
                                    </span>
                                </>
                            )}
                            {!isImage && !isVideo && (
                                <div className="w-full h-full flex flex-col items-center justify-center px-1 text-center">
                                    <Icon icon={icon.icon} width={30} className={icon.color} />
                                    <span className="text-[10px] leading-tight text-gray-700 line-clamp-2 break-all mt-0.5">{file.name}</span>
                                </div>
                            )}

                            {/* size label on media */}
                            {(isImage || isVideo) && (
                                <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent text-[10px] text-white px-1 pt-2 pb-0.5 truncate">
                                    {fmtSize(file.size)}
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center"
                                aria-label={`Remove ${file.name}`}
                            >
                                <Icon icon="mdi:close" width={13} />
                            </button>
                        </div>
                    );
                })}

                {files.length < MAX_FILES && (
                    <button
                        type="button"
                        onClick={() => addInputRef.current?.click()}
                        className="shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 hover:text-primary-500 text-gray-400 flex flex-col items-center justify-center text-[11px]"
                        aria-label="Add more files"
                    >
                        <Icon icon="mdi:plus" width={24} />
                        Add
                    </button>
                )}
                <input
                    ref={addInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,*"
                    className="hidden"
                    onChange={(e) => {
                        onAddMore(Array.from(e.target.files || []));
                        e.target.value = '';
                    }}
                />
            </div>
        </div>
    );
}
