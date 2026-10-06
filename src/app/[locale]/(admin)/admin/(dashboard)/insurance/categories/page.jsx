"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axiosInstance from "@/config/axiosInstance";

const authConfig = (token) => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const authToken = token || storedToken;
    return { headers: { Authorization: `Bearer ${authToken || ""}` } };
};

/* ---------- Small reusable pieces (standard Tailwind colors only) ---------- */

function Switch({ checked, onChange, disabled, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-primary-500" : "bg-slate-300"
                }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"
                    }`}
            />
        </button>
    );
}

function Spinner({ className = "" }) {
    return <Icon icon="mdi:loading" className={`animate-spin ${className}`} />;
}

function IconButton({ icon, title, onClick, disabled, className = "" }) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-base text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
        >
            <Icon icon={icon} />
        </button>
    );
}

function InlineEditForm({ value, onChange, onSubmit, onCancel, disabled }) {
    return (
        <form onSubmit={onSubmit} className="flex min-w-0 flex-1 items-center gap-2">
            <input
                autoFocus
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => event.key === "Escape" && onCancel()}
                className="min-w-0 flex-1 rounded-lg border border-primary-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none ring-2 ring-primary-100"
            />
            <button
                type="submit"
                disabled={disabled}
                title="Save"
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
                Save
            </button>
            <button
                type="button"
                onClick={onCancel}
                title="Cancel"
                className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
                Cancel
            </button>
        </form>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid gap-5 md:grid-cols-2">
            {[0, 1].map((i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-3 border-b border-slate-100 p-5">
                        <div className="h-11 w-11 rounded-xl bg-slate-200" />
                        <div className="space-y-2">
                            <div className="h-4 w-36 rounded bg-slate-200" />
                            <div className="h-3 w-20 rounded bg-slate-100" />
                        </div>
                    </div>
                    <div className="space-y-3 p-5">
                        <div className="h-9 rounded-lg bg-slate-100" />
                        <div className="h-9 rounded-lg bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ---------- Page ---------- */

export default function InsuranceCategoriesPage() {
    const { token } = useSelector((state) => state.auth);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [newTypes, setNewTypes] = useState({});
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingType, setEditingType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState(null);

    const saving = savingKey !== null;

    const stats = useMemo(
        () => ({
            total: categories.length,
            active: categories.filter((c) => c.isActive).length,
            types: categories.reduce((sum, c) => sum + (c.types?.length || 0), 0),
        }),
        [categories]
    );

    const loadCategories = async () => {
        try {
            const { data } = await axiosInstance.get("/admin/insurance/categories", authConfig(token));
            setCategories(data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to load insurance categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [token]);

    const submit = async (request, successMessage, key = "global") => {
        setSavingKey(key);
        try {
            await request();
            toast.success(successMessage);
            await loadCategories();
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to save insurance option");
            return false;
        } finally {
            setSavingKey(null);
        }
    };

    const addCategory = async (event) => {
        event.preventDefault();
        if (!newCategory.trim()) {
            toast.error("Please enter a category name");
            return;
        }
        const created = await submit(
            () => axiosInstance.post("/admin/insurance/categories", { name: newCategory.trim() }, authConfig(token)),
            "Category created",
            "new-category"
        );
        if (created) setNewCategory("");
    };

    const addType = async (event, categoryId) => {
        event.preventDefault();
        const name = newTypes[categoryId]?.trim();
        if (!name) {
            toast.error("Please enter an insurance type name");
            return;
        }
        const created = await submit(
            () => axiosInstance.post(`/admin/insurance/categories/${categoryId}/types`, { name }, authConfig(token)),
            "Insurance type created",
            `type-${categoryId}`
        );
        if (created) setNewTypes((current) => ({ ...current, [categoryId]: "" }));
    };

    const updateCategory = async (event, categoryId) => {
        event.preventDefault();
        if (!editingCategory?.name.trim()) return;
        const updated = await submit(
            () => axiosInstance.put(`/admin/insurance/categories/${categoryId}`, { name: editingCategory.name.trim() }, authConfig(token)),
            "Category updated",
            `edit-${categoryId}`
        );
        if (updated) setEditingCategory(null);
    };

    const updateType = async (event, categoryId, typeId) => {
        event.preventDefault();
        if (!editingType?.name.trim()) return;
        const updated = await submit(
            () => axiosInstance.put(`/admin/insurance/categories/${categoryId}/types/${typeId}`, { name: editingType.name.trim() }, authConfig(token)),
            "Insurance type updated",
            `edit-${typeId}`
        );
        if (updated) setEditingType(null);
    };

    const toggleCategory = (categoryId) =>
        submit(
            () => axiosInstance.patch(`/admin/insurance/categories/${categoryId}/toggle`, {}, authConfig(token)),
            "Category status updated",
            `toggle-${categoryId}`
        );

    const toggleType = (categoryId, typeId) =>
        submit(
            () => axiosInstance.patch(`/admin/insurance/categories/${categoryId}/types/${typeId}/toggle`, {}, authConfig(token)),
            "Insurance type status updated",
            `toggle-${typeId}`
        );

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <header className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-2xl text-white shadow-sm">
                        <Icon icon="mdi:shield-check" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Insurance Categories</h1>
                        <p className="text-sm text-slate-500">Manage the categories and insurance types shown to customers.</p>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {[
                        { label: "Categories", value: stats.total },
                        { label: "Active", value: stats.active },
                        { label: "Insurance types", value: stats.types },
                    ].map((item) => (
                        <div key={item.label} className="px-4 py-4 text-center sm:px-6">
                            <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{item.value}</p>
                            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Add category */}
                <form
                    onSubmit={addCategory}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
                >
                    <input
                        value={newCategory}
                        onChange={(event) => setNewCategory(event.target.value)}
                        placeholder="New category, e.g. Mobile Insurance"
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {savingKey === "new-category" ? <Spinner className="text-base" /> : <Icon icon="mdi:plus" className="text-base" />}
                        {savingKey === "new-category" ? "Saving..." : "Add category"}
                    </button>
                </form>

                {/* List */}
                {loading ? (
                    <LoadingSkeleton />
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl text-slate-400">
                            <Icon icon="mdi:folder-open-outline" />
                        </div>
                        <p className="font-semibold text-slate-700">No insurance categories yet</p>
                        <p className="mt-1 text-sm text-slate-500">Add your first category using the form above.</p>
                    </div>
                ) : (
                    <div className="grid items-start gap-5 md:grid-cols-2">
                        {categories.map((category) => (
                            <section key={category._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {/* Category header */}
                                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${category.isActive ? "bg-primary-50 text-primary-600" : "bg-slate-100 text-slate-400"
                                            }`}
                                    >
                                        <Icon icon="mdi:shield-outline" />
                                    </div>

                                    {editingCategory?._id === category._id ? (
                                        <InlineEditForm
                                            value={editingCategory.name}
                                            onChange={(name) => setEditingCategory({ ...editingCategory, name })}
                                            onSubmit={(event) => updateCategory(event, category._id)}
                                            onCancel={() => setEditingCategory(null)}
                                            disabled={saving}
                                        />
                                    ) : (
                                        <>
                                            <div className="min-w-0 flex-1">
                                                <h2 className={`truncate text-base font-semibold ${category.isActive ? "text-slate-900" : "text-slate-400"}`}>
                                                    {category.name}
                                                </h2>
                                                <p className="text-xs text-slate-500">
                                                    {category.types?.length || 0} {category.types?.length === 1 ? "type" : "types"}
                                                    <span className="mx-1.5 text-slate-300">•</span>
                                                    <span className={category.isActive ? "font-medium text-primary-600" : "text-slate-400"}>
                                                        {category.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <IconButton
                                                    icon="mdi:pencil-outline"
                                                    title="Edit category"
                                                    disabled={saving}
                                                    onClick={() => setEditingCategory({ _id: category._id, name: category.name })}
                                                />
                                                <Switch
                                                    checked={!!category.isActive}
                                                    disabled={saving}
                                                    onChange={() => toggleCategory(category._id)}
                                                    label={category.isActive ? "Deactivate category" : "Activate category"}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Types */}
                                <div className="px-5 py-2">
                                    {category.types?.length ? (
                                        <ul className="divide-y divide-slate-100">
                                            {category.types.map((type) => (
                                                <li key={type._id} className="flex items-center justify-between gap-3 py-2.5">
                                                    {editingType?._id === type._id ? (
                                                        <InlineEditForm
                                                            value={editingType.name}
                                                            onChange={(name) => setEditingType({ ...editingType, name })}
                                                            onSubmit={(event) => updateType(event, category._id, type._id)}
                                                            onCancel={() => setEditingType(null)}
                                                            disabled={saving}
                                                        />
                                                    ) : (
                                                        <>
                                                            <div className="flex min-w-0 items-center gap-2.5">
                                                                <span className={`h-2 w-2 shrink-0 rounded-full ${type.isActive ? "bg-primary-500" : "bg-slate-300"}`} />
                                                                <span className={`truncate text-sm ${type.isActive ? "text-slate-700" : "text-slate-400 line-through"}`}>
                                                                    {type.name}
                                                                </span>
                                                            </div>
                                                            <div className="flex shrink-0 items-center gap-1.5">
                                                                <IconButton
                                                                    icon="mdi:pencil-outline"
                                                                    title="Edit type"
                                                                    disabled={saving}
                                                                    onClick={() => setEditingType({ _id: type._id, name: type.name })}
                                                                />
                                                                <Switch
                                                                    checked={!!type.isActive}
                                                                    disabled={saving}
                                                                    onChange={() => toggleType(category._id, type._id)}
                                                                    label={type.isActive ? "Deactivate type" : "Activate type"}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="py-6 text-center text-sm text-slate-400">No insurance types in this category yet.</p>
                                    )}
                                </div>

                                {/* Add type */}
                                <form
                                    onSubmit={(event) => addType(event, category._id)}
                                    className="flex gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3.5"
                                >
                                    <input
                                        value={newTypes[category._id] || ""}
                                        onChange={(event) => setNewTypes((current) => ({ ...current, [category._id]: event.target.value }))}
                                        placeholder="Add insurance type"
                                        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                                    />
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {savingKey === `type-${category._id}` ? <Spinner className="text-base" /> : <Icon icon="mdi:plus" className="text-base" />}
                                        {savingKey === `type-${category._id}` ? "Saving" : "Add"}
                                    </button>
                                </form>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}