'use client';

import { useParams } from 'next/navigation';
import BlogDetail from '@/components/website/blog/BlogDetail';

// One blog post from the admin panel (was a fixed, hard-coded guide for every slug)
export default function BlogPostPage() {
  const { slug } = useParams();
  return <BlogDetail slug={slug} />;
}
