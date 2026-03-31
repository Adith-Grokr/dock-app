const SC = '#1e293b', SW = '3.5';

export default function CyclistSvg({ isWalking, isAction1, isAction2, className = 'h-32' }) {
  const sp = isAction2;
  const wa = (isWalking || isAction1) ? 'wheel-spin 1s infinite linear' : sp ? 'wheel-spin 0.3s infinite linear' : 'none';
  const l1 = (isWalking || isAction1) ? 'swing-leg-1 0.8s infinite linear' : sp ? 'swing-leg-1 0.25s infinite linear' : 'none';
  const l2 = (isWalking || isAction1) ? 'swing-leg-2 0.8s infinite linear' : sp ? 'swing-leg-2 0.25s infinite linear' : 'none';
  const bb = (isWalking || isAction1) ? 'ride-bob 0.5s infinite alternate ease-in-out' : sp ? 'sprint-bob 0.15s infinite alternate ease-in-out' : 'none';

  return (
    <svg viewBox="-40 0 320 450" className={`${className} w-auto drop-shadow-2xl overflow-visible`}>
      <g transform="translate(50,200)" style={{ transformOrigin: '0px 100px', animation: isAction1 ? 'wheelie 2s ease-in-out' : 'none' }}>
        {[0, 170].map(cx => (
          <g key={cx} style={{ transformOrigin: `${cx}px 100px`, animation: wa }}>
            <circle cx={cx} cy="100" r="45" fill="none" stroke={SC} strokeWidth="6"/>
            <circle cx={cx} cy="100" r="40" fill="none" stroke="#cbd5e1" strokeWidth="2"/>
            <line x1={cx} y1="55" x2={cx} y2="145" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1={cx - 45} y1="100" x2={cx + 45} y2="100" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1={cx - 32} y1="68" x2={cx + 32} y2="132" stroke="#94a3b8" strokeWidth="1.5"/>
            <line x1={cx + 32} y1="68" x2={cx - 32} y2="132" stroke="#94a3b8" strokeWidth="1.5"/>
            <circle cx={cx} cy="100" r="6" fill={SC}/>
          </g>
        ))}
        <path d="M0,100 L70,15 L145,15 L170,100 M70,15 L95,100 L0,100" fill="none" stroke="#f1f5f9" strokeWidth="7" strokeLinejoin="round"/>
        <path d="M0,100 L70,15 L145,15 L170,100 M70,15 L95,100 L0,100" fill="none" stroke={SC} strokeWidth="11" strokeLinejoin="round" style={{ mixBlendMode: 'destination-over' }}/>
        <path d="M145,15 L150,-15 C150,-25 130,-25 130,-15 L135,10" fill="none" stroke={SC} strokeWidth="7" strokeLinecap="round"/>
        <line x1="70" y1="15" x2="65" y2="-10" stroke={SC} strokeWidth="6"/>
        <path d="M50,-10 L85,-10 L80,-18 L55,-18 Z" fill={SC} strokeLinejoin="round"/>
        <g style={{ animation: bb }}>
          <g style={{ transformOrigin: '80px 10px', animation: l2 }}>
            <path d="M75,10 L95,60 L110,55 L85,5 Z" fill="#1b3d28" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
            <path d="M95,60 L95,105 L110,105 L110,55 Z" fill="#754b2f" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
            <rect x="95" y="85" width="15" height="15" fill="#f8fafc" stroke={SC} strokeWidth={SW}/>
            <path d="M90,100 L115,100 L120,110 L90,110 Z" fill="#2c364f" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          </g>
          <path d="M70,-50 L95,-10 L125,-15" fill="none" stroke="#8d5a3a" strokeWidth="14" strokeLinecap="round"/>
          <path d="M70,-50 L95,-10 L125,-15" fill="none" stroke={SC} strokeWidth="19" strokeLinecap="round" style={{ mixBlendMode: 'destination-over' }}/>
          <path d="M65,-10 L50,-80 L105,-70 L85,-10 Z" fill="#f2ead1" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <path d="M55,-65 L102,-55 M58,-50 L98,-40 M60,-35 L93,-25" stroke="#2c364f" strokeWidth="5" strokeLinecap="round"/>
          <g transform="translate(90,-95)">
            <rect x="0" y="20" width="15" height="15" fill="#8d5a3a" stroke={SC} strokeWidth={SW}/>
            <circle cx="10" cy="5" r="20" fill="#8d5a3a" stroke={SC} strokeWidth={SW}/>
            <path d="M-5,10 C-5,25 5,35 15,35 C25,35 30,25 32,10 L-5,10 Z" fill="#c8cdce" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
            <circle cx="15" cy="0" r="6" fill="none" stroke={SC} strokeWidth="2.5"/>
            <line x1="21" y1="0" x2="30" y2="0" stroke={SC} strokeWidth="2.5"/>
            <path d="M-15,-5 C-15,-25 5,-35 20,-35 C35,-35 45,-25 45,-5 C45,0 35,5 25,5 L-5,5 C-15,5 -15,-5 -15,-5 Z" fill="#2c364f" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
            <path d="M-10,-5 C-10,-15 5,-20 20,-20 C35,-20 40,-15 40,-5" stroke="#475569" strokeWidth="3" fill="none"/>
          </g>
          <g style={{ transformOrigin: '80px 10px', animation: l1 }}>
            <path d="M75,10 L105,45 L120,35 L85,5 Z" fill="#285a3b" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
            <path d="M105,45 L105,95 L120,95 L120,35 Z" fill="#8d5a3a" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
            <rect x="105" y="75" width="15" height="15" fill="#f8fafc" stroke={SC} strokeWidth={SW}/>
            <path d="M100,90 L125,90 L130,100 L100,100 Z" fill="#2c364f" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          </g>
          <path d="M90,-65 L135,-15" fill="none" stroke="#8d5a3a" strokeWidth="14" strokeLinecap="round"/>
          <path d="M90,-65 L135,-15" fill="none" stroke={SC} strokeWidth="19" strokeLinecap="round" style={{ mixBlendMode: 'destination-over' }}/>
          <path d="M90,-65 L105,-45" fill="none" stroke="#f2ead1" strokeWidth="16" strokeLinecap="round"/>
          <path d="M90,-65 L105,-45" fill="none" stroke={SC} strokeWidth="21" strokeLinecap="round" style={{ mixBlendMode: 'destination-over' }}/>
        </g>
        <circle cx="95" cy="100" r="18" fill="#e2e8f0" stroke={SC} strokeWidth={SW}/>
        <circle cx="95" cy="100" r="6" fill={SC}/>
        <circle cx="95" cy="100" r="2" fill="#fff"/>
      </g>
    </svg>
  );
}
