"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axiosInstance";
import { DataTable } from "@/components/partials/admin/ecom/DataTable";
import SummaryCards from "@/components/partials/admin/ecom/SummaryCards";
import SearchInput from "@/components/partials/admin/ecom/SearchInput";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Button from "@/components/partials/admin/ecom/myButton";

/* ─── Confirm Dialog ─────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Icon icon="mdi:alert-outline" className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Confirm Delete</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-5 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-5 py-2 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Questions Form Modal ───────────────────────────────── */
function QuestionsModal({ initial, categoriesList, onClose, onSuccess }) {
  const { token } = useSelector((s) => s.auth);

  const [categoryId, setCategoryId] = useState(initial?.categoryId?._id || initial?.categoryId || "");
  const [questions, setQuestions] = useState(
    initial?.questions?.length
      ? initial.questions.map((q) => ({ question: q.question, options: q.options?.length ? q.options : [""] }))
      : [{ question: "", options: [""] }]
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!categoryId) e.categoryId = "Select a category";
    const valid = questions.filter((q) => q.question.trim());
    if (valid.length === 0) e.questions = "Add at least one question";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const cleanQuestions = questions
        .filter((q) => q.question.trim())
        .map((q) => ({
          question: q.question.trim(),
          options: q.options.filter((o) => o.trim()),
        }));

      await axiosInstance.post(
        "/admin/refurbish/questions",
        { categoryId, questions: JSON.stringify(cleanQuestions) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Questions saved successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Question helpers
  const addQuestion = () => setQuestions((p) => [...p, { question: "", options: [""] }]);
  const removeQuestion = (qi) => setQuestions((p) => p.filter((_, i) => i !== qi));
  const updateQuestion = (qi, val) =>
    setQuestions((p) => p.map((q, i) => (i === qi ? { ...q, question: val } : q)));

  // Option helpers
  const addOption = (qi) =>
    setQuestions((p) => p.map((q, i) => (i === qi ? { ...q, options: [...q.options, ""] } : q)));
  const removeOption = (qi, oi) =>
    setQuestions((p) => p.map((q, i) => (i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q)));
  const updateOption = (qi, oi, val) =>
    setQuestions((p) =>
      p.map((q, i) =>
        i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? val : o)) } : q
      )
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {initial ? "Edit Category Questions" : "Add Category Questions"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Select category, then freely add questions and their answer options</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">

            {/* Category Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={!!initial}
                className={`w-full h-11 px-3 rounded-xl border text-sm focus:outline-none focus:border-primary-500 bg-white disabled:bg-gray-50 ${errors.categoryId ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">Choose Category</option>
                {categoriesList.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>

            {/* Questions List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Questions</h3>
                  <p className="text-xs text-gray-400">Each question can have its own set of answer options</p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl transition"
                >
                  <Icon icon="mdi:plus" className="w-4 h-4" />
                  Add Question
                </button>
              </div>

              {errors.questions && <p className="text-red-500 text-xs mb-2">{errors.questions}</p>}

              <div className="space-y-4">
                {questions.map((q, qi) => (
                  <div key={qi} className="border border-gray-200 rounded-2xl overflow-hidden">
                    {/* Question Input */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
                      <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {qi + 1}
                      </span>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(qi, e.target.value)}
                        placeholder={`Question ${qi + 1} — e.g. What is the screen condition?`}
                        className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeQuestion(qi)}
                        disabled={questions.length === 1}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Options */}
                    <div className="p-3 space-y-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Answer Options</p>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            placeholder={`Option ${oi + 1} — e.g. Good`}
                            className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(qi, oi)}
                            disabled={q.options.length === 1}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Icon icon="mdi:close" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(qi)}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary-600 mt-1 transition"
                      >
                        <Icon icon="mdi:plus-circle-outline" className="w-4 h-4" />
                        Add Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-medium bg-white border border-gray-200 rounded-2xl hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 text-sm font-medium text-white bg-primary-600 rounded-2xl hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Icon icon="mdi:loading" className="animate-spin w-4 h-4" />}
              Save Questions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── View Modal ─────────────────────────────────────────── */
function ViewQuestionsModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Questions — {item.categoryId?.name}</h2>
            <p className="text-xs text-gray-400">{item.questions?.length || 0} questions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl">
            <Icon icon="mdi:close" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {item.questions?.map((q, qi) => (
            <div key={qi} className="border border-gray-100 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">{qi + 1}</span>
                <p className="text-sm font-semibold text-gray-800">{q.question}</p>
              </div>
              <div className="px-4 py-3 space-y-1.5">
                {q.options?.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 flex justify-end border-t">
          <button onClick={onClose} className="px-5 py-2 text-sm bg-gray-100 rounded-xl hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function CategoryQuestionsPage() {
  const [docs, setDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { token } = useSelector((s) => s.auth);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, catRes] = await Promise.all([
        axiosInstance.get("/admin/refurbish/questions", { headers: { Authorization: `Bearer ${token}` } }),
        axiosInstance.get("/admin/refurbish/categories", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setDocs(qRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

  const handleDelete = async (categoryId, label) => {
    try {
      await axiosInstance.delete(`/admin/refurbish/questions/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Questions for "${label}" deleted`);
      fetchData();
    } catch {
      toast.error("Delete failed");
    } finally {
      setConfirm(null);
    }
  };

  const totalQuestions = docs.reduce((sum, d) => sum + (d.questions?.length || 0), 0);

  const summaryCards = [
    { label: "Categories with Questions", value: docs.length, icon: "mdi:help-circle-outline", color: "#6366f1" },
    { label: "Total Questions", value: totalQuestions, icon: "mdi:comment-question-outline", color: "#10b981" },
  ];

  const filtered = docs.filter((d) =>
    (d.categoryId?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "category",
      header: "Category",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
            {row.categoryId?.image ? (
              <img src={row.categoryId.image} alt={row.categoryId.name} className="w-full h-full object-contain" />
            ) : (
              <Icon icon="mdi:shape-outline" className="w-5 h-5 text-primary-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{row.categoryId?.name || "—"}</p>
            <p className="text-xs text-gray-400">{row.questions?.length || 0} questions</p>
          </div>
        </div>
      ),
    },
    {
      key: "questions",
      header: "Questions Preview",
      cell: (row) => (
        <div className="space-y-0.5 max-w-xs">
          {row.questions?.slice(0, 2).map((q, i) => (
            <p key={i} className="text-xs text-gray-600 truncate">• {q.question}</p>
          ))}
          {row.questions?.length > 2 && (
            <p className="text-xs text-primary-500 font-bold">+{row.questions.length - 2} more</p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button onClick={() => setModal({ mode: "view", item: row })} className="p-2 hover:bg-green-50 rounded-xl text-green-600">
            <Icon icon="mdi:eye-outline" className="w-4 h-4" />
          </button>
          <button onClick={() => setModal({ mode: "edit", item: row })} className="p-2 hover:bg-blue-50 rounded-xl text-blue-600">
            <Icon icon="mdi:pencil-outline" className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirm({ categoryId: row.categoryId?._id, label: row.categoryId?.name })} className="p-2 hover:bg-red-50 rounded-xl text-red-600">
            <Icon icon="mdi:delete-outline" className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Category Questions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage questions and answer options per device category</p>
        </div>
        <Button onClick={() => setModal({ mode: "create" })} variant="primary" className="h-11">
          <Icon icon="mdi:plus" className="w-5 h-5 mr-1" />
          Add Questions
        </Button>
      </div>

      <SummaryCards data={summaryCards} />

      <div className="bg-white rounded-3xl border border-gray-200/60 p-6 shadow-sm space-y-6">
        <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Search by category name..." />

        <DataTable
          data={filtered}
          columns={columns}
          loading={loading}
          emptyIcon="mdi:help-circle-outline"
          emptyTitle="No questions added"
          emptyDescription="Add questions for a category to get started"
        />
      </div>

      {modal?.mode === "view" ? (
        <ViewQuestionsModal item={modal.item} onClose={() => setModal(null)} />
      ) : modal && (
        <QuestionsModal
          initial={modal.item}
          categoriesList={categories}
          onClose={() => setModal(null)}
          onSuccess={fetchData}
        />
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete all questions for "${confirm.label}"?`}
          onConfirm={() => handleDelete(confirm.categoryId, confirm.label)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
