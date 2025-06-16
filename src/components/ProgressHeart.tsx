export default function HeartProgress({
  progress = 0,
  width = 100,
  height = 100,
  bgColor = "#e74c3c",
  fillColor = "#333",
}) {
  // Clamp between 0 and 100
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <svg
      width={width}
      height={height}
      style={{
        display: "block",
        filter: "drop-shadow(0px 0px 0px #000)",
      }}
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth={1}
      stroke="white"
    >
      {/* Define the heart path once */}
      <defs>
        <path
          id="heart-shape"
          d="M24.387 4.607C27.208 1.93 30.882.546 34.632.743c3.75.198 7.282 1.963 9.849 4.923 2.566 2.96 3.966 6.881 3.903 10.935-.063 4.055-1.584 7.923-4.241 10.788l-12.13 13.1-7.63 8.236-16.9-18.25-2.856-3.088C1.97 24.52.45 20.652.388 16.599.326 12.545 1.726 8.623 4.292 5.664 6.86 2.705 10.39.94 14.14.744c3.75-.198 7.426 1.187 10.247 3.863Z"
        />
        {/* Define a clip-path that we'll resize */}
        <clipPath id="clip-heart">
          <rect x="0" y="0" height={`${pct}%`} width="100%" />
        </clipPath>
      </defs>

      {/* Empty heart (background) */}
      <use href="#heart-shape" fill={bgColor} />

      {/* Filled heart, clipped to 'progress' */}
      <use
        href="#heart-shape"
        fill={fillColor}
        clipPath="url(#clip-heart)"
        style={{ transition: "clip-path 0.5s ease" }}
      />
    </svg>
  );
}
