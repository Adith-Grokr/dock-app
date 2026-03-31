/**
 * constants.js
 * Shared static config: agent names pool, per-type default skills,
 * status display config, persona descriptions, and CSS keyframe
 * animations injected via a <style> tag at runtime.
 */
export const NAMES = ['Nova','Atlas','Echo','Flux','Iris','Lux','Orion','Pixel','Rex','Sage','Titan','Volt','Wren','Zara','Apex','Blaze','Crest','Dawn'];

export const DEFAULT_SKILLS = {
  architect: ['System Design','Planning','Code Review','Documentation','API Design','Analysis'],
  pilot:     ['Deployment','Monitoring','Testing','CI/CD','Infrastructure','Coordination'],
  cyclist:   ['Performance','Data Pipeline','Optimization','Routing','Load Testing','Benchmarking'],
};

export const STATUS = {
  idle:     { color: '#94a3b8', bg: 'bg-slate-100', text: 'text-slate-500', label: 'Idle'     },
  working:  { color: '#22c55e', bg: 'bg-green-50',  text: 'text-green-700', label: 'Working'  },
  thinking: { color: '#f59e0b', bg: 'bg-amber-50',  text: 'text-amber-700', label: 'Thinking' },
  done:     { color: '#3b82f6', bg: 'bg-blue-50',   text: 'text-blue-700',  label: 'Done'     },
  failed:   { color: '#ef4444', bg: 'bg-red-50',    text: 'text-red-700',   label: 'Failed'   },
};

export const PERSONA = {
  architect: { desc: 'an architect carrying blueprints', tone: 'Meticulous, professional, loves design and structure puns.' },
  pilot:     { desc: 'a drone pilot',                    tone: 'Energetic, tech-obsessed, uses aviation slang like "roger that".' },
  cyclist:   { desc: 'a cyclist',                        tone: 'Outdoorsy, enthusiastic, loves fitness metaphors.' },
};

export const ANIMATION_STYLES = `
  @keyframes swing-leg-1 { 0%,100%{transform:rotate(-25deg)} 50%{transform:rotate(25deg)} }
  @keyframes swing-leg-2 { 0%,100%{transform:rotate(25deg)}  50%{transform:rotate(-25deg)} }
  @keyframes body-bob {
    0%,50%,100%{transform:translateY(0);animation-timing-function:cubic-bezier(.33,1,.68,1)}
    25%,75%{transform:translateY(-6px);animation-timing-function:cubic-bezier(.32,0,.67,0)}
  }
  @keyframes wheel-spin   { 100%{transform:rotate(360deg)} }
  @keyframes ride-bob     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
  @keyframes sprint-bob   { 0%,100%{transform:translateY(0) rotate(5deg)} 50%{transform:translateY(-4px) rotate(8deg)} }
  @keyframes drone-hover  { 0%,100%{transform:translateY(0) rotate(-2deg)} 33%{transform:translateY(-8px) translateX(4px) rotate(1deg)} 66%{transform:translateY(-4px) translateX(-4px) rotate(-1deg)} }
  @keyframes drone-roll   { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-60px) rotate(-180deg) scale(1.3)} 80%{transform:translateY(-10px) rotate(-345deg) scale(1.1)} }
  @keyframes drone-scan   { 0%,100%{transform:translateY(0) translateX(0) rotate(-2deg)} 20%{transform:translateY(-15px) translateX(-40px) rotate(-15deg)} 50%{transform:translateY(-10px) translateX(40px) rotate(15deg)} }
  @keyframes architect-inspect { 0%,100%{transform:rotate(0deg)} 30%,70%{transform:rotate(-30deg) translateY(-4px)} }
  @keyframes architect-measure { 0%,100%{transform:rotate(0deg)} 20%,80%{transform:rotate(-75deg) translateX(-15px) translateY(5px)} }
  @keyframes wheelie { 0%,100%{transform:rotate(0deg) translateY(0)} 15%{transform:rotate(-28deg) translateY(-12px)} 85%{transform:rotate(-25deg) translateY(-10px)} }
  @keyframes typing-dot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
  @keyframes spawn-bounce {
    0%  {transform:translateX(-50%) translateY(-100vh) scale(.8,1.2);opacity:1;animation-timing-function:ease-in}
    50% {transform:translateX(-50%) translateY(20px) scale(1.2,.8);animation-timing-function:ease-out}
    70% {transform:translateX(-50%) translateY(-30px) scale(.95,1.05);animation-timing-function:ease-in}
    85% {transform:translateX(-50%) translateY(5px) scale(1.05,.95);animation-timing-function:ease-out}
    100%{transform:translateX(-50%) translateY(0) scale(1,1);opacity:1}
  }
  @keyframes pop-out { 0%{transform:translateX(-50%) scale(1);opacity:1} 100%{transform:translateX(-50%) scale(0);opacity:0} }
  @keyframes glow-pulse { 0%,100%{filter:drop-shadow(0 0 6px #22c55e88)} 50%{filter:drop-shadow(0 0 14px #22c55ecc)} }
  .scrollbar-hide::-webkit-scrollbar{display:none}
  .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
`;
