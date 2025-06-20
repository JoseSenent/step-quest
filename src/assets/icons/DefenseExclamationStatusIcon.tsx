export default function DefenseExclamationStatusIcon({
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
        d="M10.339 2.237a.53.53 0 0 0-.678 0a11.95 11.95 0 0 1-7.078 2.75a.5.5 0 0 0-.479.425A12 12 0 0 0 2 7c0 5.163 3.26 9.564 7.834 11.257a.48.48 0 0 0 .332 0C14.74 16.564 18 12.163 18 7q0-.808-.104-1.589a.5.5 0 0 0-.48-.425a11.95 11.95 0 0 1-7.077-2.75M10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6m0 9a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
        clipRule="evenodd"
        strokeWidth={strokeWeight}
        stroke={strokeColor}
      ></path>
    </svg>
  );
}
