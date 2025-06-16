import type { SVGProps } from "react";

export default function DefenseButtonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={48}
      height={48}
      viewBox="0 0 48 48"
      {...props}
    >
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={4}
        d="M6 8.256L24.009 3L42 8.256v10.778A26.32 26.32 0 0 1 24.003 44A26.32 26.32 0 0 1 6 19.029z"
      ></path>
    </svg>
  );
}
