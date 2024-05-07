const helmet = require('helmet');

// Middleware function to set up security headers using Helmet
const securityMiddleware = () => {
  return [
    // Helmet middleware to set various security headers
    helmet(),

    // Content Security Policy (CSP) header configuration
    helmet.contentSecurityPolicy({
      directives: {
        // Restricts the sources for various types of content
        defaultSrc: ["'self'"], // Allows resources from the same origin
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.example.com'], 
        // Allows scripts from the same origin, inline scripts, eval(), and scripts from a specific CDN
        styleSrc: ["'self'", 'https://fonts.googleapis.com'], 
        // Allows styles from the same origin and from Google Fonts
        fontSrc: ["'self'", 'https://fonts.gstatic.com'], 
        // Allows fonts from the same origin and from Google Fonts
        imgSrc: ["'self'", 'data:'], 
        // Allows images from the same origin, inline images, and images from a specific domain
        objectSrc: ["'none'"], // Disallows plugins like Flash
        upgradeInsecureRequests: [], // Enables HTTPS for resources that are loaded using HTTP
      },
    }),

    // Strict-Transport-Security (HSTS) header configuration
    helmet.hsts({
      maxAge: 31536000, 
      // Specifies the duration (in seconds) that the browser should remember that the site is only 
      //to be accessed using HTTPS
      includeSubDomains: true, // Applies HSTS to all subdomains as well
      preload: true, 
      // Indicates that the site is ready for preloading in the browser's HSTS preload list
    }),

    // X-Content-Type-Options header configuration
    helmet.noSniff(), // Prevents browsers from MIME-sniffing the response type

    // X-Frame-Options header configuration
    helmet.frameguard({
      action: 'deny', // Prevents the page from being rendered in a frame or iframe
    }),

    // Referrer-Policy header configuration
    helmet.referrerPolicy({
      policy: 'strict-origin-when-cross-origin', 
      // Controls how much information is included in the Referer header when navigating from one 
      //page to another
    }),
  ];
};

module.exports = securityMiddleware;
