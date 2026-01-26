import React from 'react'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import Image from 'next/image'

export default function BlogSection() {

  const { blogs } = useSelector((state) => state.home || {});

  const loading = blogs === undefined;
  const items = Array.isArray(blogs) ? blogs.slice(0, 3) : (blogs ? [blogs].slice(0,3) : []);

  return (
    <section className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">From our blog</h3>
        <Link href="/blog" className="text-primary-600 font-medium">See all</Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading posts...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No blog posts found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((post) => (
            <article key={post._id || post.id || post.slug} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative h-44 w-full bg-gray-100">
                  {post.image || post.thumbnail || post.featuredImage ? (
                    <Image
                      src={post.image || post.thumbnail || post.featuredImage}
                      alt={post.title || post.name || 'Blog post'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{post.title || post.name}</h4>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{post.excerpt || post.summary || post.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(post.createdAt || post.publishedAt || Date.now()).toLocaleDateString()}</span>
                    <span className="text-primary-600 font-medium">Read</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
