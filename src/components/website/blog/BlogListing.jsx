'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import axiosInstance from '@/config/axiosInstance';
import { Link } from '@/i18n/navigation';

const PAGE_SIZE = 9;
export const fmtBlogDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/** One blog card (used on the blog page and the home page). */
export function BlogCard({ post }) {
  return (
    <article className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative h-48 w-full bg-gray-100">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              unoptimized
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-300">
              <Icon icon="mdi:newspaper-variant-outline" className="w-14 h-14" />
            </div>
          )}
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
          <Icon icon="mdi:calendar" className="w-4 h-4" />
          {fmtBlogDate(post.createdAt)}
        </p>
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600">{post.title}</h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-3 flex-1">{post.description}</p>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 text-xs">#{t}</span>
            ))}
          </div>
        )}
        <Link href={`/blog/${post.slug}`} className="mt-4 text-primary-600 font-medium text-sm inline-flex items-center gap-1">
          Read more <Icon icon="mdi:arrow-right" className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

// Public blog list: search, tag filter, paging. Data: GET /public/blogs, /public/blogs/tags
export default function BlogListing() {
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [tag, setTag] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosInstance.get('/public/blogs/tags').then(({ data }) => setTags(data?.data || [])).catch(() => setTags([]));
  }, []);

  // search waits until typing stops
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/public/blogs', {
        params: { page, limit: PAGE_SIZE, ...(search && { search }), ...(tag && { tag }) },
      });
      setBlogs(data?.data || []);
      setPages(data?.pagination?.totalPages || 1);
      setTotal(data?.pagination?.totalItems || 0);
    } catch {
      setError('Could not load blog posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search, tag]);

  useEffect(() => {
    load();
  }, [load]);

  const pickTag = (t) => {
    setTag(t === tag ? '' : t);
    setPage(1);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        {!loading && <p className="text-sm text-gray-600">{total} article{total === 1 ? '' : 's'}</p>}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button type="button" onClick={() => pickTag('')}
            className={`px-3 py-1.5 rounded-full text-sm ${!tag ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            All
          </button>
          {tags.slice(0, 15).map((t) => (
            <button key={t.tag} type="button" onClick={() => pickTag(t.tag)}
              className={`px-3 py-1.5 rounded-full text-sm ${tag === t.tag ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              #{t.tag} <span className="opacity-70">({t.count})</span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">{error}</p>
          <button type="button" onClick={load} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Try again</button>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Icon icon="mdi:newspaper-variant-outline" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          {search || tag ? 'No articles match your search.' : 'No articles yet. Please check back soon.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((post) => <BlogCard key={post._id} post={post} />)}
        </div>
      )}

      {!loading && pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10 text-sm">
          <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50">Previous</button>
          <span className="text-gray-600">Page {page} of {pages}</span>
          <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= pages} className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50">Next</button>
        </div>
      )}
    </section>
  );
}
