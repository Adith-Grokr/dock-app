const SC = '#1e293b', SW = '3.5';

export default function ArchitectSvg({ isWalking, isAction1, isAction2, className = 'h-32' }) {
  return (
    <svg viewBox="0 0 150 450" className={`${className} w-auto drop-shadow-2xl overflow-visible`}>
      <g transform="translate(30,10)">
        <g style={{ transformOrigin: '50px 250px', animation: isWalking ? 'swing-leg-2 0.8s infinite ease-in-out' : 'none' }}>
          <path d="M40,240 L30,370 L25,380 L50,380 L50,240 Z" fill="#6a784c" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <path d="M25,380 L25,415 L50,415 L50,380 Z" fill="#845136" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <path d="M25,415 L15,415 L15,425 L50,425 L50,415 Z" fill="#845136" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
        </g>
        <g style={{ transformOrigin: '50px 250px', animation: isWalking ? 'swing-leg-1 0.8s infinite ease-in-out' : 'none' }}>
          <path d="M50,240 L45,370 L40,380 L65,380 L65,240 Z" fill="#7d8c58" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <rect x="35" y="365" width="35" height="15" rx="3" fill="#93a36c" stroke={SC} strokeWidth={SW}/>
          <path d="M40,380 L40,415 L65,415 L65,380 Z" fill="#955b3e" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <path d="M40,415 L30,415 L30,425 L65,425 L65,415 Z" fill="#955b3e" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
        </g>
        <g style={{ animation: isWalking ? 'body-bob 0.8s infinite linear' : 'none' }}>
          <path d="M60,130 L95,170 L115,145" fill="none" stroke="#6a784c" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M60,130 L95,170 L115,145" fill="none" stroke={SC} strokeWidth="23" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'destination-over' }}/>
          <circle cx="115" cy="145" r="8" fill="#f3ac87" stroke={SC} strokeWidth={SW}/>
          <path d="M35,115 L25,165 L35,260 L65,260 L75,165 L65,115 Z" fill="#7d8c58" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <path d="M40,115 L50,140 L60,115" fill="none" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
          <line x1="50" y1="140" x2="50" y2="260" stroke={SC} strokeWidth={SW}/>
          <rect x="32" y="225" width="36" height="10" fill="#7d8c58" stroke={SC} strokeWidth={SW} rx="2"/>
          <rect x="42" y="95" width="16" height="25" fill="#f3ac87" stroke={SC} strokeWidth={SW}/>
          <circle cx="50" cy="75" r="22" fill="#f3ac87" stroke={SC} strokeWidth={SW}/>
          <circle cx="45" cy="70" r="7" fill="none" stroke={SC} strokeWidth="2.5"/>
          <circle cx="65" cy="70" r="7" fill="none" stroke={SC} strokeWidth="2.5"/>
          <line x1="52" y1="70" x2="58" y2="70" stroke={SC} strokeWidth="2.5"/>
          <line x1="72" y1="70" x2="80" y2="65" stroke={SC} strokeWidth="2.5"/>
          <g fill="#efc849" stroke={SC} strokeWidth={SW}>
            <circle cx="35" cy="50" r="14"/><circle cx="55" cy="42" r="16"/>
            <circle cx="70" cy="55" r="13"/><circle cx="30" cy="70" r="12"/>
            <circle cx="72" cy="75" r="11"/><circle cx="48" cy="35" r="12"/>
          </g>
          <g style={{ transformOrigin: '45px 130px', animation: isAction1 ? 'architect-inspect 2s ease-in-out' : isAction2 ? 'architect-measure 3s ease-in-out' : 'none' }}>
            <g transform="translate(-15,155) rotate(-20)">
              <rect x="0" y="0" width="85" height="18" fill="#ffffff" stroke={SC} strokeWidth={SW} rx="2"/>
              <path d="M75,0 L85,9 L75,18 Z" fill="#cbd5e1" stroke={SC} strokeWidth={SW} strokeLinejoin="round"/>
              <line x1="15" y1="0" x2="15" y2="18" stroke={SC} strokeWidth="2"/>
              <line x1="65" y1="0" x2="65" y2="18" stroke={SC} strokeWidth="2"/>
            </g>
            <path d="M45,130 L20,175 L40,195" fill="none" stroke="#7d8c58" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M45,130 L20,175 L40,195" fill="none" stroke={SC} strokeWidth="23" strokeLinecap="round" strokeLinejoin="round" style={{ mixBlendMode: 'destination-over' }}/>
            <path d="M30,185 L45,200" stroke={SC} strokeWidth="4"/>
            <circle cx="45" cy="200" r="7" fill="#f3ac87" stroke={SC} strokeWidth={SW}/>
          </g>
        </g>
      </g>
    </svg>
  );
}
