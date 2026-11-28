import SubHeader from "@/components/SubHeader";
import BlogListing from "@/components/website/blog/BlogListing";

// Blog list from the admin panel (only published, active posts)
const BlogPage = () => {
  return (
    <main>
      <SubHeader
        title="Repair Tips & Guides"
        subtitle="Advice, how-tos and news about phone and device repairs."
      />
      <BlogListing />
    </main>
  );
};

export default BlogPage;
