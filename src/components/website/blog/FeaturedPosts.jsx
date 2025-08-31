import Image from 'next/image';
import Link from 'next/link';

// Reusable component for the image containers
const FeaturedImage = ({ src, alt, className = '' }) => (
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

const FeaturedPosts = () => {
    return (
        <section className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Our Blog</h2>
                    <p className="text-gray-500 mt-1">See how you can up your career status</p>
                </div>
                
                {/* Asymmetrical Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[500px]">
                    {/* Large Image on the Left */}
                    <FeaturedImage src="/assets/blog/blog-ban1.png" alt="Woman working on a laptop at a cafe" className='lg:col-span-3 h-full'/>


                    {/* Two Smaller Images on the Right */}
                    <div className="lg:col-span-2 h-full grid grid-rows-2 gap-6">
                            <FeaturedImage src="/assets/blog/blog-ban2.png" alt="Person typing on a laptop" />
                        
                            <FeaturedImage src="/assets/blog/blog-ban3.png" alt="Illustration of blogging concepts" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedPosts;