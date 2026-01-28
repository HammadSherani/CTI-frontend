"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAcademicData, fetchCategory } from '@/store/academy';
import { useSearchParams, useRouter } from 'next/navigation';
import SmallLoader from '@/components/SmallLoader';



// Reusable Card Component
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
      {/* Image Container with Gradient Overlay */}
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(course.color)} opacity-90 z-10`}></div>
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {course.badge}
          </span>
        </div>

        {/* Instructor Tag */}
        <div className="absolute bottom-3 left-3 z-20">
          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {course.instructor}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-gray-800 font-bold text-base mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors duration-300 min-h-[3rem]">
          {course.title}
        </h3>

        {/* Rating and Views */}
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

        {/* CTA Button */}
        <button className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-md">
          Start Now
        </button>
      </div>
    </div>
  );
};

// Main App Component
const TrendyolAcademy = () => {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const router = useRouter();


  const dispatch=useDispatch()
  const { academicCategories, academicData, isLoading, isError } = useSelector(state => state.academy);

  const [page,setPage]=useState(1);
  const [limit,setLimit]=useState(10);
  const [categoryId,setCategoryId]=useState(null);


  const fetchCategories = async() => {
   await  dispatch(fetchCategory());

  }
  
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


  useEffect(()=>{
    fetchCategories();
    fetchAcademy();
  }, [])

  const searchParams = useSearchParams();

  // refetch when page, limit or selected category id changes
  useEffect(() => {
    fetchAcademy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, categoryId]);

  // sync with URL search params (categoryId, search, page)
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const cid = searchParams.get('categoryId') || null;
    const p = parseInt(searchParams.get('page') || '1', 10) || 1;
    setDebouncedSearch(s);
    setCategoryId(cid);
    setPage(p);
    fetchAcademy(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const totalPages = useMemo(() => {
    const total = academicData?.totalPages ?? academicData?.pages ?? null;
    if (typeof total === 'number') return total;
    const totalDocs = academicData?.totalDocs ?? academicData?.total ?? academicData?.count ?? null;
    if (typeof totalDocs === 'number') return Math.max(1, Math.ceil(totalDocs / Math.max(1, limit)));
    return 1;
  }, [academicData, limit]);

  



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
     
      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <select
                value={categoryId || 'all'}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategoryId(val === 'all' ? null : val);
                  setPage(1);
                  // update URL to keep header and page in sync
                  const params = new URLSearchParams();
                  if (val !== 'all') params.set('categoryId', val);
                  params.set('page', '1');
                  router?.push?.(`/academy?${params.toString()}`)
                }}
                disabled={!Array.isArray(academicCategories)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-700 font-medium bg-white cursor-pointer disabled:opacity-70"
              >
                <option value="all">{Array.isArray(academicCategories) ? 'All Categories' : 'Loading categories...'}</option>
                {Array.isArray(academicCategories) && academicCategories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.title}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2" />
          </div>
        </div>

        {/* Course Grid (from API) */}
        <div className="mb-8 container mx-auto px-6 py-4">
          {isLoading ? (
            <SmallLoader loading={true} text="Loading courses..." />
          ) : (() => {
            const raw = academicData?.data || academicData?.docs || academicData?.items || academicData || [];
            const list = Array.isArray(raw) ? raw : (raw?.docs ?? raw?.data ?? []);

            const courses = (list || []).map((it) => ({
              id: it._id || it.id,
              title: it.title || it.name || 'Untitled',
              instructor: it.instructor || it.author || it.owner || 'Unknown',
              rating: it.rating ?? 4.5,
              views: it.views ?? it.viewCount ?? 0,
              image: it.image || it.thumbnail || '/assets/logo/trendyol.png',
              color: 'blue',
              badge: it.badge || it.type || 'Video',
            }));

            const byCat = {};
            const getCatId = (it) => {
              if (!it) return 'uncategorized';
              if (typeof it.category === 'string') return it.category;
              if (it.category && typeof it.category === 'object') return it.category._id || it.category.id;
              return it.categoryId || it.category_id || it.cat || 'uncategorized';
            };

            const rawItems = Array.isArray(academicData?.docs) ? academicData.docs : (Array.isArray(academicData) ? academicData : list);

            courses.forEach((c) => {
              const matchedRaw = (rawItems || []).find(r => (r._id || r.id) === c.id) || {};
              const catId = getCatId(matchedRaw);
              if (!byCat[catId]) byCat[catId] = { title: null, items: [] };
              const catObj = Array.isArray(academicCategories) && academicCategories.find(ac => ac._id === catId);
              byCat[catId].title = catObj ? catObj.title : (matchedRaw.category?.title || matchedRaw.categoryName || 'General');
              byCat[catId].items.push({ ...c, content: matchedRaw.content || matchedRaw.description || matchedRaw.body || '' });
            });

            const entries = Object.entries(byCat);

            if (entries.length === 0) {
              return (
                <div className="col-span-full text-center py-20">
                  <div className="inline-block p-8 bg-white rounded-2xl shadow-lg">
                    <Icon icon="lucide:search" width={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h3>
                    <p className="text-gray-600 mb-4">Try selecting another category or change page</p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => fetchAcademy()}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return entries.map(([catId, obj]) => (
              <div key={catId} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{obj.title || 'General'}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {obj.items.map(course => (
                    <div key={course.id}>
                      <CourseCard course={course} />
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Pagination - moved to bottom */}
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={`px-3 py-2 rounded-lg shadow ${page <= 1 ? 'bg-gray-200 text-gray-500' : 'bg-white hover:bg-orange-500 hover:text-white'}`}
            >Prev</button>
            <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`px-3 py-2 rounded-lg shadow ${page >= totalPages ? 'bg-gray-200 text-gray-500' : 'bg-white hover:bg-orange-500 hover:text-white'}`}
            >Next</button>
          </div>
        </div>
      </div>
</div>
      
  );
};

export default TrendyolAcademy;