declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    fallbacks?: {
      document?: string;
      image?: string;
      font?: string;
      audio?: string;
      video?: string;
    };
    [key: string]: any;
  }

  export default function withPWAInit(
    config?: PWAConfig
  ): (nextConfig?: NextConfig) => NextConfig;
}
