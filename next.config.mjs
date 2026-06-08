/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'storage.efipay.com.br' },
    ],
  },
  // Ajustado: serverExternalPackages agora está dentro de experimental
  experimental: {
    serverExternalPackages: ['efipay'],
  },
};

export default nextConfig;