/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  exclude: ["/admin", "/admin/*", "/dashboard", "/api/*", "/checkout", "/cart", "/sign-in"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/dashboard", "/api", "/checkout", "/cart"] },
    ],
  },
};
