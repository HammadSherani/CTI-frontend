"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const TABS = ["export", "import", "history"];

const CSV_COLUMN_DOCS = [
  { col: "title",               req: true,  note: "Product name (max 300 chars)" },
  { col: "short_description",   req: false, note: "Short product summary (max 500 chars)" },
  { col: "description",         req: true,  note: "Full product description" },
  { col: "category",            req: true,  note: "Must match an existing category name exactly" },
  { col: "sub_category",        req: false, note: "Must match an existing subcategory name" },
  { col: "brand",               req: false, note: "Must match an existing brand name" },
  { col: "model_number",        req: true,  note: "Unique identifier — groups multiple variant rows into one product" },
  { col: "barcode",             req: false, note: "Auto-generated if empty" },
  { col: "tags",                req: false, note: "Pipe-separated: electronics|gaming|premium" },
  { col: "warranty_type",       req: false, note: '"yes" or "no" (default: no)' },
  { col: "warranty_months",     req: false, note: "Number of warranty months (only if warranty_type=yes)" },
  { col: "product_images",      req: false, note: "Pipe-separated image URLs" },
  { col: "product_videos",      req: false, note: "Pipe-separated video URLs" },
  { col: "variant_sku",         req: false, note: "Auto-generated if empty" },
  { col: "variant_price",       req: true,  note: "Seller base price (≥ 0)" },
  { col: "variant_stock",       req: true,  note: "Stock quantity (≥ 0)" },
  { col: "variant_discount_pct",req: false, note: "Discount percentage 0–89" },
  { col: "variant_is_default",  req: false, note: '"true" for the primary variant' },
  { col: "variant_images",      req: false, note: "Pipe-separated variant-specific image URLs" },
  { col: "variant_attributes",  req: false, note: 'JSON: [{"name":"Color","value":"Red","colorHex":"#FF0000"}]' },
  { col: "variant_specs",       req: false, note: 'JSON: [{"name":"Weight","value":"200g"}]' },
];

/* ══════════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════════ */
function StatusBadge({ status }) {
  const map = {
    valid:     { bg: "bg-emerald-100", text: "text-emerald-700", label: "Valid" },
    invalid:   { bg: "bg-red-100",     text: "text-red-700",     label: "Invalid" },
    duplicate: { bg: "bg-amber-100",   text: "text-amber-700",   label: "Duplicate" },
    success:   { bg: "bg-emerald-100", text: "text-emerald-700", label: "Success" },
    partial:   { bg: "bg-amber-100",   text: "text-amber-700",   label: "Partial" },
    failed:    { bg: "bg-red-100",     text: "text-red-700",     label: "Failed" },
  };
  const m = map[status] || map.invalid;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${m.bg} ${m.text}`}>
      {m.label}
    </span>
  );
}

/* ══════════════════════════════════════════
   FILE DROP ZONE
══════════════════════════════════════════ */
function DropZone({ onFile, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handle = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      toast.error("Only CSV files are accepted");
      return;
    }
    onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files?.[0]); }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all
        ${dragging  ? "border-violet-400 bg-violet-50"  : "border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/40"}
        ${disabled  ? "opacity-50 pointer-events-none"  : ""}
      `}
    >
      <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
        <Icon icon="solar:upload-bold-duotone" className="w-8 h-8 text-violet-600" />
      </div>
      <p className="text-base font-bold text-gray-800 mb-1">
        {dragging ? "Drop it here!" : "Drag & drop your CSV file"}
      </p>
      <p className="text-sm text-gray-500">or click to browse  ·  only .csv files accepted</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   PREVIEW TABLE
