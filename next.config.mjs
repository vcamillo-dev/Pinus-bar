/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'storage.efipay.com.br' },
    ],
  },
  experimental: {
    serverExternalPackages: ['efipay'],
  },
};

export default nextConfig;