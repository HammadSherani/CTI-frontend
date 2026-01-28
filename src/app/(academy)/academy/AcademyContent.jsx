"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAcademicData, fetchCategory } from '@/store/academy';
import { useSearchParams, useRouter } from 'next/navigation';
import SmallLoader from '@/components/SmallLoader';

// --- Reusable Card Component ---
const CourseCard = ({ course }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-600 to-blue-800',
      teal: 'from-teal-600 to-teal-800',
      orange: 'from-orange-600 to-orange-800'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(course.color)} opacity-90 z-10`}></div>
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {course.badge}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 z-20">
          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {course.instructor}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-gray-800 font-bold text-base mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors duration-300 min-h-[3rem]">
          {course.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                icon="lucide:star"
                width={14}
                className={i < Math.floor(course.rating) ? 'text-amber-400' : 'text-gray-300'}
              />
            ))}
            <span className="text-xs text-gray-600 ml-1 font-semibold">{course.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Icon icon="lucide:eye" width={14} />
            <span className="text-xs font-medium">{course.views.toLocaleString()}</span>
          </div>
        </div>
        <button className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-md">
          Start Now
        </button>
      </div>
    </div>
  );
};

// --- Actual Content Component ---
const AcademyContent = () => {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  const { academicCategories, academicData, isLoading } = useSelector(state => state.academy);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [categoryId, setCategoryId] = useState(null);

  const fetchAcademy = async (searchOverride) => {
    const finalCategoryId = categoryId || "all";
    const searchValue = typeof searchOverride !== 'undefined' ? (searchOverride || '') : (debouncedSearch?.trim?.() || '');

    await dispatch(
      fetchAcademicData({
        page,
        limit,
        categoryId: finalCategoryId,
        search: searchValue,
      })
    );
  };

  // Initial Categories Fetch
  useEffect(() => {
    dispatch(fetchCategory());
  }, [dispatch]);

  // Sync state with URL search params
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const cid = searchParams.get('categoryId') || null;
    const p = parseInt(searchParams.get('page') || '1', 10) || 1;
    
    setDebouncedSearch(s);
    setCategoryId(cid);
    setPage(p);
  }, [searchParams]);

  // Refetch when page or category changes
  useEffect(() => {
    fetchAcademy();
  }, [page, categoryId]);

  const totalPages = useMemo(() => {
    const total = academicData?.totalPages ?? academicData?.pages ?? null;
    if (typeof total === 'number') return total;
    const totalDocs = academicData?.totalDocs ?? academicData?.total ?? academicData?.count ?? null;
    if (typeof totalDocs === 'number') return Math.max(1, Math.ceil(totalDocs / Math.max(1, limit)));
    return 1;
  }, [academicData, limit]);

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Filters Section */}
      <div className="p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <select
              value={categoryId || 'all'}
              onChange={(e) => {
                const val = e.target.value;
                const params = new URLSearchParams(searchParams.toString());
                if (val === 'all') params.delete('categoryId');
                else params.set('categoryId', val);
                params.set('page', '1');
                router.push(`/academy?${params.toString()}`);
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-700 font-medium bg-white cursor-pointer"
            >
              <option value="all">
                {Array.isArray(academicCategories) ? 'All Categories' : 'Loading categories...'}
              </option>
              {Array.isArray(academicCategories) && academicCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.title}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2" />
        </div>
      </div>

      {/* Course Grid with Category Grouping */}
      <div className="mb-8 container mx-auto px-6 py-4">
        {isLoading ? (
          <SmallLoader loading={true} text="Loading courses..." />
        ) : (() => {
          const raw = academicData?.data || academicData?.docs || academicData?.items || academicData || [];
          const list = Array.isArray(raw) ? raw : (raw?.docs ?? raw?.data ?? []);
          
          if (list.length === 0) {
            return (
              <div className="col-span-full text-center py-20">
                <div className="inline-block p-8 bg-white rounded-2xl shadow-lg">
                  <Icon icon="lucide:search" width={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h3>
                  <p className="text-gray-600 mb-4">Try selecting another category or change page</p>
                  <button onClick={() => fetchAcademy()} className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600">
                    Retry
                  </button>
                </div>
              </div>
            );
          }

          // Grouping logic (as per your original code)
          const byCat = {};
          list.forEach((it) => {
            const catId = (typeof it.category === 'object' ? it.category?._id : it.category) || 'uncategorized';
            if (!byCat[catId]) {
              const catObj = Array.isArray(academicCategories) && academicCategories.find(ac => ac._id === catId);
              byCat[catId] = { 
                title: catObj ? catObj.title : (it.category?.title || 'General'), 
                items: [] 
              };
            }
            byCat[catId].items.push({
              id: it._id || it.id,
              title: it.title || 'Untitled',
              instructor: it.instructor || 'Unknown',
              rating: it.rating ?? 4.5,
              views: it.views ?? 0,
              image: it.image || '/assets/logo/trendyol.png',
              color: 'blue',
              badge: it.badge || 'Video',
            });
          });

          return Object.entries(byCat).map(([id, obj]) => (
            <div key={id} className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{obj.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {obj.items.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Pagination Section */}
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams.toString());
              p.set('page', Math.max(1, page - 1).toString());
              router.push(`?${p.toString()}`);
            }}
            disabled={page <= 1}
            className={`px-3 py-2 rounded-lg shadow ${page <= 1 ? 'bg-gray-200 text-gray-500' : 'bg-white hover:bg-orange-500 hover:text-white'}`}
          >
            Prev
          </button>
          <div className="text-sm text-gray-600 font-medium">Page {page} of {totalPages}</div>
          <button
            onClick={() => {
              const p = new URLSearchParams(searchParams.toString());
              p.set('page', Math.min(totalPages, page + 1).toString());
              router.push(`?${p.toString()}`);
            }}
            disabled={page >= totalPages}
            className={`px-3 py-2 rounded-lg shadow ${page >= totalPages ? 'bg-gray-200 text-gray-500' : 'bg-white hover:bg-orange-500 hover:text-white'}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademyContent;