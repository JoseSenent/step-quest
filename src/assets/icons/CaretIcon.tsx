import { useId, type SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {
  strokeColor: string;
  gradientColor1: string;
  gradientColor2: string;
  gradientColor3: string;
  gradientColor4: string;
}

export default function CaretIcon({
  strokeColor = "#000",
  gradientColor1 = "#bbb",
  gradientColor2 = "#888",
  gradientColor3 = "#777",
  gradientColor4 = "#444",
  ...props
}: Props) {
  const id = useId();
  const gradientId = `caret-gradient-${id}`;
  return (
    <svg
      width="17"
      height="41"
      viewBox="0 0 17 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1.24974 21.5872C0.928351 21.1854 0.928351 20.6146 1.24974 20.2129L14.7411 3.34872C15.3906 2.53677 16.7 2.99608 16.7 4.03588V37.7642C16.7 38.804 15.3906 39.2633 14.7411 38.4513L1.24974 21.5872Z"
        fill={strokeColor}
      />
      <path
        d="M15.2842 36.7158L2.63089 20.8994L15.2842 5.08398V36.7158Z"
        fill={`url(#${gradientId})`}
        stroke="#fff"
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="8.92312"
          y1="4.37109"
          x2="8.92312"
          y2="37.4289"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={gradientColor1} />
          <stop offset="0.5" stopColor={gradientColor2} />
          <stop offset="0.5" stopColor={gradientColor3} />
          <stop offset="1" stopColor={gradientColor4} />
        </linearGradient>
      </defs>
    </svg>
  );
}
