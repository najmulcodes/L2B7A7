import { cn } from "@/lib/utils";

// The hexagon mark with an interlocking "R"/arrow glyph, rendered as a
// gradient from brand blue into violet — the primary concept from the
// CodeRank logo exploration. Vector, not a traced raster: scales cleanly
// at any size, from an 18px nav mark to a 512px favicon source, and the
// gradient recolors correctly in both light and dark surfaces since it's
// defined once as an SVG <linearGradient>, not baked into a PNG.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="coderank-mark-gradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {/* Pointed hexagon outline */}
      <path
        d="M24 2 44 13.5v21L24 46 4 34.5v-21L24 2Z"
        fill="url(#coderank-mark-gradient)"
      />
      {/* Interlocking "R" / forward-chevron glyph, cut out of the hexagon in white */}
      <path
        d="M17 13h5.2c4 0 6.8 2 6.8 5.6 0 2.5-1.4 4.2-3.6 5l4.6 7.4h-5.2l-3.9-6.5h-1.4V31H17V13Zm5 3.4h-1.6v4.6H22c1.9 0 3-0.8 3-2.3 0-1.5-1.1-2.3-3-2.3Z"
        fill="white"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const markSize = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10" }[size];
  const textSize = { sm: "text-base", md: "text-lg", lg: "text-xl" }[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={cn(markSize, "shrink-0", markClassName)} />
      {showWordmark && (
        <span className={cn("font-semibold tracking-tight", textSize)}>
          <span className="text-gray-900 dark:text-white">Code</span>
          <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">Rank</span>
        </span>
      )}
    </span>
  );
}
