interface SpotifyIconProps {
  className?: string;
  size?: number;
}

/**
 * Spotify logo as a transparent outline icon (uses currentColor).
 * Not the official green-filled mark — meant for monochrome UI use.
 */
const SpotifyIcon = ({ className, size = 20 }: SpotifyIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M7 9.5c3.5-1 7.5-.7 10.5 1" />
    <path d="M7.5 13c3-.8 6.3-.6 8.8 1" />
    <path d="M8 16.2c2.4-.7 4.9-.5 6.8.8" />
  </svg>
);

export default SpotifyIcon;
