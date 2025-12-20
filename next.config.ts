import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   env: {
    USE_PROXY: process.env.USE_PROXY,
    PROXY_BASE_URL: process.env.PROXY_BASE_URL,
    AUTH_URL: process.env.AUTH_URL,
    CUSTOMER_URL: process.env.CUSTOMER_URL,
    SHOPKEEPER_URL: process.env.SHOPKEEPER_URL,
    AGENT_URL: process.env.AGENT_URL,
    EMAIL_URL: process.env.EMAIL_URL,
    AUDIT_LOG_URL: process.env.AUDIT_LOG_URL,
  },
};

export default nextConfig;