══════════════════════════════════════════ */
function PreviewTable({ products }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-400">Status</th>
            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-400">Model #</th>
            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-400">Title</th>
            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-400">Category</th>
            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-400">Brand</th>
            <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-400">Variants</th>
            <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-400">Issues</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((p) => (
            <tr key={p.modelNumber} className={`${p.status !== "valid" ? "bg-red-50/30" : ""}`}>
              <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.modelNumber}</td>
              <td className="px-4 py-3 font-semibold text-gray-800 max-w-[200px] truncate">{p.title}</td>
              <td className="px-4 py-3 text-gray-600">{p.category || "—"}</td>
              <td className="px-4 py-3 text-gray-600">{p.brand || "—"}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                  {p.variantCount}
                </span>
              </td>
              <td className="px-4 py-3">
                {p.errors?.length > 0 ? (
                  <ul className="list-none space-y-0.5">
                    {p.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                        <Icon icon="solar:danger-triangle-bold" className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {e}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-emerald-500 flex items-center gap-1">
                    <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                    Ready to import
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════
   HISTORY ROW (expandable)
══════════════════════════════════════════ */
function HistoryRow({ record }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <td className="px-4 py-3 text-sm text-gray-500">{moment(record.createdAt).format("DD MMM YYYY, HH:mm")}</td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800 max-w-[180px] truncate">{record.fileName}</td>
        <td className="px-4 py-3 text-center text-sm text-gray-600">{record.totalProducts}</td>
        <td className="px-4 py-3 text-center">
          <span className="text-emerald-600 font-bold">{record.imported}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-red-500 font-bold">{record.skipped}</span>
        </td>
        <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
        <td className="px-4 py-3 text-center">
          <Icon
            icon={open ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"}
            className="w-4 h-4 text-gray-400"
          />
        </td>
      </tr>
      {open && record.errors?.length > 0 && (
        <tr>
          <td colSpan={7} className="px-4 pb-4">
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-xs font-black uppercase tracking-wider text-red-400 mb-2">
                Import Errors ({record.errors.length})
              </p>
              <div className="space-y-1">
                {record.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-600">
                    <Icon icon="solar:danger-triangle-bold" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span className="font-mono mr-2 text-red-400">{e.modelNumber}</span>
                    {e.reason}
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ImportExportPage() {
  const router = useRouter();
  const { token } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState("export");

  /* export */
  const [exporting, setExporting]           = useState(false);
  const [productCount, setProductCount]     = useState(null);

  /* import */
  const [importStep, setImportStep]         = useState("upload"); // upload | previewing | preview | importing | done
  const [csvFile, setCsvFile]               = useState(null);
  const [previewData, setPreviewData]       = useState(null);
  const [importResult, setImportResult]     = useState(null);

  /* history */
  const [history, setHistory]               = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [histPagination, setHistPagination] = useState(null);
  const [histPage, setHistPage]             = useState(1);

  const headers = { Authorization: `Bearer ${token}` };

  /* ── Fetch product count on Export tab ── */
  useEffect(() => {
    if (activeTab !== "export" || !token) return;
    axiosInstance.get("/seller/product?limit=1", { headers })
      .then(({ data }) => setProductCount(data.pagination?.totalItems ?? 0))
      .catch(() => {});
  }, [activeTab, token]);

  /* ── Fetch history on History tab ── */
  useEffect(() => {
    if (activeTab !== "history" || !token) return;
    setHistoryLoading(true);
    axiosInstance.get(`/seller/product/import-history?page=${histPage}&limit=10`, { headers })
      .then(({ data }) => {
        setHistory(data.data || []);
        setHistPagination(data.pagination || null);
      })
      .catch(() => toast.error("Failed to load import history"))
      .finally(() => setHistoryLoading(false));
  }, [activeTab, token, histPage]);

  /* ── Export ── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await axiosInstance.get("/seller/product/export-csv", {
        headers,
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  /* ── Sample CSV ── */
  const handleSample = async () => {
    try {
      const res = await axiosInstance.get("/seller/product/sample-csv", {
        headers,
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "sample-products.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Sample CSV downloaded");
    } catch {
      toast.error("Failed to download sample CSV");
    }
  };

  /* ── Preview ── */
  const handlePreview = async (file) => {
    setCsvFile(file);
    setImportStep("previewing");
    try {
      const fd = new FormData();
      fd.append("csv", file);
      const { data } = await axiosInstance.post("/seller/product/import-preview", fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        setPreviewData(data);
        setImportStep("preview");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Preview failed");
      setImportStep("upload");
    }
  };

  /* ── Confirm Import ── */
  const handleConfirmImport = async () => {
    if (!csvFile) return;
    setImportStep("importing");
    try {
      const fd = new FormData();
      fd.append("csv", csvFile);
      const { data } = await axiosInstance.post("/seller/product/import-csv", fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setImportResult(data);
      setImportStep("done");
      /* Refresh history badge count */
    } catch (err) {
      toast.error(err?.response?.data?.message || "Import failed");
      setImportStep("preview");
    }
  };

  /* ── Reset import flow ── */
  const resetImport = () => {
    setCsvFile(null);
    setPreviewData(null);
    setImportResult(null);
    setImportStep("upload");
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#F8FAFB]">

      {/* ── Page Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/seller/product")}
            className="p-2 bg-white border border-gray-100 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
          >
            <Icon icon="solar:arrow-left-bold" className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Import / Export</h1>
            <p className="text-gray-400 text-sm mt-0.5">Bulk manage your product catalogue</p>
          </div>
        </div>
        <button
          onClick={handleSample}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-colors"
        >
          <Icon icon="solar:file-download-bold-duotone" className="w-4 h-4" />
          Download Sample CSV
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 w-fit">
        {[
          { id: "export",  label: "Export",  icon: "solar:export-bold-duotone"   },
          { id: "import",  label: "Import",  icon: "solar:import-bold-duotone"   },
          { id: "history", label: "History", icon: "solar:history-bold-duotone"  },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.id === "import") resetImport(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon icon={tab.icon} className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════
          EXPORT TAB
      ══════════════════ */}
      {activeTab === "export" && (
        <div className="space-y-6">
          {/* Action card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Icon icon="solar:file-download-bold-duotone" className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-black text-gray-900 mb-1">Export Your Products</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Download a complete CSV of all your products including every variant, attribute, spec, image URL,
                  pricing, inventory, category, and warranty information.
                </p>
                {productCount !== null && (
                  <p className="text-sm text-violet-600 font-bold mt-2">
                    {productCount} product{productCount !== 1 ? "s" : ""} will be included
                  </p>
                )}
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-md shadow-emerald-500/20"
              >
                {exporting
                  ? <><Icon icon="svg-spinners:180-ring-with-bg" className="w-4 h-4" /> Exporting…</>
                  : <><Icon icon="solar:file-download-bold-duotone" className="w-4 h-4" /> Export All Products</>
                }
              </button>
            </div>
          </div>

          {/* Round-trip info */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-700 mb-1">Perfect Round-Trip Fidelity</p>
                <p className="text-sm text-blue-600">
                  Export → Delete → Import will restore your products exactly as they were: all variants, attributes, specs, images, pricing, and inventory preserved.
                </p>
              </div>
            </div>
          </div>

          {/* CSV column reference */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <Icon icon="solar:document-text-bold-duotone" className="w-5 h-5 text-gray-400" />
              <h3 className="font-bold text-gray-900">CSV Column Reference</h3>
              <span className="text-xs text-gray-400 ml-2">— one row per variant; multiple rows share model_number for the same product</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-gray-400 w-48">Column</th>
                    <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-gray-400 w-16">Required</th>
                    <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-gray-400">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {CSV_COLUMN_DOCS.map((col) => (
                    <tr key={col.col} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-mono text-xs text-violet-600 font-bold">{col.col}</td>
                      <td className="px-4 py-2.5">
                        {col.req
                          ? <span className="text-[11px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full">Required</span>
                          : <span className="text-[11px] bg-gray-100 text-gray-400 font-semibold px-2 py-0.5 rounded-full">Optional</span>
                        }
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">{col.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════
          IMPORT TAB
      ══════════════════ */}
      {activeTab === "import" && (
        <div className="space-y-6">

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {["Upload", "Preview", "Import"].map((s, i) => {
              const stepMap = { upload: 0, previewing: 0, preview: 1, importing: 2, done: 2 };
              const current = stepMap[importStep] ?? 0;
              const done    = i < current;
              const active  = i === current;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    active ? "bg-violet-600 text-white" :
                    done   ? "bg-violet-100 text-violet-700" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                      active ? "bg-white/20 text-white" : done ? "bg-violet-200 text-violet-700" : "bg-gray-200 text-gray-400"
                    }`}>{done ? "✓" : i + 1}</span>
                    {s}
                  </div>
                  {i < 2 && <Icon icon="solar:alt-arrow-right-bold" className="w-3.5 h-3.5 text-gray-300" />}
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: Upload ── */}
          {importStep === "upload" && (
            <div className="space-y-4">
              <DropZone onFile={handlePreview} disabled={false} />
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-700 mb-1">Multi-variant products</p>
                  <p className="text-sm text-amber-600">Use the same <code className="bg-amber-100 px-1 rounded font-mono text-xs">model_number</code> on multiple rows to create a product with multiple variants. Download the sample CSV to see examples.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1→2 transition: Loading preview ── */}
          {importStep === "previewing" && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center gap-4">
              <Icon icon="svg-spinners:180-ring-with-bg" className="w-12 h-12 text-violet-500" />
              <p className="text-gray-500 font-medium">Validating CSV…</p>
            </div>
          )}

          {/* ── STEP 2: Preview results ── */}
          {importStep === "preview" && previewData && (
            <div className="space-y-4">
              {/* Summary row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Products",  value: previewData.summary.totalProducts, color: "text-gray-800",    bg: "bg-white" },
                  { label: "Ready to Import", value: previewData.summary.valid,          color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
                  { label: "Invalid",         value: previewData.summary.invalid,        color: "text-red-700",     bg: "bg-red-50",     border: "border-red-100" },
                  { label: "Duplicates",      value: previewData.summary.duplicates,     color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-100" },
                ].map((c) => (
                  <div key={c.label} className={`${c.bg} rounded-2xl border ${c.border || "border-gray-100"} p-4 shadow-sm`}>
                    <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">{c.label}</p>
                    <p className={`text-3xl font-black ${c.color}`}>{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Validation Results</h3>
                  <span className="text-xs text-gray-400">{csvFile?.name}</span>
                </div>
                <div className="p-4">
                  <PreviewTable products={previewData.products} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={resetImport}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                >
                  <Icon icon="solar:arrow-left-bold" className="w-4 h-4" />
                  Choose Different File
                </button>
                {previewData.summary.valid > 0 && (
                  <button
                    onClick={handleConfirmImport}
                    className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-violet-500/20"
                  >
                    <Icon icon="solar:import-bold-duotone" className="w-4 h-4" />
                    Import {previewData.summary.valid} Product{previewData.summary.valid !== 1 ? "s" : ""}
                  </button>
                )}
                {previewData.summary.valid === 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                    <Icon icon="solar:danger-triangle-bold" className="w-4 h-4" />
                    No valid products to import. Fix errors and try again.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2→3 transition: Importing ── */}
          {importStep === "importing" && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 flex flex-col items-center gap-4">
              <Icon icon="svg-spinners:180-ring-with-bg" className="w-12 h-12 text-violet-500" />
              <p className="text-gray-500 font-medium">Importing products…</p>
            </div>
          )}

          {/* ── STEP 3: Done ── */}
          {importStep === "done" && importResult && (
            <div className="space-y-4">
              {/* Result banner */}
              <div className={`rounded-2xl border p-6 flex items-center gap-5 ${
                importResult.imported > 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
              }`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  importResult.imported > 0 ? "bg-emerald-100" : "bg-red-100"
                }`}>
                  <Icon
                    icon={importResult.imported > 0 ? "solar:check-circle-bold-duotone" : "solar:close-circle-bold-duotone"}
                    className={`w-8 h-8 ${importResult.imported > 0 ? "text-emerald-600" : "text-red-600"}`}
                  />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${importResult.imported > 0 ? "text-emerald-800" : "text-red-800"}`}>
                    {importResult.imported > 0 ? "Import Complete!" : "Import Failed"}
                  </h3>
                  <p className={`text-sm ${importResult.imported > 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {importResult.imported} product{importResult.imported !== 1 ? "s" : ""} imported
                    {importResult.skipped > 0 ? `, ${importResult.skipped} skipped` : ""}
                  </p>
                </div>
              </div>

              {/* Error list */}
              {importResult.errors?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon icon="solar:danger-triangle-bold-duotone" className="w-4 h-4 text-red-500" />
                    Skipped ({importResult.errors.length})
                  </h4>
                  <div className="space-y-2">
                    {importResult.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm bg-red-50 rounded-xl px-4 py-2.5">
                        <span className="font-mono text-xs text-red-400 mt-0.5 w-36 flex-shrink-0">{e.modelNumber}</span>
                        <span className="text-red-600">{e.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={resetImport}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                >
                  <Icon icon="solar:restart-bold" className="w-4 h-4" />
                  Import Another File
                </button>
                {importResult.imported > 0 && (
                  <button
                    onClick={() => router.push("/seller/product")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors"
                  >
                    <Icon icon="solar:arrow-right-bold" className="w-4 h-4" />
                    View Products
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════
          HISTORY TAB
      ══════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {historyLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Icon icon="svg-spinners:180-ring-with-bg" className="w-8 h-8" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Icon icon="solar:history-bold-duotone" className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Import History</h3>
                <p className="text-gray-400 text-sm">Your CSV import sessions will appear here</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-400">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-400">File</th>
                    <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-400">Products</th>
                    <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-400">Imported</th>
                    <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-gray-400">Skipped</th>
                    <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-gray-400">Status</th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((r) => <HistoryRow key={r._id} record={r} />)}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {histPagination && histPagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                disabled={histPage === 1}
                onClick={() => setHistPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 text-sm font-semibold"
              >Prev</button>
              <span className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                {histPage} / {histPagination.totalPages}
              </span>
              <button
                disabled={histPage === histPagination.totalPages}
                onClick={() => setHistPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 text-sm font-semibold"
              >Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
