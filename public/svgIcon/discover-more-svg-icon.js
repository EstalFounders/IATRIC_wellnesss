import { color_schema } from "../../src/constant";

export const ConsultationSVGIcon = ({
  color = `${color_schema.yellow}`,
  size,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Person 1 */}
    <circle cx="16" cy="20" r="6" stroke={color} strokeWidth="2" />
    <rect
      x="10"
      y="30"
      width="12"
      height="10"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />

    {/* Person 2 */}
    <circle cx="48" cy="20" r="6" stroke={color} strokeWidth="2" />
    <rect
      x="42"
      y="30"
      width="12"
      height="10"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />

    {/* Chat bubbles */}
    <rect
      x="20"
      y="6"
      width="20"
      height="10"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />
    <path d="M28 16 L28 20 L32 16" stroke={color} strokeWidth="2" />
  </svg>
);

export const HomecareIcon = ({ color, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M32 10L10 28H16V52H48V28H54L32 10Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M32 36C29 30 22 31 22 36C22 39 26 42 32 48C38 42 42 39 42 36C42 31 35 30 32 36Z"
      fill={color}
    />
  </svg>
);

export const ClinicIcon = ({ color, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="14"
      y="20"
      width="36"
      height="32"
      rx="2"
      stroke={`${color}`}
      strokeWidth="2"
      fill="none"
    />
    <path d="M32 26V36" stroke={color} strokeWidth="2" />
    <path d="M27 31H37" stroke={color} strokeWidth="2" />
    <path d="M20 20V14H44V20" stroke={color} strokeWidth="2" />
  </svg>
);

export const CommunityIcon = ({ color, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="32" cy="32" r="28" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="20" cy="28" r="4" fill={color} />
    <circle cx="44" cy="28" r="4" fill={color} />
    <circle cx="32" cy="40" r="4" fill={color} />
    <path d="M32 28V36M28 32H36" stroke={color} strokeWidth="2" />
  </svg>
);

export const CorporateHealthIcon = ({ color, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="12"
      y="16"
      width="40"
      height="36"
      rx="2"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <path d="M24 44H40" stroke={color} strokeWidth="2" />
    <path d="M32 20V36" stroke={color} strokeWidth="2" />
    <path d="M28 28H36" stroke={color} strokeWidth="2" />
  </svg>
);
