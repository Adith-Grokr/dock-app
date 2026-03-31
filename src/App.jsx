/**
 * App.jsx — Desktop Agents root component
 *
 * Renders animated SVG agent characters that walk across the bottom of
 * the screen as a transparent Electron overlay (or a full-page view in
 * the browser for development).
 *
 * Key responsibilities:
 *   • Agent lifecycle — spawn, despawn, state machine (spawning → walking
 *     → action1/2 / interacting → walking → despawning)
 *   • Animation loop — 50 ms tick moves agents, triggers random actions,
 *     and handles group-task collisions
 *   • IPC bridge — syncs agent list to the macOS menu bar tray; listens for
 *     tray events (open creator, quick-add, focus, remove)
 *   • Chat — sends messages to Gemini 2.5 Flash with per-agent persona;
 *     falls back to a mock reply when no API key is set
 *   • AgentCreatorModal — opens when "Add Agent…" is clicked; receives the
 *     fully-configured agent spec and calls makeAgent() + spawnAgent()
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, X, User, Bike, Plane } from 'lucide-react';

import { STATUS, PERSONA, ANIMATION_STYLES } from './lib/constants.js';
import { makeAgent } from './lib/agents.js';
import ArchitectSvg from './components/characters/ArchitectSvg.jsx';
import PilotSvg from './components/characters/PilotSvg.jsx';
import CyclistSvg from './components/characters/CyclistSvg.jsx';
import AgentPanel from './components/AgentPanel.jsx';
import AgentCreatorModal from './components/AgentCreatorModal.jsx';

const isElectron = typeof window !== 'undefined' && !!window.electron;
const apiKey = ''; // Add your Gemini key here for agent chat

// ─── Stable initial state ─────────────────────────────────────────────────────
const _first = makeAgent('cyclist', { state: 'walking', resumeTime: 0 });
const _initChats = {
  [_first.id]: [{ role: 'assistant', text: `Hi! I'm ${_first.name}. Open the Task tab to assign me some work!` }],
};

function renderSVG(agent, isWalking, isAction1, isAction2) {
  const isSprinting = agent.status === 'working';
  const props = { isWalking, isAction1, isAction2: isAction2 || isSprinting, className: 'h-32' };
  switch (agent.type) {
    case 'architect': return <ArchitectSvg {...props}/>;
    case 'pilot':     return <PilotSvg {...props}/>;
    default:          return <CyclistSvg {...props}/>;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [agents, setAgents]               = useState([_first]);
  const [chats, setChats]                 = useState(_initChats);
  const [activePanelId, setActivePanelId] = useState(null);
  const [selectedType, setSelectedType]   = useState('cyclist');
  const [isGroupTask, setIsGroupTask]     = useState(false);
  const [inputValue, setInputValue]       = useState('');
  const [isTyping, setIsTyping]           = useState(false);
  const [showCreator, setShowCreator]     = useState(false);

  const enableMouse  = useCallback(() => window.electron?.setIgnoreMouse(false), []);
  const disableMouse = useCallback(() => window.electron?.setIgnoreMouse(true), []);

  // ── Sync agents → tray ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isElectron) return;
    window.electron.updateAgents(agents.map(a => ({
      id: a.id, name: a.name, type: a.type, status: a.status,
      currentTask: a.currentTask ? { title: a.currentTask.title } : null,
    })));
  }, [agents]);

  // ── Tray event listeners ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isElectron) return;
    window.electron.onTrayAddAgent(type => addAgent(type));
    window.electron.onTrayOpenCreator(() => { enableMouse(); setShowCreator(true); });
    window.electron.onTrayFocusAgent(id => setActivePanelId(id));
    window.electron.onTrayRemoveAgent(id => removeAgentById(id));
    return () => {
      ['tray-add-agent','tray-open-creator','tray-focus-agent','tray-remove-agent']
        .forEach(ch => window.electron.removeAllListeners(ch));
    };
  }, []); // eslint-disable-line

  // ── Animation loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      setAgents(prev => {
        const next = prev.map(a => ({ ...a }));
        const now = Date.now();

        for (const a of next) {
          if (a.state === 'walking' && a.id !== activePanelId) {
            const speed = a.type === 'cyclist'
              ? (a.status === 'working' ? 1.0 : 0.6)
              : (a.status === 'working' ? 0.5 : 0.3);
            a.x += a.direction * speed;
            if (a.x >= 90) { a.direction = -1; a.x = 90; }
            if (a.x <= 10) { a.direction = 1;  a.x = 10; }
            if (Math.random() < 0.008) a.direction *= -1;
            if (a.status === 'idle' && Math.random() < 0.003) {
              a.state = Math.random() > 0.5 ? 'action1' : 'action2';
              a.resumeTime = now + (a.state === 'action1' ? 2000 : 3000);
            }
          } else if (
            (a.state === 'interacting' || a.state === 'action1' || a.state === 'action2' || a.state === 'spawning')
            && now > a.resumeTime
          ) {
            a.state = 'walking';
            if (a.state === 'interacting') {
              a.direction = a.originalDirection || a.direction;
              a.cooldown = now + 3000;
            }
          }
        }

        if (isGroupTask) {
          for (let i = 0; i < next.length; i++) {
            for (let j = i + 1; j < next.length; j++) {
              const a = next[i], b = next[j];
              if (
                a.state === 'walking' && b.state === 'walking'
                && a.id !== activePanelId && b.id !== activePanelId
                && (!a.cooldown || now > a.cooldown) && (!b.cooldown || now > b.cooldown)
                && Math.abs(a.x - b.x) < 5
              ) {
                a.state = b.state = 'interacting';
                a.resumeTime = b.resumeTime = now + 2500;
                a.originalDirection = a.direction; b.originalDirection = b.direction;
                if (a.x < b.x) { a.direction = 1; b.direction = -1; }
                else            { a.direction = -1; b.direction = 1; }
              }
            }
          }
        }

        return next;
      });
    }, 50);
    return () => clearInterval(tick);
  }, [activePanelId, isGroupTask]);

  // ── Agent management ────────────────────────────────────────────────────────
  const updateAgent = (id, updates) =>
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

  const addAgent = (type) => {
    const agent = makeAgent(type || selectedType);
    setAgents(prev => [...prev, agent]);
    setChats(prev => ({
      ...prev,
      [agent.id]: [{ role: 'assistant', text: `Hi! I'm ${agent.name}, your ${agent.type} agent. Assign me a task!` }],
    }));
  };

  const spawnAgentFromCreator = ({ name, type, skills, tools, mcps, projectDir, profession, description, persona, tone, greeting }) => {
    const agent = makeAgent(type, {
      ...(name ? { name } : {}),
      ...(skills?.length > 0 ? { skills } : {}),
      tools: tools || [],
      mcps: mcps || [],
      projectDir: projectDir || '',
      profession: profession || '',
      description: description || '',
      persona: persona || '',
      tone: tone || '',
    });
    setAgents(prev => [...prev, agent]);
    const welcomeMsg = greeting || `Hi! I'm ${agent.name}${profession ? `, your ${profession} agent` : ''}. Assign me a task!`;
    setChats(prev => ({ ...prev, [agent.id]: [{ role: 'assistant', text: welcomeMsg }] }));
  };

  const removeAgentById = (id) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, state: 'despawning' } : a));
    setTimeout(() => setAgents(prev => prev.filter(a => a.id !== id)), 300);
    if (activePanelId === id) setActivePanelId(null);
  };

  const removeAgent = (e, id) => { e.stopPropagation(); removeAgentById(id); };

  const assignTask = (id, { title, description, skills }) => {
    const task = {
      id: Math.random().toString(36).slice(2),
      title, description, skills,
      progress: 0, status: 'in_progress',
      startedAt: Date.now(), completedAt: null,
    };
    setAgents(prev => prev.map(a => a.id === id ? {
      ...a, currentTask: task, status: 'working',
      logs: [...a.logs, { time: Date.now(), msg: `Task assigned: "${title}"` }],
    } : a));
  };

  const updateTaskProgress = (id, progress) =>
    setAgents(prev => prev.map(a =>
      a.id === id && a.currentTask ? { ...a, currentTask: { ...a.currentTask, progress } } : a
    ));

  const completeTask = (id) => {
    setAgents(prev => prev.map(a => a.id === id && a.currentTask ? {
      ...a,
      status: 'done',
      taskHistory: [...a.taskHistory, { ...a.currentTask, status: 'done', completedAt: Date.now() }],
      currentTask: null,
      logs: [...a.logs, { time: Date.now(), msg: `✓ Completed: "${a.currentTask.title}"` }],
    } : a));
    setTimeout(() => setAgents(prev => prev.map(a =>
      a.id === id && a.status === 'done' ? { ...a, status: 'idle' } : a
    )), 3000);
  };

  const failTask = (id) => {
    setAgents(prev => prev.map(a => a.id === id && a.currentTask ? {
      ...a,
      status: 'failed',
      taskHistory: [...a.taskHistory, { ...a.currentTask, status: 'failed', completedAt: Date.now() }],
      currentTask: null,
      logs: [...a.logs, { time: Date.now(), msg: `✗ Failed: "${a.currentTask.title}"` }],
    } : a));
    setTimeout(() => setAgents(prev => prev.map(a =>
      a.id === id && a.status === 'failed' ? { ...a, status: 'idle' } : a
    )), 3000);
  };

  // ── Chat ────────────────────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activePanelId) return;
    const msg = inputValue.trim();
    const agentId = activePanelId;

    setChats(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), { role: 'user', text: msg }] }));
    setInputValue('');
    setIsTyping(true);
    updateAgent(agentId, {
      status: 'thinking',
      logs: [...(agents.find(a => a.id === agentId)?.logs || []), { time: Date.now(), msg: 'Thinking...' }],
    });

    const agent = agents.find(a => a.id === agentId);
    const p = PERSONA[agent?.type] || PERSONA.architect;

    if (!apiKey) {
      setTimeout(() => {
        setChats(prev => ({
          ...prev,
          [agentId]: [...(prev[agentId] || []), { role: 'assistant', text: `Beep boop! You said: "${msg}". Add a Gemini API key to enable real responses!` }],
        }));
        setIsTyping(false);
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: a.currentTask ? 'working' : 'idle' } : a));
      }, 900);
      return;
    }

    try {
      const payload = {
        contents: [{ parts: [{ text: msg }] }],
        systemInstruction: {
          parts: [{
            text: `You are a tiny friendly desktop agent shaped like ${p.desc}. ${p.tone} Keep replies brief (1-2 sentences).`,
          }],
        },
      };
      let retries = 0, data, ok = false;
      while (retries < 4 && !ok) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
          );
          if (!res.ok) throw new Error();
          data = await res.json(); ok = true;
        } catch { retries++; await new Promise(r => setTimeout(r, 2 ** retries * 800)); }
      }
      const reply = ok && data?.candidates?.[0]?.content?.parts?.[0]?.text
        ? data.candidates[0].content.parts[0].text
        : 'My circuits glitched! Try again.';
      setChats(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), { role: 'assistant', text: reply }] }));
    } catch {
      setChats(prev => ({ ...prev, [agentId]: [...(prev[agentId] || []), { role: 'assistant', text: 'Network error!' }] }));
    } finally {
      setIsTyping(false);
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: a.currentTask ? 'working' : 'idle' } : a));
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`relative w-full h-screen overflow-hidden font-sans ${isElectron ? 'bg-transparent' : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black'}`}>
      <style>{ANIMATION_STYLES}</style>
      {!isElectron && <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, white, transparent)', backgroundSize: '100px 100px' }}/>}

      {/* ── Browser control panel ── */}
      {!isElectron && (
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center gap-5">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 text-center">Desktop Agents</h1>
            <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl">
              <button onClick={() => setIsGroupTask(v => !v)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${isGroupTask ? 'bg-blue-500/80 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                <Users size={16}/> Group Task
              </button>
            </div>
            <div className="flex flex-col items-center gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <span className="text-xs font-medium text-white/50 uppercase tracking-widest">Add Agent</span>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 bg-black/20 p-1 rounded-xl">
                  {[{ id: 'architect', icon: User }, { id: 'pilot', icon: Plane }, { id: 'cyclist', icon: Bike }].map(c => (
                    <button key={c.id} onClick={() => setSelectedType(c.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${selectedType === c.id ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white hover:bg-white/10'}`}>
                      <c.icon size={14}/> <span className="capitalize">{c.id}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowCreator(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition active:scale-95">
                  <Plus size={16}/> Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Electron floating control bar ── */}
      {isElectron && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/70 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-2 shadow-2xl z-[100]"
          onMouseEnter={e => { e.stopPropagation(); enableMouse(); }}
          onMouseLeave={e => { e.stopPropagation(); disableMouse(); }}
        >
          <button onClick={() => { enableMouse(); setShowCreator(true); }}
            className="flex items-center gap-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg">
            <Plus size={12}/> Agent
          </button>
          <div className="w-px h-4 bg-white/15 mx-0.5"/>
          <button onClick={() => setIsGroupTask(v => !v)} title="Group Task"
            className={`p-1.5 rounded-lg transition-all ${isGroupTask ? 'bg-blue-500/70 text-white' : 'text-white/35 hover:text-white hover:bg-white/10'}`}>
            <Users size={14}/>
          </button>
          <div className="w-px h-4 bg-white/15 mx-0.5"/>
          <button onClick={() => window.electron?.quit()} className="p-1.5 text-white/25 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5" title="Quit">
            <X size={13}/>
          </button>
        </div>
      )}

      {/* ── Agents ── */}
      {agents.map(agent => {
        const isPanelOpen = activePanelId === agent.id;
        const isWalking   = (agent.state === 'walking' || agent.state === 'spawning') && !isPanelOpen;
        const isAction1   = agent.state === 'action1' && !isPanelOpen;
        const isAction2   = agent.state === 'action2' && !isPanelOpen;
        const st = STATUS[agent.status] || STATUS.idle;

        return (
          <div key={agent.id}
            className="absolute flex flex-col items-center justify-end"
            onMouseEnter={e => { e.stopPropagation(); enableMouse(); }}
            onMouseLeave={e => { e.stopPropagation(); disableMouse(); }}
            style={{
              left: `${agent.x}%`, bottom: '0px',
              transform: 'translateX(-50%)',
              zIndex: isPanelOpen ? 60 : 50,
              transition: agent.state === 'spawning' ? 'none' : 'left 50ms linear',
              animation: agent.state === 'despawning' ? 'pop-out 0.3s forwards ease-in'
                : agent.state === 'spawning' ? 'spawn-bounce 0.8s forwards' : 'none',
            }}
          >
            {/* Interaction bubble */}
            {!isPanelOpen && agent.state === 'interacting' && (
              <div className="absolute -top-10 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-gray-200/50 flex items-center gap-1">
                {[0, 0.2, 0.4].map(d => (
                  <div key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full" style={{ animation: `typing-dot 1.4s ${d}s infinite ease-in-out` }}/>
                ))}
              </div>
            )}

            {/* Agent Panel */}
            {isPanelOpen && (
              <AgentPanel
                agent={agent}
                chat={chats[agent.id] || []}
                isTyping={isTyping}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onClose={() => setActivePanelId(null)}
                onDelete={e => removeAgent(e, agent.id)}
                onSendMessage={handleSendMessage}
                onUpdateAgent={updates => updateAgent(agent.id, updates)}
                onAssignTask={task => assignTask(agent.id, task)}
                onUpdateProgress={p => updateTaskProgress(agent.id, p)}
                onCompleteTask={() => completeTask(agent.id)}
                onFailTask={() => failTask(agent.id)}
              />
            )}

            {/* Character */}
            <div className="relative">
              <button
                onClick={() => setActivePanelId(isPanelOpen ? null : agent.id)}
                className="relative cursor-pointer outline-none active:scale-95 transition-transform flex items-end justify-center"
                style={{
                  transform: `scaleX(${agent.direction > 0 ? 1 : -1})`,
                  filter: agent.status === 'working' ? 'drop-shadow(0 0 10px #22c55e88)' : 'none',
                  animation: agent.status === 'working' ? 'glow-pulse 2s infinite ease-in-out' : 'none',
                }}
              >
                {renderSVG(agent, isWalking, isAction1, isAction2)}
              </button>
              <div
                className={`absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md z-10 ${agent.status === 'working' ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: st.color }}
              />
            </div>
          </div>
        );
      })}

      {/* ── Agent Creator Modal ── */}
      {showCreator && (
        <AgentCreatorModal
          onClose={() => { setShowCreator(false); disableMouse(); }}
          onSpawn={spawnAgentFromCreator}
          enableMouse={enableMouse}
          disableMouse={disableMouse}
        />
      )}
    </div>
  );
}
