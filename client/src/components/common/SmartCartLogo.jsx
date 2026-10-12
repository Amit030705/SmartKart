import React from 'react';

export default function SmartCartLogo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7 shrink-0 text-[#315740]" fill="none">
        <path d="M4 6.5h3l3.1 14h13.7l3-10.1H8.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 24.5h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12.5" cy="27" r="1.5" fill="currentColor" />
        <circle cx="22" cy="27" r="1.5" fill="currentColor" />
      </svg>
      <span className="block leading-tight">
        <span className="block text-[18px] font-semibold tracking-tight text-[#26342b]">SmartCart</span>
        <span className="mt-0.5 block text-[10px] font-normal tracking-wide text-[#858b84]">Electronics</span>
      </span>
    </span>
  );
}
