export interface LogoProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

export const Logo = ({ width = 200, height = "auto", color = "currentColor" }: LogoProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 40"
    width={width}
    height={height}
    fill={color}
    aria-label="B3"
    role="img"
  >
    <text
      x="0"
      y="32"
      fontFamily="system-ui, sans-serif"
      fontWeight="700"
      fontSize="38"
    >
      b3
    </text>
  </svg>
);
