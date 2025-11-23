'use client'

import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const RelatedPostCard = ({ image, title, date, slug }) => (
    <Link href={`/blog/${slug}`} className="flex gap-3 group mb-4">
        <div className="relative w-[70px] h-[70px] rounded-lg overflow-hidden flex-shrink-0">
            <Image
                src={image}
                alt={title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
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
    const [comment, setComment] = useState({
        name: '',
        email: '',
        website: '',
        comment: '',
        saveInfo: false
    });

    // Get Blog Detail
    const getBlogDetail = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/public/blogs/${params.slug}`);
            setBlog(data.data);
            console.log('blog detail', data);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    // Get Featured Blogs
    const getFeaturedBlogs = async () => {
        try {
            const { data } = await axiosInstance.get("/public/blogs/featured");
            setFeaturedBlogs(data.data || []);
        } catch (error) {
            handleError(error);
        }
    };

    // Handle Comment Submit
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        console.log('Comment submitted:', comment);
        // Add your comment submission logic here
    };

    useEffect(() => {
        if (params.slug) {
            getBlogDetail();
            getFeaturedBlogs();
        }
    }, [params.slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Blog not found</p>
            </div>
        );
    }

    return (
        <section className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        {/* Blog Header */}
                        <div className="mb-6">
                            <p className="text-gray-400 text-sm mb-2">
                                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                {blog.title}
                            </h1>
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
                        </div>

                        {/* Featured Image */}
                        <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8">
                            <Image
                                src={blog.featuredImage || "/assets/blog/blog-ban1.png"}
                                alt={blog.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Blog Content */}
                        <div className="prose prose-lg max-w-none mb-12">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {blog.content}
                            </p>
                        </div>

                        {/* Comment Section */}
                        <div className="border-t pt-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                Leave a Reply
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Your email address will not be published. Required fields are marked *
                            </p>

                            <form onSubmit={handleCommentSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Comment*
                                    </label>
                                    <textarea
                                        value={comment.comment}
                                        onChange={(e) => setComment({ ...comment, comment: e.target.value })}
                                        rows="6"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                        required
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Name*
                                        </label>
                                        <input
                                            type="text"
                                            value={comment.name}
                                            onChange={(e) => setComment({ ...comment, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email*
                                        </label>
                                        <input
                                            type="email"
                                            value={comment.email}
                                            onChange={(e) => setComment({ ...comment, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={comment.website}
                                        onChange={(e) => setComment({ ...comment, website: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={comment.saveInfo}
                                            onChange={(e) => setComment({ ...comment, saveInfo: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-600">
                                            Save my name, email, and website in this browser for the next time I comment.
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Post Comment
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6">
                            {/* Post Widget */}
                            <div className="bg-white rounded-lg mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                                    Post Widget
                                </h3>
                                <div>
                                    {featuredBlogs.length > 0 ? (
                                        featuredBlogs.map((featuredBlog) => (
                                            <RelatedPostCard
                                                key={featuredBlog._id}
                                                image={featuredBlog.featuredImage || "/assets/blog/blog-ban1.png"}
                                                title={featuredBlog.title}
                                                date={new Date(featuredBlog.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                                slug={featuredBlog.slug}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No featured blogs</p>
                                    )}
                                </div>
                            </div>

                            {/* Social Media Widget */}
                            <div className="bg-white rounded-lg">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                                    Social Media Widget
                                </h3>
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
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default BlogDetail;