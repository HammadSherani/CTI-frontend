// Invoice files are stored as plain downloads (no PDF type), so the browser cannot show them from
// their address. They are fetched and handed to the browser as a PDF.
import { toast } from 'react-toastify';

/** Why this file cannot be used as an invoice, or null. Only .pdf files are accepted. */
export function pdfProblem(file) {
  if (!file) return 'Please select a PDF file.';
  if (!/\.pdf$/i.test(file.name)) return 'Only PDF files (.pdf) are allowed.';
  if (file.size > 10 * 1024 * 1024) return 'The file must be 10 MB or smaller.';
  return null;
}

/** A temporary address that the browser treats as a PDF. Release it with URL.revokeObjectURL. */
export async function pdfLink(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`File answered ${res.status}`);
  return URL.createObjectURL(new Blob([await res.arrayBuffer()], { type: 'application/pdf' }));
}

export async function downloadInvoice(url, name = 'invoice') {
  try {
    const anchor = document.createElement('a');
    anchor.href = await pdfLink(url);
    anchor.download = `${String(name).replace(/[^\w-]+/g, '-')}.pdf`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 60 * 1000);
  } catch {
    toast.error('Could not download the invoice. Please try again.');
  }
}
