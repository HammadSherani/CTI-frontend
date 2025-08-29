import Image from 'next/image';

const BlogHero = () => {
  return (
    <section className="relative w-full h-80 flex items-center justify-center">
      <Image
        src="/assets/blog/blog-bg.png"
        alt="People collaborating on a project"
        fill
        className="object-cover"
        priority
      />
    </section>
  );
};

export default BlogHero;