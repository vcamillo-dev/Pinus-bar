/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'storage.efipay.com.br' },
    ],
  },
  // Como você está na versão 14.2+, ela deve ficar na raiz novamente:
  serverExternalPackages: ['efipay'],
};

export default nextConfig;