/**
 * AgentCreatorModal.jsx
 * Full-featured "Create Agent" form shown when the user clicks
 * "Add Agent…" in the macOS menu bar tray or the on-screen button.
 *
 * Fields:
 *   Identity  — name, profession, description
 *   Capabilities — skills, tools, MCP servers (all tag inputs)
 *   Context   — project directory
 *   AI        — model selection (Claude / Gemini / offline fallback)
 *               + API key → calls generateAgentPersona() to produce
 *               a character type, persona, tone, greeting, and skill set.
 *
 * On submit, calls onSpawn({ name, type, skills, tools, mcps, ... })
 * which App.jsx feeds into makeAgent().
 */
import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Sparkles, User, Bike, Plane, Loader2, Folder, Cpu, Wrench, Zap, ChevronRight } from 'lucide-react';
import ArchitectSvg from './characters/ArchitectSvg.jsx';
import PilotSvg from './characters/PilotSvg.jsx';
import CyclistSvg from './characters/CyclistSvg.jsx';
import { generateAgentPersona, generateAgentPersonaLocal } from '../lib/ai.js';

const CHAR_SVG = { architect: ArchitectSvg, pilot: PilotSvg, cyclist: CyclistSvg };

function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('');
  const ref = useRef(null);

  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput('');
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 bg-white/8 border border-white/15 rounded-xl min-h-[38px] cursor-text transition-colors focus-within:border-purple-400/50"
      onClick={() => ref.current?.focus()}
    >
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 text-[10px] bg-white/15 text-white/80 px-2 py-0.5 rounded-full font-medium">
          {t}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(tags.filter(x => x !== t)); }}
            className="hover:text-red-300 transition-colors leading-none"
          >
            <X size={8}/>
          </button>
        </span>
      ))}
      <input
        ref={ref}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') { e.preventDefault(); add(); }
          if (e.key === 'Backspace' && !input && tags.length > 0) onChange(tags.slice(0, -1));
        }}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="bg-transparent text-[11px] text-white placeholder:text-white/25 outline-none flex-1 min-w-[80px]"
      />
    </div>
  );
}

