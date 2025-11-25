'use client'

import Loader from '@/components/Loader';
import Breadcrumb from '@/components/ui/Breadcrumb';
import axiosInstance from '@/config/axiosInstance';
import handleError from '@/helper/handleError';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const BlogCard = ({ src, alt, className = '' }) => (
    <div className={`relative rounded-lg overflow-hidden shadow-lg group ${className}`}>
        <Image
            src={src}
            alt={alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
    </div>
);

const RelatedPostCard = ({ image, title, date, slug }) => (
    <Link href={`/blog/${slug}`} className="flex gap-4 group">
        <div className="relative w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0">
            <Image
                src={image}
                alt={title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
        </div>
        <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-[15px] leading-snug text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                {title}
            </h3>
            <p className="text-sm text-gray-400 font-normal">{date}</p>
        </div>
    </Link>
);

const FeaturedPosts = () => {

    const [blogs, setBlogs] = useState([]);
    const [featuredBlog, setFeaturedBlog] = useState([]);
    const [tags, setTags] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('all');
    const [loading, setLoading] = useState(true);
    const { token } = useSelector(state => state.auth);

    // Get Blogs with optional filters
    const getBlogs = async (tag = null, search = null) => {
        try {
            setLoading(true);

            // Build query parameters
            const params = new URLSearchParams();
            if (tag && tag !== 'all') {
                params.append('tag', tag);
            }
            if (search && search.trim()) {
                params.append('search', search.trim());
            }

            const queryString = params.toString();
            const url = `/public/blogs${queryString ? `?${queryString}` : ''}`;

            const { data } = await axiosInstance.get(url, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });

            setBlogs(data.data || []);
            console.log('blogs', data);

        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    // Get Tags
    const getTags = async () => {
        try {
            const { data } = await axiosInstance.get("/public/blogs/tags");
            setTags(data.data || []);
            console.log('tags', data);
        } catch (error) {
            handleError(error);
        }
    };

    // Get Featured Blogs
    const getFeaturedBlogs = async () => {
        try {
            const { data } = await axiosInstance.get("/public/blogs/featured");
            setFeaturedBlog(data.data || []);
            console.log('featured blogs', data);
        } catch (error) {
            handleError(error);
        }
    };

    // Handle tag change
    const handleTagChange = (e) => {
        const tag = e.target.value;
        setSelectedTag(tag);
        getBlogs(tag, searchQuery);
    };

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery !== undefined) {
                getBlogs(selectedTag, searchQuery);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {
        getFeaturedBlogs();
        getTags();
        getBlogs();
    }, []);

    return (

        <Loader loading={loading}>
            <div className='bg-white'>
                <div className='px-12 py-3'>
                <Breadcrumb />
            </div>
            <section className="bg-white pb-16 pt-5">

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-8 text-center flex items-center justify-center flex-col">
                        <h2 className="text-5xl mb-1 font-bold text-gray-800">Our News</h2>
                        <p className="text-gray-600 mt-1 max-w-[800px]">
                            Reliable mobile repair solutions, premium spare parts, and affordable refurbished devices designed to keep you connected without compromise.
                        </p>
                    </div>

                    {/* Search and Filter Section */}
                    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mb-8'>
                        {/* Tags Dropdown */}
                        {/* <div className="w-full sm:w-auto">
                        <select
                            name="tags"
                            value={selectedTag}
                            onChange={handleTagChange}
                            className="w-full sm:w-[200px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-700 font-medium cursor-pointer transition-all"
                        >
                            <option value="all">All Categories</option>
                            {tags.map((tagItem) => (
                                <option key={tagItem.tag} value={tagItem.tag}>
                                    {tagItem.tag.charAt(0).toUpperCase() + tagItem.tag.slice(1)} 
                                </option>
                            ))}
                        </select>
                    </div> */}

                        {/* Search Input */}
                        {/* <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-md">
                            <input
                                type="text"
                                placeholder="Search blogs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                            <svg
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div> */}
                    </div>



                    {/* Blogs Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        <div className="lg:col-span-9">
                            {blogs.length > 0 ? (
                                <div className="grid grid-cols-1  gap-6">
                                    {blogs.map((blog) => (
                                        <Link key={blog._id} href={`/blog/${blog.slug}`} className="group">
                                            <BlogCard
                                                src={blog.featuredImage || "/assets/blog/blog-ban1.png"}
                                                alt={blog.title}
                                                className="h-[500px]"
                                            />
                                            <div className="mt-4">
                                                <div className="flex gap-2 mb-2">
                                                    {blog.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="px-3 py-1 bg-primary-100 text-primary-600 text-xs font-medium rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                                    {blog.description}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : !loading ? (
                                <div className="text-center py-16">
                                    <p className="text-gray-500 text-lg">No blogs found</p>
                                </div>
                            ) : null}
                        </div>

                        {/* Sidebar - Featured Blogs */}
                        <div className="lg:col-span-3">
                            <div className="sticky top-6">
                                <div className="bg-white rounded-lg">
                                    <div className="space-y-6">
                                        {featuredBlog.length > 0 ? (
                                            featuredBlog.map((blog) => (
                                                <RelatedPostCard
                                                    key={blog._id}
                                                    image={blog.featuredImage || "/assets/blog/blog-ban1.png"}
                                                    title={blog.title}
                                                    date={new Date(blog.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                    slug={blog.slug}
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500 text-sm">No featured blogs</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
            </div>
            
        </Loader>
    );
};

export default FeaturedPosts;