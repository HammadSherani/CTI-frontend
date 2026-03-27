'use client'

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Loader from '@/components/Loader';
import { toast } from 'react-toastify';

// Validation Schema
const commentSchema = yup.object({
    name: yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters'),
    email: yup.string()
        .required('Email is required')
        .email('Please enter a valid email address'),
    comment: yup.string()
        .required('Comment is required')
        .min(10, 'Comment must be at least 10 characters')
        .max(500, 'Comment must not exceed 500 characters'),
    saveInfo: yup.boolean()
}).required();

const RelatedPostCard = ({ image, title, date, slug }) => (
    <Link href={`/blog/${slug}`} className="flex gap-3 group mb-4">
        <div className="relative w-[70px] h-[70px] rounded-lg overflow-hidden flex-shrink-0">
            <Image
                src={image}
                alt={title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="70px"
            />
        </div>
        <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-semibold text-sm leading-snug text-gray-900 group-hover:text-primary-600 transition-colors mb-1 line-clamp-2">
                {title}
            </h3>
            <p className="text-xs text-gray-400 font-normal">{date}</p>
        </div>
    </Link>
);

const SocialMediaButton = ({ platform, icon, color, link }) => (
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-between px-4 py-3 rounded-lg ${color} text-white font-semibold hover:opacity-90 transition-opacity`}
        aria-label={`Follow us on ${platform}`}
    >
        <span className="flex items-center gap-2">
            {icon}
            {platform}
        </span>
        <span className="text-sm">FOLLOW</span>
    </a>
);

const BlogDetail = () => {
    const params = useParams();
    const [blog, setBlog] = useState(null);
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    // React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm({
        resolver: yupResolver(commentSchema),
        defaultValues: {
            name: '',
            email: '',
            comment: '',
            saveInfo: false
        }
    });

    const saveInfo = watch('saveInfo');

    // Fetch Blog Data
    const fetchBlogData = useCallback(async () => {
        if (!params?.slug) return;

        setLoading(true);
        setError(null);

        try {
            const [blogRes, featuredRes] = await Promise.all([
                axiosInstance.get(`/public/blogs/${params.slug}`),
                axiosInstance.get("/public/blogs/featured?limit=5")
            ]);

            setBlog(blogRes.data.data);
            setFeaturedBlogs(featuredRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch blog data:', err);
            handleError(err);
            setError('Failed to load blog. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [params?.slug]);

    // Comment Submit Handler
    const onSubmitComment = async (data) => {
        try {
            setCommentSubmitting(true);

            // Prepare payload
            const payload = {
                name: data.name.trim(),
                email: data.email.trim(),
                comment: data.comment.trim()
            };

            // API Call
            const response = await axiosInstance.post('/public/comments', payload);

            // Success
            console.log('Comment submitted successfully:', response.data);
            
            // Show success message (using toast or alert)
            toast?.success('Comment submitted successfully! It will be visible after approval.') || 
            alert('Comment submitted successfully!');

            // Reset form based on saveInfo checkbox
            if (data.saveInfo) {
                // Save name and email, only clear comment
                reset({
                    name: data.name,
                    email: data.email,
                    comment: '',
                    saveInfo: true
                });
            } else {
                // Clear everything
                reset();
            }

        } catch (err) {
            console.error('Failed to submit comment:', err);
            handleError(err);
            toast?.error('Failed to submit comment. Please try again.') ||
            alert('Failed to submit comment. Please try again.');
        } finally {
            setCommentSubmitting(false);
        }
    };

    useEffect(() => {
        fetchBlogData();
    }, [fetchBlogData]);

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Loading State
    if (loading) {
        return <Loader loading={true} />;
    }

    // Error State
    if (error || !blog) {
        return (
            <div className="bg-white">
                <div className="px-12 py-3">
                    <Breadcrumb />
                </div>
                <section className="bg-white pb-16 pt-5">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center py-12">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
                            <p className="text-gray-600 mb-6">{error || 'The requested blog could not be loaded.'}</p>
                            <Link 
                                href="/blog" 
                                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Back to Blogs
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="px-12 py-3">
                <Breadcrumb />
            </div>
            <section className="bg-white pb-16 pt-5">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Main Content */}
                        <article className="lg:col-span-8">
                            {/* Blog Header */}
                            <header className="mb-6">
                                <time className="text-gray-400 text-sm mb-2 block">
                                    {formatDate(blog.createdAt)}
                                </time>
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                    {blog.title}
                                </h1>
                                {blog.tags?.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {blog.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </header>

                            {/* Featured Image */}
                            {blog.featuredImage && (
                                <figure className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8">
                                    <Image
                                        src={blog.featuredImage}
                                        alt={blog.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                                        priority
                                    />
                                </figure>
                            )}

                            {/* Blog Content */}
                            <div
                                className="prose prose-lg max-w-none mb-12"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />

                            {/* Comment Section */}
                            <section className="border-t pt-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Leave a Reply
                                </h2>
                                <p className="text-sm text-gray-600 mb-6">
                                    Your email address will not be published. Required fields are marked *
                                </p>

                                <form onSubmit={handleSubmit(onSubmitComment)} noValidate>
                                    {/* Comment Field */}
                                    <div className="mb-6">
                                        <label 
                                            htmlFor="comment" 
                                            className="block text-sm font-semibold text-gray-700 mb-2"
                                        >
                                            Comment*
                                        </label>
                                        <textarea
                                            id="comment"
                                            {...register('comment')}
                                            rows="6"
                                            disabled={commentSubmitting}
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-colors ${
                                                errors.comment 
                                                    ? 'border-red-500 focus:ring-red-500' 
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="Write your comment here..."
                                        />
                                        {errors.comment && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.comment.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Name and Email Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Name Field */}
                                        <div>
                                            <label 
                                                htmlFor="name" 
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                            >
                                                Name*
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                {...register('name')}
                                                disabled={commentSubmitting}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                                                    errors.name 
                                                        ? 'border-red-500 focus:ring-red-500' 
                                                        : 'border-gray-300'
                                                }`}
                                                placeholder="Your name"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label 
                                                htmlFor="email" 
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                            >
                                                Email*
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                {...register('email')}
                                                disabled={commentSubmitting}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                                                    errors.email 
                                                        ? 'border-red-500 focus:ring-red-500' 
                                                        : 'border-gray-300'
                                                }`}
                                                placeholder="your.email@example.com"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Save Info Checkbox */}
                                    <div className="mb-6">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                {...register('saveInfo')}
                                                disabled={commentSubmitting}
                                                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">
                                                Save my name and email in this browser for the next time I comment.
                                            </span>
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={commentSubmitting}
                                        className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {commentSubmitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            'Post Comment'
                                        )}
                                    </button>
                                </form>
                            </section>
                        </article>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4">
                            <div className="sticky top-6 space-y-8">
                                {/* Post Widget */}
                                <section className="bg-white rounded-lg">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                                        Related Posts
                                    </h2>
                                    <div>
                                        {featuredBlogs.length > 0 ? (
                                            featuredBlogs.map((featuredBlog) => (
                                                <RelatedPostCard
                                                    key={featuredBlog._id}
                                                    image={featuredBlog.featuredImage || "/assets/blog/blog-ban1.png"}
                                                    title={featuredBlog.title}
                                                    date={formatDate(featuredBlog.createdAt)}
                                                    slug={featuredBlog.slug}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm text-center py-4">
                                                No related posts available
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* Social Media Widget */}
                                <section className="bg-white rounded-lg">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                                        Follow Us
                                    </h2>
                                    <div className="space-y-3">
                                        <SocialMediaButton
                                            platform="Facebook"
                                            color="bg-[#3b5998]"
                                            link="https://facebook.com"
                                            icon={
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                            }
                                        />
                                        <SocialMediaButton
                                            platform="Instagram"
                                            color="bg-gradient-to-r from-purple-500 to-pink-500"
                                            link="https://instagram.com"
                                            icon={
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                </svg>
                                            }
                                        />
                                        <SocialMediaButton
                                            platform="Youtube"
                                            color="bg-[#FF0000]"
                                            link="https://youtube.com"
                                            icon={
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                            }
                                        />
                                        <SocialMediaButton
                                            platform="Linkedin"
                                            color="bg-[#0077b5]"
                                            link="https://linkedin.com"
                                            icon={
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                </svg>
                                            }
                                        />
                                    </div>
                                </section>
                            </div>
                        </aside>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogDetail;