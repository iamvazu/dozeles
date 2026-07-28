// Brand social icons (filled paths — these are logos, not line icons)
const BRAND = {
  facebook:
    'M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z',
  instagram:
    'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2m0 5.1A4.7 4.7 0 1016.7 12 4.7 4.7 0 0012 7.3m0 7.7A3 3 0 1115 12a3 3 0 01-3 3m5.9-7.9a1.1 1.1 0 11-1.1-1.1 1.1 1.1 0 011.1 1.1z',
  youtube:
    'M23 12s0-3.2-.4-4.7a2.5 2.5 0 00-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5a2.5 2.5 0 00-1.8 1.8C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 001.8 1.8c1.5.5 8.8.5 8.8.5s7.3 0 8.8-.5a2.5 2.5 0 001.8-1.8C23 15.2 23 12 23 12zM9.7 15.3V8.7l6.1 3.3z',
  google:
    'M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5a4.7 4.7 0 01-2 3.1v2.6h3.2a9.6 9.6 0 003.1-7.6zM12 22a9.4 9.4 0 006.5-2.4l-3.2-2.5a5.9 5.9 0 01-8.8-3.1H3.2v2.6A10 10 0 0012 22zM6.5 14a5.9 5.9 0 010-3.8V7.6H3.2a10 10 0 000 8.8zM12 5.9a5.4 5.4 0 013.8 1.5l2.8-2.8A9.6 9.6 0 0012 2a10 10 0 00-8.8 5.4l3.3 2.6A5.9 5.9 0 0112 5.9z',
};

export const SOCIALS = [
  { key: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/' },
  { key: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/' },
  { key: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/' },
  {
    key: 'google',
    label: 'Google Business Profile',
    url: 'https://www.google.com/maps/place/Dozeles+Professional+Cleaning',
  },
];

export default function Social({ name, size = 16, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={BRAND[name]} />
    </svg>
  );
}
