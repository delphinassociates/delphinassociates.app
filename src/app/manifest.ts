import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Delphin Associates',
    short_name: 'Delphin Associates',
    description: 'Enterprise Construction Daily Site Monitoring System',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#D4AF37',
    orientation: 'any',
    scope: '/',
    dir: 'ltr',
    lang: 'en',
    id: 'com.delphin.associates',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/appstore-images/android/launchericon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/appstore-images/android/launchericon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/appstore-images/android/launchericon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/appstore-images/android/launchericon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/appstore-images/android/launchericon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-square.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/appstore-images/android/launchericon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
