"use client";

import React from 'react';
import SubHeader from '@/components/SubHeader';
import SectionTag from '@/components/website/home/sectoinTag';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import BrandsMarque from '@/components/brandsMarque';

const currentDate = "7th Mar 2026";

const PLACEHOLDER_IMG = "https://placehold.co/800x600/1f2937/ffffff/png?text=Tech+Repair";
const trendingArticles = [
  {
    id: 1,
    title: "Common Smartphone Problems and How to Fix Them",
    description: "Discover the most common smartphone issues such as battery drain, slow performance, and how to fix them easily.",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 2,
    title: "New Smartphone Models Released This Month",
    description: "Discover the latest flagship phones from Apple, Samsung, and Google with exciting new features.",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 3,
    title: "Rising Demand for Mobile Repair Services",
    description: "Why more people are choosing repair over replacement in 2026 and what it means for the industry.",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 4,
    title: "New Technologies Changing the Repair Industry",
    description: "AI diagnostics, modular phones, and advanced tools reshaping how we fix smartphones.",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
];

const latestNews = [
  {
    id: 1,
    title: "Apple iPhone 13 Mini Refurbished Deal – Limited Stock",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 2,
    title: "Apple iPhone 13 Mini Refurbished Deal – Best Price",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 3,
    title: "Apple iPhone 13 Mini Refurbished Deal – Fast Delivery",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 4,
    title: "Apple iPhone 13 Mini Refurbished – Trusted Seller",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
];

const blogs = [
  {
    id: 1,
    title: "Common Smartphone Problems and How to Fix Them",
    description: "Discover the most common smartphone issues such as battery drain, slow performance...",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 2,
    title: "Common Smartphone Problems and How to Fix Them",
    description: "Discover the most common smartphone issues such as battery drain, slow performance...",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 3,
    title: "Common Smartphone Problems and How to Fix Them",
    description: "Discover the most common smartphone issues such as battery drain, slow performance...",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 4,
    title: "Common Smartphone Problems and How to Fix Them",
    description: "Discover the most common smartphone issues such as battery drain, slow performance...",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 5,
    title: "Common Smartphone Problems and How to Fix Them",
    description: "Discover the most common smartphone issues such as battery drain, slow performance...",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
  {
    id: 6,
    title: "Common Smartphone Problems and How to Fix Them",
    description: "Discover the most common smartphone issues such as battery drain, slow performance...",
    image: PLACEHOLDER_IMG,
    date: currentDate,
  },
];

export default function TechRepairGuide() {
  const ArticleCard = ({ item, isLarge = false }) => (
    <div className={`group  rounded-2xl overflow-hidden shadow hover:scale-[1.02] transition-transform duration-300 ${isLarge ? 'col-span-1' : ''}`}>
      <div className="relative h-56">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-orange-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-zinc-400 text-sm mt-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500">
          <Icon icon="mdi:calendar" />
          <span>{item.date}</span>
        </div>
      </div>
    </div>
  );

  const BlogCard = ({ item }) => (
    <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
      <div className="relative h-52">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary-600">
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm mt-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <Icon icon="mdi:calendar" />
          <span>{item.date}</span>
        </div>
      </div>
    </div>
  );

 const Blog2Card = ({ item }) => (
    <div className="group grid grid-cols-12 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
      <div className="relative h-52 col-span-5">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5 col-span-7">
        <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary-600">
          {item.title}
        </h3>
        <p className="text-gray-600 text-sm mt-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <Icon icon="mdi:calendar" />
          <span>{item.date}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SubHeader 
        title="Tech Repair Guide" 
        subtitle="Latest articles, news and expert tips to keep your devices running smoothly" 
      />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        
        {/* Trending Articles - Dark Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <SectionTag title="Trending Articles" />
            <a href="#" className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1 text-sm">
              View All <Icon icon="mdi:arrow-right" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingArticles.map(article => (
              <ArticleCard key={article.id} item={article} />
            ))}
          </div>
        </section>
      </div>

<div className='bg-gray-100 rounded-3xl mx-auto px-4 py-12'>

        {/* Latest News - Dark Section */}
        <section className="max-w-7xl mx-auto px-4 py-12 ">
          <div className="flex items-center justify-between mb-6">
            <SectionTag title="Latest news" variant="light" />
            <a href="#" className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1 text-sm">
              View All <Icon icon="mdi:arrow-right" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestNews.map(news => (
              <div key={news.id} className="group bg-white rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform">
                <div className="relative h-56">
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-medium text-base line-clamp-2 group-hover:text-orange-400">
                    {news.title}
                  </h3>
                  <div className="text-xs text-zinc-500 mt-4 flex items-center gap-2">
                    <Icon icon="mdi:calendar" /> {news.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Blogs Section - Light */}
        <section className=" rounded-3xl max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <SectionTag title="Blogs" />
            <a href="#" className="text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1 text-sm">
              View All <Icon icon="mdi:arrow-right" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {blogs.slice(0,3).map(blog => (
              <BlogCard key={blog.id} item={blog} />
            ))}
          </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {blogs.map(blog => (
              <Blog2Card key={blog.id} item={blog} />
            ))}
          </div>
        </section>


        
        </div>


<BrandsMarque/>


    </>
  );
}