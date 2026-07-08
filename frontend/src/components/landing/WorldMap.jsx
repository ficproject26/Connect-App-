import React from 'react';

export default function WorldMap() {
  return (
    <div className="absolute inset-0 w-full h-full opacity-[0.25] pointer-events-none z-0 select-none overflow-hidden">
      <svg
        className="w-full h-full min-w-[1200px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        viewBox="0 0 1000 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stylized Continental Outlines (Faint Slate fills) */}
        {/* North America */}
        <path
          d="M 120 80 Q 150 50 200 60 T 300 70 T 320 120 T 360 140 T 340 180 T 260 210 T 240 170 T 170 180 T 110 130 Z"
          fill="rgba(148, 163, 184, 0.15)"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
        />
        {/* South America */}
        <path
          d="M 260 210 Q 320 220 330 260 T 380 320 T 340 450 T 290 470 T 260 380 T 240 280 Z"
          fill="rgba(148, 163, 184, 0.15)"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
        />
        {/* Europe / Asia */}
        <path
          d="M 430 80 Q 480 60 550 50 T 680 40 T 780 60 T 880 70 T 890 140 T 840 220 T 720 280 T 650 250 T 580 260 T 450 180 T 420 120 Z"
          fill="rgba(148, 163, 184, 0.15)"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
        />
        {/* Africa */}
        <path
          d="M 440 190 Q 510 190 560 220 T 590 280 T 570 360 T 530 420 T 480 400 T 440 280 T 420 210 Z"
          fill="rgba(148, 163, 184, 0.15)"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
        />
        {/* Australia */}
        <path
          d="M 800 340 Q 860 330 890 350 T 910 410 T 840 430 T 780 380 Z"
          fill="rgba(148, 163, 184, 0.15)"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
        />

        {/* Global Connection Arcs (Bezier curves) */}
        {/* New York to London */}
        <path
          className="animate-pulse-connection"
          d="M 230 140 Q 355 60 480 110"
          stroke="url(#worldLineGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="8 8"
        />
        {/* London to Mumbai */}
        <path
          className="animate-pulse-connection"
          style={{ animationDelay: '1s' }}
          d="M 480 110 Q 580 160 670 240"
          stroke="url(#worldLineGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="8 8"
        />
        {/* Mumbai to Tokyo */}
        <path
          className="animate-pulse-connection"
          style={{ animationDelay: '2s' }}
          d="M 670 240 Q 765 170 850 140"
          stroke="url(#worldLineGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="8 8"
        />
        {/* Tokyo to Sydney */}
        <path
          className="animate-pulse-connection"
          style={{ animationDelay: '3s' }}
          d="M 850 140 Q 900 260 860 380"
          stroke="url(#worldLineGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="8 8"
        />
        {/* Sydney to New York */}
        <path
          className="animate-pulse-connection"
          style={{ animationDelay: '4s' }}
          d="M 860 380 Q 545 420 230 140"
          stroke="url(#worldLineGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="8 8"
        />

        {/* City Hub Indicator Nodes (Glowing Circles) */}
        {/* New York */}
        <g>
          <circle cx="230" cy="140" r="5" fill="#D4AF37" className="animate-ping" style={{ transformOrigin: '230px 140px', animationDuration: '3s' }} />
          <circle cx="230" cy="140" r="3" fill="#AA7C11" />
        </g>
        {/* London */}
        <g>
          <circle cx="480" cy="110" r="5" fill="#D4AF37" className="animate-ping" style={{ transformOrigin: '480px 110px', animationDuration: '3s' }} />
          <circle cx="480" cy="110" r="3" fill="#AA7C11" />
        </g>
        {/* Mumbai */}
        <g>
          <circle cx="670" cy="240" r="5" fill="#D4AF37" className="animate-ping" style={{ transformOrigin: '670px 240px', animationDuration: '3s' }} />
          <circle cx="670" cy="240" r="3" fill="#AA7C11" />
        </g>
        {/* Tokyo */}
        <g>
          <circle cx="850" cy="140" r="5" fill="#D4AF37" className="animate-ping" style={{ transformOrigin: '850px 140px', animationDuration: '3s' }} />
          <circle cx="850" cy="140" r="3" fill="#AA7C11" />
        </g>
        {/* Sydney */}
        <g>
          <circle cx="860" cy="380" r="5" fill="#D4AF37" className="animate-ping" style={{ transformOrigin: '860px 380px', animationDuration: '3s' }} />
          <circle cx="860" cy="380" r="3" fill="#AA7C11" />
        </g>

        <defs>
          <linearGradient id="worldLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#AA7C11" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F3E5AB" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
