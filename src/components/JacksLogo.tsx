import React from 'react';

interface JacksLogoProps {
  className?: string;
  size?: number; // width and height in px
  logoType?: 'svg' | 'image';
  imageUrl?: string;
  svgTextTop?: string;
  svgTextBottom?: string;
  svgColor?: string;
}

export default function JacksLogo({ 
  className = '', 
  size = 120,
  logoType = 'svg',
  imageUrl = '',
  svgTextTop = "Jack's",
  svgTextBottom = "Mowing & More",
  svgColor = '#dc2626'
}: JacksLogoProps) {
  if (logoType === 'image' && imageUrl) {
    return (
      <div 
        className={`relative flex items-center justify-center shrink-0 select-none overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <img 
          src={imageUrl} 
          alt="Brand Logo" 
          className="w-full h-full object-contain" 
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer White Emblem Circle */}
        <circle cx="100" cy="100" r="96" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        
        {/* Subtle background shadow lines for round depth */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="#f1f5f9" strokeWidth="1" />

        {/* Text Paths */}
        {/* Top Arc for "Jack's" */}
        <path 
          id="jacks-top-path" 
          d="M 30,95 A 70,70 0 0,1 170,95" 
          fill="none" 
          stroke="none"
        />
        
        {/* Bottom Arc for "Mowing & More" (oriented so text reads correctly left-to-right) */}
        <path 
          id="jacks-bottom-path" 
          d="M 30,105 A 70,70 0 0,0 170,105" 
          fill="none" 
          stroke="none"
        />

        {/* Text Elements using the serif style like the logo */}
        <text className="font-serif select-none" fill="#000000">
          <textPath 
            href="#jacks-top-path" 
            startOffset="50%" 
            textAnchor="middle" 
            className="text-[26px] font-black tracking-tight"
          >
            {svgTextTop}
          </textPath>
        </text>

        <text className="font-serif select-none" fill="#000000">
          <textPath 
            href="#jacks-bottom-path" 
            startOffset="50%" 
            textAnchor="middle" 
            className="text-[17px] font-bold tracking-normal"
          >
            {svgTextBottom}
          </textPath>
        </text>

        {/* Detailed Red Lawnmower Vector illustration inside the circle */}
        <g id="lawnmower-sketch" transform="translate(5, 5)">
          {/* Wheel Axle connectors */}
          <line x1="85" y1="120" x2="135" y2="125" stroke="#475569" strokeWidth="3" />
          
          {/* Lawnmower long handlebars going up and left */}
          {/* Main Frame Bars */}
          <line x1="88" y1="110" x2="60" y2="64" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <line x1="82" y1="112" x2="55" y2="67" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          
          {/* Crossbars on handle */}
          <line x1="77" y1="92" x2="69" y2="90" stroke="#1e293b" strokeWidth="2" />
          <line x1="68" y1="78" x2="61" y2="76" stroke="#1e293b" strokeWidth="2" />
          
          {/* Handle Grip loop */}
          <path d="M 55 67 C 50 60, 52 56, 58 60 L 62 64" fill="none" stroke="#000000" strokeWidth="3.5" strokeLinecap="round" />

          {/* Throttle Pull Cable wire */}
          <path d="M 85 105 Q 72 90, 58 65" fill="none" stroke="#475569" strokeWidth="1" />

          {/* Grass collection bag or rear deck extension (black) */}
          <path d="M 72 104 L 86 102 L 80 114 L 68 112 Z" fill="#1e293b" stroke="#000" strokeWidth="1" />

          {/* Lawnmower main cutting deck (customizable color) */}
          {/* Shiny highlights on mower deck */}
          <path d="M 76 107 L 138 112 L 135 122 L 74 117 Z" fill={svgColor} stroke="#7f1d1d" strokeWidth="2.5" />
          <path d="M 79 109 L 134 113 L 132 117 L 77 114 Z" fill={svgColor} className="opacity-90" />
          
          {/* Chrome side trim/exhaust pipe */}
          <path d="M 92 110 L 124 112" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />

          {/* Engine block (Black/silver box in center) */}
          <rect x="94" y="90" width="28" height="21" rx="4" fill="#0f172a" stroke="#000" strokeWidth="2" />
          
          {/* Engine top starter recoil cover */}
          <path d="M 98 90 L 100 84 L 116 84 L 118 90 Z" fill="#334155" stroke="#000" strokeWidth="1.5" />
          
          {/* Starter handle pull cord detail */}
          <path d="M 114 84 L 122 79" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="120" y1="77" x2="124" y2="81" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

          {/* Fuel Cap (White/silver round cap) */}
          <circle cx="103" cy="87" r="3" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />

          {/* Front Wheel (Smaller) */}
          <circle cx="135" cy="125" r="11" fill="#1e293b" stroke="#000" strokeWidth="2" />
          <circle cx="135" cy="125" r="7" fill="#475569" />
          <circle cx="135" cy="125" r="3" fill="#ffffff" />

          {/* Rear Wheel (Larger) */}
          <circle cx="85" cy="120" r="14" fill="#1e293b" stroke="#000" strokeWidth="2" />
          <circle cx="85" cy="120" r="9" fill="#475569" />
          <circle cx="85" cy="120" r="4" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
