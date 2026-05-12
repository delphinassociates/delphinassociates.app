import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Delphin Associates',
    short_name: 'Delphin Associates',
    description: 'Enterprise Construction Daily Site Monitoring System',
    start_url: '/',
    scope: '/',
    id: 'com.delphin.associates',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    background_color: '#000000',
    theme_color: '#D4AF37',
    orientation: 'any',
    dir: 'ltr',
    lang: 'en',
    categories: ['business', 'productivity', 'utilities'],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: 'Admin Dashboard',
        short_name: 'Dashboard',
        description: 'Jump to the admin dashboard',
        url: '/admin/dashboard',
        icons: [{ src: '/appstore-images/android/launchericon-96x96.png', sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Reports',
        short_name: 'Reports',
        description: 'View all site reports',
        url: '/admin/reports',
        icons: [{ src: '/appstore-images/android/launchericon-96x96.png', sizes: '96x96', type: 'image/png' }],
      },
    ],
    icons: [
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
        src: '/appstore-images/android/launchericon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/logo.png',
        sizes: '1024x1024',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Delphin Associates Dashboard',
      },
      {
        src: '/icon-square.png',
        sizes: '512x512',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Delphin Associates Mobile',
      },
    ],
  };
}
