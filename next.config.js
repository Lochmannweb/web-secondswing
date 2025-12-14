// Next.js-delen styrer billedkilder, og Sentry-delen tilføjer komplet fejl- og performance-overvågning omkring resten af projektets konfiguration.


// Filen eksporterer projektets Next.js-opsætning og pakker den ind i Sentry’s withSentryConfig, 
// som tilføjer fejlsporing og performance-monitorering til både server og klient.
const { withSentryConfig } = require('@sentry/nextjs');



// Selve nextConfig indeholder en images-sektion, hvor der gives tilladelse til at loade billeder fra eksterne domæner. 
// Next Image-komponenten kræver eksplicit godkendelse af hvert domæne, så her godkendes Supabase-storage, 
// der bruges til brugeres avatarer, og Googleusercontent, som bruges ved Google-login. 
// remotePatterns definerer præcist, hvilke protokoller, hosts og stier der må hentes billeder fra.
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bumycjssgayamirwtvxx.supabase.co',
        pathname: '/storage/v1/object/public/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};




// withSentryConfig(nextConfig, {...}) tager Next.js-konfigurationen og tilføjer Sentry’s integrationslag rundt om den. 
// Organisation og projekt-navn fortæller Sentry, hvor fejlene skal logges. 
// silent dæmper output i CI-miljøer. 
// widenClientFileUpload giver Sentry mulighed for at håndtere større bundle-uploads fra klienten, så source maps bliver overført korrekt. 
// tunnelRoute definerer en route i dit eget Next.js-setup, så klienten sender Sentry-events gennem din server i stedet for direkte til Sentry, 
// hvilket giver bedre privacy og færre blokerede requests. 
// disableLogger slår Sentry’s interne logger fra, så konsollen ikke fyldes med ekstra logs. 
// automaticVercelMonitors aktiverer Sentry’s automatiske monitorering af serverløse Vercel-funktioner.
module.exports = withSentryConfig(nextConfig, {
  org: 'line-lochmann-mller',
  project: 'typescript-nextjs',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  disableLogger: true,
  automaticVercelMonitors: true,
});



