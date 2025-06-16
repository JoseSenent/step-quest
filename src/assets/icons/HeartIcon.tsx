import type { SVGProps } from "react";

export default function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 12 12"
      {...props}
    >
      <path
        fill="currentColor"
        d="M5.656 2.737a2.394 2.394 0 0 0-3.447-.01c-.95.975-.945 2.559.01 3.537l3.53 3.623c.146.15.384.15.53 0l3.513-3.602a2.55 2.55 0 0 0-.01-3.535a2.395 2.395 0 0 0-3.45-.009l-.336.345z"
      ></path>
    </svg>
  );
}
