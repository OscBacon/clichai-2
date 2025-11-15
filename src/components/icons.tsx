import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 20V14c0-2.2 1.8-4 4-4s4 1.8 4 4v6" />
      <path d="M7 20h10" />
      <path d="M12 4v2" />
      <path d="M4 12H2" />
      <path d="M20 12h2" />
      <path d="m19.07 19.07-.42-.42" />
      <path d="m5.35 5.35-.42-.42" />
      <path d="m19.07 5.35-.42.42" />
      <path d="m5.35 19.07-.42.42" />
    </svg>
  );
}
