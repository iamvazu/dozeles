// Minimal inline SVG icon set (no icon library dependency)
const paths = {
  sparkles: 'M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4L12 3zm7 10l.9 2.3 2.1.7-2.1.7L19 19l-.9-2.3-2.1-.7 2.1-.7L19 13zM5 14l.9 2.3 2.1.7-2.1.7L5 20l-.9-2.3-2.1-.7 2.1-.7L5 14z',
  clock: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 5h-2v6l5 3 1-1.7-4-2.3V7z',
  badge: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z',
  sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',
  leaf: 'M5 21c0-9 4-15 14-16-1 10-7 15-14 16zm0 0c3-3 6-5 10-6',
  shield: 'M12 2l8 3v6c0 5-3.5 9.4-8 11-4.5-1.6-8-6-8-11V5l8-3z',
  home: 'M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V11z',
  building: 'M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M4 21h16M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2',
  store: 'M3 9l1.5-5h15L21 9M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18M9 21v-6h6v6',
  landmark: 'M3 22h18M4 18h16M6 18v-7m4 7v-7m4 7v-7m4 7v-7M2 11l10-7 10 7H2z',
  truck: 'M1 5h14v11H1V5zm14 4h4l3 3v4h-7V9zM6 19a2 2 0 100-4 2 2 0 000 4zm12 0a2 2 0 100-4 2 2 0 000 4z',
  hardhat: 'M4 16a8 8 0 0116 0M2 16h20v3H2v-3zM10 5h4v4h-4z',
  key: 'M15 9a4 4 0 11-4-4M15 9l6-6M18 6l2 2M15 9l-8.5 8.5a2 2 0 01-3-3L12 6',
  phone: 'M5 3h4l2 5-3 2a13 13 0 006 6l2-3 5 2v4a2 2 0 01-2 2A17 17 0 013 5a2 2 0 012-2z',
  mail: 'M3 5h18v14H3V5zm0 2l9 6 9-6',
  pin: 'M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12zm0-9a3 3 0 100-6 3 3 0 000 6z',
  caret: 'M6 9l6 6 6-6',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  grid: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z',
  star: 'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9L12 3z',
  users: 'M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8',
  image: 'M3 3h18v18H3V3zm2 14l4.5-5 3.5 4 3-2.5L19 17M8.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
};

export default function Icon({ name, size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.sparkles} />
    </svg>
  );
}
