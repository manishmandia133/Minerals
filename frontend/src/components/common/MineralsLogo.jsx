// Shared site-wide logo — the footer mark, used everywhere
// (header nav, footer, favicon, chat curtain).
import React from 'react';

export default function MineralsLogo({ className, style, width = 64, height = 38, ...rest }) {
  return (
    <svg
      className={className}
      style={style}
      width={width}
      height={height}
      viewBox="0 0 64 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <path d="M0 20.1032L39.8387 20.1032C44.7808 20.1032 48.7871 24.1095 48.7871 29.0516C48.7871 33.9937 44.7808 38 39.8387 38L1.56459e-06 38L0 20.1032Z" fill="currentColor" />
      <path d="M63.4968 17.8968L23.6581 17.8968C18.716 17.8968 14.7097 13.8904 14.7097 8.94839C14.7097 4.00633 18.716 0 23.6581 0L63.4968 0V17.8968Z" fill="currentColor" />
    </svg>
  );
}
