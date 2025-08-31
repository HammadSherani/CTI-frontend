import BlogGrid from "@/components/website/blog/BlogGrid";
import BlogHero from "@/components/website/blog/BlogHero";
import FeaturedPosts from "@/components/website/blog/FeaturedPosts";


const BlogPage = () => {
  return ( 
    <main>
      <BlogHero />
      <FeaturedPosts />
      <BlogGrid />
    </main>
  );
};

export default BlogPage;