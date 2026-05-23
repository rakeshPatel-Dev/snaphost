import type { SVGProps } from 'react';

export default function AnonUpload(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="11" className="fill-muted stroke-border" strokeWidth="1" />

      {/* Cloud-incognito body */}
      <path
        d="M4 13.5
           Q4 10 6.5 10
           Q7 5 12 5
           Q17 5 17.5 10
           Q20 10 20 13.5
           Q20 18.5 16.5 18.5
           Q14.5 18.5 12 17
           Q9.5 18.5 7.5 18.5
           Q4 18.5 4 13.5 Z"
        className="fill-foreground"
      />

      {/* Forehead ridge */}
      <path
        d="M7 10.5 Q12 7.5 17 10.5"
        className="stroke-muted fill-muted"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left eye hole */}
      <circle cx="9" cy="14" r="2.5" className="fill-muted" />

      {/* Right eye hole */}
      <circle cx="15" cy="14" r="2.5" className="fill-muted" />
    </svg>
  );
}