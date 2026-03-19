/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add your other Next.js configurations here
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'clicktointegrate.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**', // allows all paths under this domain
      }, {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // experimental: {
  //   appDir: true,
  // },
};

export default nextConfig;
