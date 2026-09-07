import withPWA from "next-pwa";

const config = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})({
  // your normal next config
});

export default config;