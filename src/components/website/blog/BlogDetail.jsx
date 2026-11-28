'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import DOMPurify from 'isomorphic-dompurify';
import axiosInstance from '@/config/axiosInstance';
import { Link } from '@/i18n/navigation';
import { BlogCard, fmtBlogDate } from './BlogListing';

const looksLikeHtml = (s) => /<\/?[a-z][\s\S]*>/i.test(s || '');
const readMinutes = (text) => Math.max(1, Math.round(String(text || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200));

// One published blog post. Data: GET /public/blogs/:slug and /public/blogs/related/:slug
export default function BlogDetail({ slug }) {
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    axiosInstance.get(`/public/blogs/${encodeURIComponent(slug)}`)
      .then(({ data }) => setPost(data?.data || null))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    axiosInstance.get(`/public/blogs/related/${encodeURIComponent(slug)}`, { params: { limit: 3 } })
      .then(({ data }) => setRelated(data?.data || []))
      .catch(() => setRelated([]));
  }, [slug]);

  // Admin-written content: plain text (paragraphs) or HTML (cleaned before showing)
  const body = useMemo(() => {
    const content = post?.content || '';
    if (looksLikeHtml(content)) return { html: DOMPurify.sanitize(content) };
    return { paragraphs: content.split(/\n\s*\n|\r\n\s*\r\n/).map((p) => p.trim()).filter(Boolean) };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Icon icon="mdi:newspaper-remove" className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-gray-900">Article not found</h1>
          <p className="text-gray-600 mt-1">It may have been removed or is not published.</p>
          <Link href="/blog" className="inline-block mt-5 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            All articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white">
      <article className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6">
          <Icon icon="mdi:arrow-left" className="w-4 h-4" /> All articles
        </Link>

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">#{t}</span>
            ))}
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8">
          <span className="flex items-center gap-1"><Icon icon="mdi:calendar" />{fmtBlogDate(post.createdAt)}</span>
          <span className="flex items-center gap-1"><Icon icon="mdi:clock-outline" />{readMinutes(post.content)} min read</span>
          {post.author && <span className="flex items-center gap-1"><Icon icon="mdi:account" />{post.author === 'admin' ? 'CTI Team' : post.author}</span>}
        </div>

        {post.featuredImage && (
          <div className="relative h-64 md:h-[420px] rounded-2xl overflow-hidden mb-10 bg-gray-100">
            <Image src={post.featuredImage} alt={post.title} fill unoptimized className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" priority />
          </div>
        )}

        {post.description && <p className="text-lg text-gray-700 leading-relaxed mb-8 font-medium">{post.description}</p>}

        {body.html ? (
          <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: body.html }} />
        ) : (
          <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
            {body.paragraphs.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.slice(0, 3).map((r) => <BlogCard key={r._id} post={r} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
