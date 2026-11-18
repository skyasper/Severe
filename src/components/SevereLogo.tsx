interface SevereLogoProps {
  className?: string;
}

export function SevereLogo({ className = 'w-7 h-7' }: SevereLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" fill="#0A0A0A" />
      <rect x="4" y="4" width="56" height="56" stroke="#FFFFFF" strokeWidth="2" />
      <rect x="12" y="12" width="40" height="40" stroke="#8B1E2D" strokeWidth="2" />
      <path
        d="M40 21H24V31H38V43H22"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="40" y="39" width="6" height="6" fill="#8B1E2D" />
    </svg>
  );
}
