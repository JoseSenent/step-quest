export default function AttackExclamationStatusIcon({
  className,
  strokeColor,
  strokeWeight,
}: {
  className?: string;
  strokeColor: string;
  strokeWeight: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 20 20"
      className={className}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M18 10a8 8 0 1 1-16 0a8 8 0 0 1 16 0m-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5m0 10a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
        clipRule="evenodd"
        strokeWidth={strokeWeight}
        stroke={strokeColor}
      ></path>
    </svg>
  );
}
