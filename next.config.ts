import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  // Ensure Node.js specific modules are not bundled for the client
  serverExternalPackages: [
    'genkit', 
    'openai', 
    'razorpay', 
    '@genkit-ai/google-genai',
    'wav'
  ],
};

export default nextConfig;
