"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAcademicData, fetchCategory, fetchSubCategory } from '@/store/academy';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import SmallLoader from '@/components/SmallLoader';
import { CustomDropdown } from '@/components/website/home/customDropdown';

const CourseCard = ({ course }) => {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100/80"
        >
            {/* Image */}
            <div
                onClick={() => router.push(`/academy/academy-listing/${course.slug}`)}
                className="relative h-36 sm:h-40 cursor-pointer overflow-hidden"
            >
                <img
                    src={course.image}
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                />

                {/* Badge */}
                <div className="absolute top-2.5 left-2.5 z-20">
                    <span className="bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm">
                        {course.badge || 'Course'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3.5 pb-4">
                <h3 className="font-semibold text-[13px] leading-snug text-gray-900 mb-1.5 line-clamp-2 min-h-[2.25rem] group-hover:text-orange-600 transition-colors">
                    {course.title}
                </h3>

                {course.shortDescription && (
                    <p className="text-[11px] leading-relaxed text-gray-500 mb-2.5 line-clamp-2">
                        {course.shortDescription}
                    </p>
                )}

                <div className="flex items-center justify-between mb-3">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Icon
                                key={i}
                                icon="solar:star-bold"
                                width={12}
                                className={i < Math.floor(course.rating ?? 4.5) ? 'text-amber-500' : 'text-gray-300'}
                            />
                        ))}
                        <span className="text-[11px] font-medium text-gray-600 ml-0.5">
                            {course.rating?.toFixed(1) ?? '4.5'}
                        </span>
                    </div>

                    {/* Views */}
                    <div className="flex items-center gap-1 text-gray-400 text-[11px]">
                        <Icon icon="solar:eye-bold" width={13} />
                        <span>{(course.views ?? 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={() => router.push(`/academy/academy-listing/${course.slug}`)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 text-xs rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                >
                    Start Learning
                </button>
            </div>
        </motion.div>
    );
};

const AcademyListingContent = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { academicCategories, academicSubCategories, academicData, isLoading } = useSelector((state) => state.academy);

    const [page, setPage] = useState(1);
    const [limit] = useState(30);
    const [subCatLoading, setSubCatLoading] = useState(false);

    const categoryId = searchParams.get('categoryId') || '';
    const subCategoryId = searchParams.get('subCategoryId') || '';
    const sort = searchParams.get('sort') || '';
    const status = searchParams.get('status') || '';

    // Sync URL → state
    useEffect(() => {
        const p = parseInt(searchParams.get('page') || '1', 10) || 1;
        setPage(p);
    }, [searchParams]);

    // Fetch categories once
    useEffect(() => {
        dispatch(fetchCategory());
        dispatch(fetchSubCategory('all'));
    }, [dispatch]);

    // Fetch subcategories when category changes (with loading indicator)
    useEffect(() => {
        setSubCatLoading(true);
        dispatch(fetchSubCategory(categoryId || 'all')).finally(() => setSubCatLoading(false));
    }, [dispatch, categoryId]);

    // Fetch courses
    useEffect(() => {
        const search = searchParams.get('search') || '';
        dispatch(
            fetchAcademicData({
                page,
                limit,
                categoryId: categoryId || 'all',
                subCategoryId: subCategoryId || 'all',
                search,
                sort: sort || 'recent',
            })
        );
    }, [dispatch, page, limit, categoryId, subCategoryId, sort, searchParams]);

    const totalPages = useMemo(() => {
        const pagination = academicData?.pagination;
        if (pagination?.totalPages) return pagination.totalPages;
        const count = academicData?.totalDocs ?? academicData?.total ?? academicData?.count ?? 0;
        return Math.max(1, Math.ceil(count / limit));
    }, [academicData, limit]);

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!value || value === 'all') {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        if (key !== 'page') params.set('page', '1');
        if (key === 'categoryId') params.delete('subCategoryId');
        router.push(`/academy/academy-listing?${params.toString()}`);
    };

    // Build dropdown options
    const categoryOptions = useMemo(() => {
        if (!Array.isArray(academicCategories)) return [];
        return academicCategories.map(cat => ({ value: cat._id, label: cat.title }));
    }, [academicCategories]);

    const subCategoryOptions = useMemo(() => {
        if (!Array.isArray(academicSubCategories)) return [];
        return academicSubCategories.map(sub => ({ value: sub._id, label: sub.title }));
    }, [academicSubCategories]);

    const statusOptions = [
        { value: 'new', label: 'New' },
        { value: 'popular', label: 'Popular' },
        { value: 'featured', label: 'Featured' },
    ];

    const sortOptions = [
        { value: 'recent', label: 'Most Recent' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'most_viewed', label: 'Most Viewed' },
        { value: 'title_asc', label: 'Title A-Z' },
        { value: 'title_desc', label: 'Title Z-A' },
    ];

    return (
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-10">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Academy Courses</h1>
                <p className="mt-1.5 text-sm text-gray-600">Discover high-quality courses to grow your skills</p>
            </div>

            {/* Filter Bar */}
            <div className="mb-8 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <CustomDropdown
                        icon="mdi:shape-outline"
                        label="Category"
                        placeholder="Categories"
                        options={categoryOptions}
                        value={categoryId}
                        onChange={(val) => updateFilter('categoryId', val)}
                    />

                    <CustomDropdown
                        icon="mdi:school-outline"
                        label="Training Type"
                        placeholder="Training Type"
                        options={subCategoryOptions}
                        value={subCategoryId}
                        onChange={(val) => updateFilter('subCategoryId', val)}
                        loading={subCatLoading}
                    />

                    <CustomDropdown
                        icon="mdi:tag-check-outline"
                        label="Status"
                        placeholder="Status"
                        options={statusOptions}
                        value={status}
                        onChange={(val) => updateFilter('status', val)}
                    />

                    <CustomDropdown
                        icon="mdi:sort-clock-ascending-outline"
                        label="Sort By"
                        placeholder="Most Recent"
                        options={sortOptions}
                        value={sort}
                        onChange={(val) => updateFilter('sort', val)}
                    />

                    {/* Clear Filters */}
                    <button
                        onClick={() => router.push('/academy/academy-listing')}
                        title="Clear all filters"
                        className="flex items-center justify-center w-10 h-10 sm:w-10 sm:h-10 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 rounded-lg transition-colors shrink-0 self-center"
                    >
                        <Icon icon="mdi:filter-variant-remove" width={20} />
                    </button>
                </div>
            </div>

            {/* Loading / Empty / Content */}
            <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                {(() => {
                    if (isLoading && (!academicData || Object.keys(academicData).length === 0)) {
                        return (
                            <div className="py-20">
                                <SmallLoader loading={true} text="Loading amazing courses..." />
                            </div>
                        );
                    }

                    const courses = academicData?.data ?? academicData?.docs ?? academicData?.items ?? academicData ?? [];

                    if (!Array.isArray(courses) || courses.length === 0) {
                        return (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24"
                            >
                                <div className="inline-flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                                    <Icon icon="solar:book-2-bold" width={56} className="text-orange-400/40" />
                                    <h3 className="text-xl font-bold text-gray-800">No courses found</h3>
                                    <p className="text-sm text-gray-600 max-w-md">
                                        Try changing the filters or come back later — we're adding new content regularly!
                                    </p>
                                </div>
                            </motion.div>
                        );
                    }

                    // Group by category
                    const byCategory = {};
                    courses.forEach((item) => {
                        const catId = item.category?._id ?? item.category ?? 'uncategorized';
                        if (!byCategory[catId]) {
                            const cat = academicCategories?.find?.((c) => c._id === catId);
                            byCategory[catId] = {
                                title: cat?.title ?? item.category?.title ?? 'General Courses',
                                items: [],
                            };
                        }
                        byCategory[catId].items.push({
                            id: item._id ?? item.id,
                            title: item.title ?? 'Untitled Course',
                            instructor: item.instructor ?? 'CTI Expert',
                            rating: item.rating ?? 4.7,
                            views: item.views ?? 0,
                            image: item.thumbnail || item.image || 'https://placehold.co/600x400/png?text=Course+Placeholder',
                            color: item.color ?? 'blue',
                            badge: item.subCategory?.title || item.badge || 'New',
                            slug: item.slug ?? item._id ?? item.id,
                            shortDescription: item.shortDescription || '',
                        });
                    });

                    return Object.entries(byCategory).map(([catId, group]) => {
                        const MAX_PER_CAT = 10;
                        const visibleItems = group.items.slice(0, MAX_PER_CAT);
                        const hasMore = group.items.length > MAX_PER_CAT;

                        return (
                            <motion.section
                                key={catId}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="mb-12 last:mb-0"
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-lg font-bold text-gray-900 border-l-4 border-orange-500 pl-3">
                                        {group.title}
                                    </h2>
                                    {hasMore && (
                                        <button
                                            onClick={() => updateFilter('categoryId', catId)}
                                            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 transition-colors"
                                        >
                                            View All ({group.items.length})
                                            <Icon icon="mdi:chevron-right" width={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                                    {visibleItems.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            </motion.section>
                        );
                    });
                })()}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center gap-3">
                    <button
                        onClick={() => updateFilter('page', Math.max(1, page - 1).toString())}
                        disabled={page <= 1}
                        className="px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        ← Previous
                    </button>

                    <span className="px-4 py-2.5 bg-orange-50 text-orange-700 text-sm font-semibold rounded-lg border border-orange-100">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => updateFilter('page', Math.min(totalPages, page + 1).toString())}
                        disabled={page >= totalPages}
                        className="px-5 py-2.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
};

export default AcademyListingContent;