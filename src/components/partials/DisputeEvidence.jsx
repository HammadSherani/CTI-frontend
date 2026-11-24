'use client';

import { Icon } from '@iconify/react';

/** Thumbnails of the files attached to a dispute (images open full size in a new tab). */
export default function DisputeEvidence({ files, className = '' }) {
  if (!files?.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {files.map((file, i) => (
        <a key={file._id || i} href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
          {file.fileType === 'image' ? (
            <img
              src={file.fileUrl}
              alt={`Evidence ${i + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-90"
            />
          ) : (
            <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-primary-700 hover:bg-primary-50">
              <Icon icon="heroicons:document-text" className="w-4 h-4" /> View file
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
