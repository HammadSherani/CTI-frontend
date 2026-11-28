import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from '@/i18n/navigation';
import { BlogCard } from '@/components/website/blog/BlogListing';

// Latest published posts (from the home API, which only returns published, active blogs)
export default function BlogSection() {
  const { blogs } = useSelector((state) => state.home || {});

  const loading = blogs === undefined;
  const items = Array.isArray(blogs) ? blogs.slice(0, 3) : [];

  // Nothing published yet: hide the section instead of showing an empty block
  if (!loading && items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">From our blog</h3>
        <Link href="/blog" className="text-primary-600 font-medium">See all</Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading posts...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((post) => (
            <BlogCard key={post._id || post.slug} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}
