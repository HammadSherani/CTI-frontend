"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAcademicData, fetchCategory } from '@/store/academy';
import { useSearchParams, useRouter } from 'next/navigation';
import SmallLoader from '@/components/SmallLoader';

// ────────────────────────────────────────────────
//  Card
// ────────────────────────────────────────────────
const CourseCard = ({ course }) => {
  const router = useRouter();

  const getGradient = (color = 'blue') => {
    const map = {
      blue: 'from-blue-600/90 to-indigo-700/90',
      teal: 'from-teal-600/90 to-cyan-700/90',
      orange: 'from-orange-600/90 to-amber-700/90',
      purple: 'from-purple-600/90 to-violet-700/90',
      rose: 'from-rose-600/90 to-pink-700/90',
    };
    return map[color] || 'from-indigo-600/90 to-purple-700/90';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100/80"
    >
      {/* Image + overlay */}
      <div
        onClick={() => router.push(`/academy/academy-listing/${course.slug}`)}
        className="relative h-52 sm:h-56 cursor-pointer overflow-hidden"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(course.color)} z-10 opacity-75 group-hover:opacity-85 transition-opacity duration-500`} />

        <img
          src={course.image}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <span className="bg-white/90 backdrop-blur-md text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
            {course.badge || 'Course'}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 z-20">
          <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
            {course.instructor || 'Instructor'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pb-6">
        <h3 className="font-semibold text-lg leading-tight text-gray-900 mb-3 line-clamp-2 min-h-[2.75rem] group-hover:text-orange-600 transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center justify-between mb-4">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                icon="solar:star-bold"
                width={16}
                className={i < Math.floor(course.rating ?? 4.5) ? 'text-amber-500' : 'text-gray-300'}
              />
            ))}
            <span className="text-sm font-medium text-gray-700 ml-1">
              {course.rating?.toFixed(1) ?? '4.5'}
            </span>
          </div>

          {/* Views */}
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Icon icon="solar:eye-bold" width={16} />
            <span>{(course.views ?? 0).toLocaleString()}</span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push(`/academy/academy-listing/${course.slug}`)}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-100"
        >
          Start Learning
        </button>
      </div>
    </motion.div>
  );
};

// ────────────────────────────────────────────────
//  Main Component
// ────────────────────────────────────────────────
const AcademyContent = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { academicCategories, academicData, isLoading } = useSelector((state) => state.academy);

  const [page, setPage] = useState(1);
  const [limit] = useState(12); // slightly more modern default

  // Sync URL → state
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const cid = searchParams.get('categoryId') || null;
    const p = parseInt(searchParams.get('page') || '1', 10) || 1;

    setPage(p);
  }, [searchParams]);

  // Fetch categories once
  useEffect(() => {
    dispatch(fetchCategory());
  }, [dispatch]);

  // Fetch courses
  useEffect(() => {
    const cid = searchParams.get('categoryId') || 'all';
    const search = searchParams.get('search') || '';

    dispatch(
      fetchAcademicData({
        page,
        limit,
        categoryId: cid,
        search,
      })
    );
  }, [dispatch, page, limit, searchParams]);

  const totalPages = useMemo(() => {
    const total = academicData?.totalPages ?? academicData?.pages ?? null;
    if (typeof total === 'number') return total;

    const count = academicData?.totalDocs ?? academicData?.total ?? academicData?.count ?? 0;
    return Math.max(1, Math.ceil(count / limit));
  }, [academicData, limit]);

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-10">

        {/* Header + Filter */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Academy Courses</h1>
            <p className="mt-2 text-gray-600">Discover high-quality courses to grow your skills</p>
          </div>

          <div className="w-full sm:w-72">
            <select
              value={searchParams.get('categoryId') || 'all'}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value === 'all') {
                  params.delete('categoryId');
                } else {
                  params.set('categoryId', e.target.value);
                }
                params.set('page', '1');
                router.push(`/academy/academy-listing?${params.toString()}`);
              }}
              className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200/50 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Array.isArray(academicCategories) &&
                academicCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Loading / Empty / Content */}
        {isLoading ? (
          <div className="py-20">
            <SmallLoader loading={true} text="Loading amazing courses..." />
          </div>
        ) : (() => {
          const courses = academicData?.data ?? academicData?.docs ?? academicData?.items ?? academicData ?? [];

          if (!Array.isArray(courses) || courses.length === 0) {
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="inline-flex flex-col items-center gap-5 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                  <Icon icon="solar:book-2-bold" width={72} className="text-orange-400/40" />
                  <h3 className="text-2xl font-bold text-gray-800">No courses found</h3>
                  <p className="text-gray-600 max-w-md">
                    Try changing the category filter or come back later — we're adding new content regularly!
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
              instructor: item.instructor ?? 'Expert',
              rating: item.rating ?? 4.7,
              views: item.views ?? 0,
              image: item.image ?? '/assets/logo/trendyol.png',
              color: item.color ?? 'blue',
              badge: item.badge ?? 'New',
              slug: item.slug ?? item._id ?? item.id,
            });
          });

          return Object.entries(byCategory).map(([catId, group]) => (
            <motion.section
              key={catId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-16 last:mb-0"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-orange-500 pl-4">
                {group.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-7">
                {group.items.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </motion.section>
          ));
        })()}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              onClick={() => {
                const p = new URLSearchParams(searchParams.toString());
                p.set('page', Math.max(1, page - 1).toString());
                router.push(`?${p.toString()}`);
              }}
              disabled={page <= 1}
              className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              ← Previous
            </button>

            <span className="px-5 py-3 bg-orange-50 text-orange-700 font-semibold rounded-xl border border-orange-100">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => {
                const p = new URLSearchParams(searchParams.toString());
                p.set('page', Math.min(totalPages, page + 1).toString());
                router.push(`?${p.toString()}`);
              }}
              disabled={page >= totalPages}
              className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademyContent;