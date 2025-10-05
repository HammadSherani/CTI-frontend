// app/components/blog/BlogGrid.jsx
import Image from 'next/image';
import Link from 'next/link';

// Sample data for blog posts
const posts = [
  {
    slug: 'new-apartment-nice',
    imageUrl: '/assets/blog/blog1.jpg',
    date: 'November 7, 2022',
    title: 'New Apartment Nice in the Best Canadian Cities',
    excerpt: 'Bringing the culture of sharing to everyone',
  },
  // Add 7 more post objects here to make a grid of 8
  { slug: 'post-2', imageUrl: '/assets/blog/blog2.jpg', date: 'November 7, 2022', title: 'New Apartment Nice in the Best Canadian Cities', excerpt: 'Bringing the culture of sharing to everyone' },
  { slug: 'post-3', imageUrl: '/assets/blog/blog3.jpg', date: 'November 7, 2022', title: 'New Apartment Nice in the Best Canadian Cities', excerpt: 'Bringing the culture of sharing to everyone' },
  { slug: 'post-4', imageUrl: '/assets/blog/blog4.jpg', date: 'November 7, 2022', title: 'New Apartment Nice in the Best Canadian Cities', excerpt: 'Bringing the culture of sharing to everyone' },
  { slug: 'post-5', imageUrl: '/assets/blog/blog1.jpg', date: 'November 7, 2022', title: 'New Apartment Nice in the Best Canadian Cities', excerpt: 'Bringing the culture of sharing to everyone' },
  { slug: 'post-6', imageUrl: '/assets/blog/blog2.jpg', date: 'November 7, 2022', title: 'New Apartment Nice in the Best Canadian Cities', excerpt: 'Bringing the culture of sharing to everyone' },
  { slug: 'post-7', imageUrl: '/assets/blog/blog3.jpg', date: 'November 7, 2022', title: 'New Apartment Nice in the Best Canadian Cities', excerpt: 'Bringing the culture of sharing to everyone' },
  { slug: 'post-8', imageUrl: '/assets/blog/blog4.jpg', date: 'November 7, 2022', title: 'New Apartment Nice in the Best Canadian Cities', excerpt: 'Bringing the culture of sharing to everyone' },
];


// --- Enhanced Blog Card Component ---
const BlogCard = ({ post }) => {
    return (
        <Link href={`/blog/${post.slug}`}>
            <div className="bg-white  rounded-lg border border-gray-200/80 overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative w-full h-52 overflow-hidden">
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
                
                {/* Content */}
                <div className="p-5">
                    <p className="text-xs text-gray-500 mb-2">{post.date}</p>
                    <h3 className="text-lg font-bold text-gray-800 leading-tight group-hover:text-primary-600 transition-colors duration-300">
                        {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                        {post.excerpt}
                    </p>
                </div>
            </div>
        </Link>
    );
}

// --- Main Blog Grid ---
const BlogGrid = () => {
    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {posts.map((post) => (
                        <BlogCard key={post.slug} post={post} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogGrid;