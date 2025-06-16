import type { SVGProps } from "react";

export default function AttackButtonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={48}
      height={48}
      viewBox="0 0 48 48"
      {...props}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
      >
        <path fill="currentColor" d="m17 13l7-9l7 9l-5 26h-4z"></path>
        <path d="M17 39h14m-7 0v6"></path>
      </g>
    </svg>
  );
}
