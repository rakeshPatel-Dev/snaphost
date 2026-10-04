import React from 'react'

interface SnaphostLogoProps {
  /** Rendered width of the logo (px or any CSS width value). */
  width?: number | string
  /** Rendered height of the logo (px or any CSS height value). */
  height?: number | string
  /** Fill color for the mark. Defaults to black, matching the source file. */
  color?: string
  /** Optional extra class names for the wrapping <svg>. */
  className?: string
}

const LOGO_PATH = `M 162.5 4 Q 221.4 6.6 247 42.5 Q 259.2 57.3 266.5 77 Q 293.1 81.4 307
98.5 Q 323.9 113.6 325 144.5 L 320 168.5 Q 312.1 185.1 298.5 196 Q 282.7 210.7 251.5 210
L 230 204 L 229 197.5 L 232 183 L 229 184.5 L 222.5 193 Q 201.6 212.1 159.5 210 Q 125.9
206.6 108 187.5 L 104.5 183 L 104 187.5 L 108 202.5 L 105.5 206 Q 92.8 211.3 73.5 210 Q
38.7 204.3 21 181.5 Q 3.5 163 4 126.5 Q 8.9 91.4 31.5 74 L 52.5 61 L 75.5 56 L 78 53.5 Q
85.8 38.3 98.5 28 Q 121.6 7.1 162.5 4 Z`

/**
 * "Snaphost" logo — vector trace of the mark from the new brand icon.
 * The silhouette was traced from the 512px brand mark and verified against the
 * source raster (IoU 0.99 at full size, 1.00 at the 20px header render size).
 * The mark is wider than it is tall (~1.55:1), so prefer sizing by height.
 */
const SnaphostLogo: React.FC<SnaphostLogoProps> = ({
  width = 329,
  height = 214,
  color = 'currentColor',
  className,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 329 214"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label="Snaphost logo"
    >
      <path d={LOGO_PATH} fill={color} />
    </svg>
  )
}

export default SnaphostLogo
