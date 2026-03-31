const SC = '#1e293b', SW = '3.5';

export default function PilotSvg({ isWalking, isAction1, isAction2, className = 'h-32' }) {
  return (
    <svg viewBox="-20 0 180 450" className={`${className} w-auto drop-shadow-2xl overflow-visible`}>
      <g transform="translate(20,10)">
        <g style={{ transformOrigin: '40px 250px', animation: isWalking ? 'swing-leg-2 0.8s infinite ease-in-out' : 'none' }}>
          <path d="M35,240 L20,380 L15,390 L40,390 L45,240 Z" fill="#262f44" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <path d="M15,390 L10,420 L40,420 L40,390 Z" fill="#202530" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <path d="M10,420 L0,420 L0,430 L40,430 L40,420 Z" fill="#202530" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
        </g>
        <g style={{ transformOrigin: '40px 250px', animation: isWalking ? 'swing-leg-1 0.8s infinite ease-in-out' : 'none' }}>
          <path d="M45,240 L45,380 L40,390 L65,390 L60,240 Z" fill="#35405a" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <path d="M40,390 L40,420 L65,420 L65,390 Z" fill="#2e3642" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <path d="M40,420 L30,420 L30,430 L65,430 L65,420 Z" fill="#2e3642" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
        </g>
        <g style={{ animation: isWalking ? 'body-bob 0.8s infinite linear' : 'none' }}>
          <path d="M60,130 L75,170 L65,190" fill="none" stroke="#c0c5c7" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M60,130 L75,170 L65,190" fill="none" stroke={SC} strokeWidth="23" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'destination-over' }}/>
          <rect x="35" y="95" width="15" height="20" fill="#f3ac87" stroke={SC} strokeWidth={SW}/>
          <circle cx="42" cy="70" r="22" fill="#f3ac87" stroke={SC} strokeWidth={SW}/>
          <path d="M20,70 C20,40 64,40 64,70 C64,60 55,48 42,48 C29,48 20,60 20,70 Z" fill="#6289b8" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <circle cx="25" cy="75" r="5" fill="#f3ac87" stroke={SC} strokeWidth={SW}/>
          <path d="M20,110 L15,165 L70,165 L65,110 Z" fill="#d5d7d8" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <path d="M25,115 L20,250 L65,250 L60,115 L42,130 Z" fill="#555e63" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <line x1="42" y1="130" x2="42" y2="250" stroke={SC} strokeWidth={SW}/>
          <rect x="23" y="160" width="16" height="20" rx="2" fill="#464e52" stroke={SC} strokeWidth={SW}/>
          <rect x="46" y="160" width="16" height="20" rx="2" fill="#464e52" stroke={SC} strokeWidth={SW}/>
          <rect x="23" y="195" width="16" height="25" rx="2" fill="#464e52" stroke={SC} strokeWidth={SW}/>
          <rect x="46" y="195" width="16" height="25" rx="2" fill="#464e52" stroke={SC} strokeWidth={SW}/>
          <path d="M25,130 L15,170 L40,195" fill="none" stroke="#d5d7d8" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M25,130 L15,170 L40,195" fill="none" stroke={SC} strokeWidth="21" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'destination-over' }}/>
          <circle cx="43" cy="195" r="6" fill="#f3ac87" stroke={SC} strokeWidth={SW}/>
          <g transform="translate(45,185) rotate(-10)">
            <line x1="-15" y1="0" x2="-20" y2="-15" stroke={SC} strokeWidth={SW} strokeLinecap="round"/>
            <line x1="15" y1="0" x2="20" y2="-15" stroke={SC} strokeWidth={SW} strokeLinecap="round"/>
            <rect x="-25" y="-5" width="50" height="25" rx="4" fill="#88929b" stroke={SC} strokeWidth={SW}/>
            <rect x="-15" y="-2" width="30" height="12" rx="1" fill="#cbd5e1" stroke={SC} strokeWidth="2"/>
            <circle cx="-15" cy="15" r="4" fill="#333" stroke={SC} strokeWidth="1"/>
            <circle cx="15" cy="15" r="4" fill="#333" stroke={SC} strokeWidth="1"/>
          </g>
        </g>
        <g transform="translate(100,40)" style={{ animation: isAction1 ? 'drone-roll 2s ease-in-out' : isAction2 ? 'drone-scan 3s ease-in-out' : 'drone-hover 4s infinite ease-in-out' }}>
          <ellipse cx="-35" cy="-8" rx="15" ry="3" fill="#cbd5e1" stroke={SC} strokeWidth="1.5"/>
          <ellipse cx="35" cy="-8" rx="15" ry="3" fill="#cbd5e1" stroke={SC} strokeWidth="1.5"/>
          <path d="M-25,0 L-35,-5 M25,0 L35,-5 M-15,10 L-25,25 M15,10 L25,25" stroke={SC} strokeWidth="3" strokeLinecap="round"/>
          <ellipse cx="0" cy="0" rx="25" ry="8" fill="#88929b" stroke={SC} strokeWidth={SW}/>
          <ellipse cx="0" cy="0" rx="12" ry="5" fill="#a3afb8" stroke={SC} strokeWidth="2"/>
          <rect x="-6" y="8" width="12" height="8" rx="2" fill="#333" stroke={SC} strokeWidth="2"/>
          <circle cx="0" cy="12" r="2" fill="#fff"/>
          <circle cx="-25" cy="2" r="2.5" fill="#ef4444"/>
          <circle cx="25" cy="2" r="2.5" fill="#22c55e"/>
        </g>
      </g>
    </svg>
  );
}
