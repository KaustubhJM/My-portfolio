// Shared SVG: ink-edge filters + the forehead-marking logo, referenced with <use>.
export function SvgDefs() {
  return (
    <>
      <svg className="defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id="ink-rough" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="ink-rough-lg" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="38" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <symbol id="arrow" viewBox="0 0 16 16">
            <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
          </symbol>
          <symbol id="mark" viewBox="0 0 32 40">
            <path fillRule="evenodd" d="M16 1C23 11 24 25 16 39 8 25 9 11 16 1Zm0 8c4 7 4.5 16 0 23-4.5-7-4-16 0-23Z" />
            <ellipse cx="16" cy="21" rx="2.4" ry="3.6" />
            <path d="M7 12c-3.5 8-2.5 17 3 25-1.4-8-1.6-16-3-25Zm18 0c3.5 8 2.5 17-3 25 1.4-8 1.6-16 3-25Z" />
          </symbol>
        </defs>
      </svg>
      {/* Throwaway ink-bleed filters are added here at runtime, outside React's tree */}
      <svg className="defs" aria-hidden="true" focusable="false"><defs id="ink-live" /></svg>
    </>
  );
}

export function Mark({ className }) {
  return <svg className={className} aria-hidden="true"><use href="#mark" /></svg>;
}

// One arrow symbol, rotated per direction by CSS
export function Arrow({ dir, className = '' }) {
  const cls = ['i', dir && `i--${dir}`, className].filter(Boolean).join(' ');
  return <svg className={cls} aria-hidden="true"><use href="#arrow" /></svg>;
}