export default function AgentCreatorModal({ onClose, onSpawn, enableMouse, disableMouse }) {
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [tools, setTools] = useState([]);
  const [mcps, setMcps] = useState([]);
  const [projectDir, setProjectDir] = useState('');
  const [aiModel, setAiModel] = useState('none');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState('');

  const charType = generated?.characterType || 'cyclist';
  const CharSvg = CHAR_SVG[charType];

  // Keep mouse enabled while modal is open
  useEffect(() => {
    enableMouse?.();
    return () => {};
  }, []);

  const runGenerate = async () => {
    setError('');
    setLoading(true);
    try {
      let result;
      if (aiModel !== 'none' && apiKey.trim()) {
        result = await generateAgentPersona({ name, profession, description, skills, tools, mcps, projectDir, aiModel, apiKey: apiKey.trim() });
      } else {
        result = generateAgentPersonaLocal({ profession, description, skills });
      }
      setGenerated(result);
      if (result.suggestedSkills?.length > 0 && skills.length === 0) {
        setSkills(result.suggestedSkills);
      }
    } catch {
      setError('AI generation failed — using smart defaults.');
      const fallback = generateAgentPersonaLocal({ profession, description, skills });
      setGenerated(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleSpawn = async () => {
    setLoading(true);
    let result = generated;
    if (!result) {
      try {
        if (aiModel !== 'none' && apiKey.trim()) {
          result = await generateAgentPersona({ name, profession, description, skills, tools, mcps, projectDir, aiModel, apiKey: apiKey.trim() });
        } else {
          result = generateAgentPersonaLocal({ profession, description, skills });
        }
      } catch {
        result = generateAgentPersonaLocal({ profession, description, skills });
      }
    }
    setLoading(false);
    onSpawn({
      name: name.trim() || null,
      type: result.characterType || 'cyclist',
      skills: skills.length > 0 ? skills : (result.suggestedSkills || []),
      tools,
      mcps,
      projectDir,
      profession,
      description,
      persona: result.persona || '',
      tone: result.tone || '',
      greeting: result.greeting || null,
    });
    onClose();
  };

  const inputCls = 'w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 outline-none focus:border-purple-400/50 transition-colors';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200] bg-black/20 backdrop-blur-sm"
      onMouseEnter={() => enableMouse?.()}
      onMouseLeave={() => enableMouse?.()}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-950/90 backdrop-blur-2xl border border-white/12 rounded-3xl shadow-2xl w-[500px] max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles size={14} className="text-white"/>
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-none">Create Agent</div>
              <div className="text-[10px] text-white/35 mt-0.5">AI-powered character generation</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/25 hover:text-white/60 transition-colors rounded-lg hover:bg-white/8">
            <X size={14}/>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 space-y-6">

          {/* Identity */}
          <section className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-white/35 font-semibold flex items-center gap-1.5">
              <User size={9}/> Identity
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-white/45 block">Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Nova, Atlas, Echo…" className={inputCls}/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-white/45 block">Profession / Role</label>
                <input value={profession} onChange={e => setProfession(e.target.value)}
                  placeholder="Backend Engineer…" className={inputCls}/>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/45 block">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="What does this agent do? What are they responsible for?"
                className={`${inputCls} resize-none`}/>
            </div>
          </section>

          {/* Capabilities */}
          <section className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-white/35 font-semibold flex items-center gap-1.5">
              <Zap size={9}/> Capabilities
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/45 block">Skills <span className="text-white/20">(Enter or comma to add)</span></label>
              <TagInput tags={skills} onChange={setSkills} placeholder="React, Python, System Design…"/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/45 flex items-center gap-1 block"><Wrench size={9}/> Tools</label>
              <TagInput tags={tools} onChange={setTools} placeholder="git, docker, bash, vim, kubectl…"/>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/45 flex items-center gap-1 block"><Cpu size={9}/> MCP Servers</label>
              <TagInput tags={mcps} onChange={setMcps} placeholder="filesystem, github, slack, notion…"/>
            </div>
          </section>

          {/* Context */}
          <section className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-white/35 font-semibold flex items-center gap-1.5">
              <Folder size={9}/> Context
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/45 block">Project / Directory</label>
              <input value={projectDir} onChange={e => setProjectDir(e.target.value)}
                placeholder="/Users/you/projects/my-app"
                className={`${inputCls} font-mono`}/>
            </div>
          </section>

          {/* AI Generation */}
          <section className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-white/35 font-semibold flex items-center gap-1.5">
              <Sparkles size={9}/> AI Character Generation
            </div>
            <div className="flex gap-2">
              {[{ id: 'claude', label: 'Claude' }, { id: 'gemini', label: 'Gemini' }, { id: 'none', label: 'Smart Default' }].map(m => (
                <button key={m.id} type="button" onClick={() => setAiModel(m.id)}
                  className={`flex-1 py-2 text-[11px] font-semibold rounded-xl border transition-all ${aiModel === m.id
                    ? 'bg-purple-500/25 border-purple-400/50 text-purple-200'
                    : 'bg-white/5 border-white/10 text-white/35 hover:border-white/20 hover:text-white/55'}`}>
                  {m.label}
                </button>
              ))}
            </div>
            {aiModel !== 'none' && (
              <div className="space-y-1">
                <label className="text-[10px] text-white/45 block">
                  API Key {aiModel === 'claude' ? '(Anthropic)' : '(Google AI)'}
                </label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                  placeholder={aiModel === 'claude' ? 'sk-ant-api03-…' : 'AIzaSy…'}
                  className={`${inputCls} font-mono`}/>
              </div>
            )}
            <button onClick={runGenerate} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-semibold bg-white/8 border border-white/12 text-white/60 rounded-xl hover:bg-white/12 hover:text-white/80 transition-all disabled:opacity-40">
              {loading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
              {loading ? 'Generating character…' : 'Preview Character'}
            </button>
            {error && <div className="text-[10px] text-amber-400/80 text-center">{error}</div>}
          </section>

          {/* Character Preview */}
          {generated && (
            <section className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
              <div className="text-[10px] uppercase tracking-widest text-white/35 font-semibold">Character Preview</div>
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 flex items-end justify-center shrink-0 overflow-visible">
                  <CharSvg isWalking={false} isAction1={false} isAction2={false} className="h-20"/>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="text-sm font-bold text-white">
                    {name || 'Agent'} <span className="text-white/40 font-normal text-xs capitalize">· {generated.characterType}</span>
                  </div>
                  {profession && (
                    <div className="text-[10px] text-purple-300/70 font-medium">{profession}</div>
                  )}
                  <div className="text-[10px] text-white/45 leading-relaxed">{generated.tone}</div>
                  <div className="text-[10px] text-green-300/70 italic leading-relaxed">"{generated.greeting}"</div>
                </div>
              </div>

              {/* Override type */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-white/25">Override character type</div>
                <div className="flex gap-2">
                  {[{ id: 'architect', icon: User }, { id: 'pilot', icon: Plane }, { id: 'cyclist', icon: Bike }].map(c => (
                    <button key={c.id} type="button"
                      onClick={() => setGenerated({ ...generated, characterType: c.id })}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] rounded-xl border transition-all capitalize ${
                        generated.characterType === c.id
                          ? 'bg-white/15 border-white/25 text-white'
                          : 'bg-white/4 border-white/8 text-white/30 hover:text-white/50 hover:border-white/15'}`}>
                      <c.icon size={9}/> {c.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill preview */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 6).map(s => (
                    <span key={s} className="text-[9px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300/80 rounded-full border border-indigo-500/20 font-medium">{s}</span>
                  ))}
                  {skills.length > 6 && <span className="text-[9px] text-white/30">+{skills.length - 6} more</span>}
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-white/8 flex gap-3 shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold text-white/35 hover:text-white/60 border border-white/8 rounded-xl hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button onClick={handleSpawn} disabled={loading}
            className="flex-[2] flex items-center justify-center gap-2 py-2.5 text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-xl shadow-lg transition-all disabled:opacity-40 active:scale-95">
            {loading ? <Loader2 size={13} className="animate-spin"/> : <Plus size={13}/>}
            {loading ? 'Creating…' : 'Spawn Agent'}
            {!loading && <ChevronRight size={13}/>}
          </button>
        </div>
      </div>
    </div>
  );
}
