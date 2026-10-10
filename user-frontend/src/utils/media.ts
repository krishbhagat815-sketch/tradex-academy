const PROD_BACKEND = "https://tradex-academy.onrender.com";

export function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/uploads')) {
    const backendOrigin = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : (typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? ''
          : PROD_BACKEND);
    return `${backendOrigin}${url}`;
  }
  return url;
}
