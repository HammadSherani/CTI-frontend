import withNextIntl from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add your other Next.js configurations here
  // For example:
  // images: {
  //   domains: ['example.com'],
  // },
  // experimental: {
  //   appDir: true,
  // },
};

export default withNextIntl('./i18n.js')(nextConfig);