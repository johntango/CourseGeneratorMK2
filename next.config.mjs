/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Accept both localhost and your Codespaces proxy host
      allowedOrigins: [
        'localhost:3000',
        process.env.CODESPACE_NAME
          ? `${process.env.CODESPACE_NAME}-3000.app.github.dev`
          : undefined,
      ].filter(Boolean),
    },
  },
};
export default nextConfig;