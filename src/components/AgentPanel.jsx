/**
 * AgentPanel.jsx
 * Floating panel rendered above a clicked agent character.
 * Three tabs:
 *   Overview — type, profession, description, skills, tools, MCPs,
 *              project dir, current task summary, activity log
 *   Task     — assign / track / complete / fail a task with progress slider
 *   Chat     — real-time chat powered by Gemini (or mock if no key)
 */
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Trash2, Check, AlertCircle, Edit2, Folder, Wrench, Cpu } from 'lucide-react';
import { STATUS } from '../lib/constants.js';

export default function AgentPanel({
  agent, chat, isTyping, inputValue, setInputValue,
  onClose, onDelete, onSendMessage, onUpdateAgent,
  onAssignTask, onUpdateProgress, onCompleteTask, onFailTask,
}) {
  const [tab, setTab] = useState(agent.currentTask ? 'task' : 'overview');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(agent.name);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskSkills, setTaskSkills] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat, isTyping]);
  useEffect(() => { setNameInput(agent.name); }, [agent.name]);

  const st = STATUS[agent.status] || STATUS.idle;
  const toggleSkill = s => setTaskSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleAssign = e => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAssignTask({ title: taskTitle.trim(), description: taskDesc.trim(), skills: taskSkills });
    setTaskTitle(''); setTaskDesc(''); setTaskSkills([]);
    setTab('task');
  };

  const commitName = () => {
    if (nameInput.trim()) onUpdateAgent({ name: nameInput.trim() });
    setEditingName(false);
  };

  const offsetX = agent.x < 18 ? '-5%' : agent.x > 82 ? '-95%' : '-50%';

  return (
    <div
      className="absolute bottom-full mb-4 bg-white/88 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden flex flex-col"
      style={{ width: 340, height: 430, left: '50%', transform: `translateX(${offsetX})` }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/70 bg-white/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }}/>
          {editingName ? (
            <input autoFocus value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setNameInput(agent.name); setEditingName(false); } }}
              className="text-sm font-bold text-gray-800 bg-transparent border-b-2 border-indigo-400 outline-none w-28"
            />
          ) : (
            <button onClick={() => setEditingName(true)} className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-indigo-600 transition-colors group">
              {agent.name}
              <Edit2 size={10} className="opacity-0 group-hover:opacity-50 transition-opacity"/>
            </button>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${st.bg} ${st.text}`}>{st.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"><Trash2 size={13}/></button>
          <button onClick={onClose}  className="p-1.5 text-gray-300 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"><X size={14}/></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100/70 bg-white/20 shrink-0">
        {['overview', 'task', 'chat'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 text-[11px] font-semibold py-2.5 capitalize transition-all ${tab === t ? 'text-gray-900 border-b-2 border-gray-800 bg-white/30' : 'text-gray-400 hover:text-gray-600'}`}>
            {t === 'task' && agent.currentTask ? 'Task ●' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">

        {/* Overview */}
        {tab === 'overview' && (
          <div className="p-4 space-y-3.5">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5">Type</div>
              <span className="text-xs text-gray-700 font-medium capitalize">
                {agent.type}{agent.profession ? ` · ${agent.profession}` : ''}
              </span>
            </div>

            {agent.description && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5">About</div>
                <p className="text-[11px] text-gray-500 leading-relaxed">{agent.description}</p>
              </div>
            )}

            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {agent.skills.map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 font-medium">{s}</span>
                ))}
              </div>
            </div>

            {agent.tools?.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5 flex items-center gap-1"><Wrench size={8}/> Tools</div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.tools.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-600 rounded-full border border-slate-200 font-medium">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {agent.mcps?.length > 0 && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5 flex items-center gap-1"><Cpu size={8}/> MCPs</div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.mcps.map(m => (
                    <span key={m} className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full border border-violet-100 font-medium">{m}</span>
                  ))}
                </div>
              </div>
            )}

            {agent.projectDir && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5 flex items-center gap-1"><Folder size={8}/> Project</div>
                <div className="text-[10px] font-mono text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5 truncate">{agent.projectDir}</div>
              </div>
            )}

            {agent.currentTask && (
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5">Current Task</div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100 space-y-1.5">
                  <div className="text-xs font-semibold text-gray-800">{agent.currentTask.title}</div>
                  <div className="w-full bg-green-200/60 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${agent.currentTask.progress}%` }}/>
                  </div>
                  <div className="text-[10px] text-gray-500">{agent.currentTask.progress}% complete</div>
                </div>
              </div>
            )}

            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5">
                Activity · {agent.taskHistory.length} task{agent.taskHistory.length !== 1 ? 's' : ''} done
              </div>
              <div className="space-y-1.5">
                {[...agent.logs].reverse().slice(0, 6).map((log, i) => (
                  <div key={i} className="flex gap-2 text-[10px]">
                    <span className="text-gray-300 shrink-0 tabular-nums">
                      {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-gray-500">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Task */}
        {tab === 'task' && (
          <div className="p-4 space-y-4">
            {agent.currentTask ? (
              <>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Current Task</div>
                  <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 space-y-3">
                    <div className="text-sm font-bold text-gray-900">{agent.currentTask.title}</div>
                    {agent.currentTask.description && (
                      <div className="text-xs text-gray-500 leading-relaxed">{agent.currentTask.description}</div>
                    )}
                    {agent.currentTask.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agent.currentTask.skills.map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
                        <span>Progress</span><span className="font-semibold">{agent.currentTask.progress}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={agent.currentTask.progress}
                        onChange={e => onUpdateProgress(Number(e.target.value))}
                        className="w-full h-1.5 accent-green-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={onCompleteTask} className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold bg-green-500 text-white hover:bg-green-600 rounded-xl py-2 transition-colors">
                        <Check size={11}/> Mark Done
                      </button>
                      <button onClick={onFailTask} className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold bg-red-50 text-red-500 hover:bg-red-100 rounded-xl py-2 transition-colors border border-red-100">
                        <AlertCircle size={11}/> Failed
                      </button>
                    </div>
                  </div>
                </div>
                {agent.taskHistory.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">History</div>
                    <div className="space-y-1.5">
                      {[...agent.taskHistory].reverse().slice(0, 4).map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] bg-white rounded-xl p-2 border border-gray-50">
                          {t.status === 'done'
                            ? <Check size={10} className="text-green-500 shrink-0"/>
                            : <AlertCircle size={10} className="text-red-400 shrink-0"/>}
                          <span className="text-gray-600 truncate">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">Assign Task</div>
                  <form onSubmit={handleAssign} className="space-y-2.5">
                    <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Task title…"
                      className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-300 text-gray-800 placeholder:text-gray-300"
                    />
                    <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Description (optional)…" rows={2}
                      className="w-full text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-300 text-gray-800 placeholder:text-gray-300 resize-none"
                    />
                    <div>
                      <div className="text-[10px] text-gray-400 mb-1.5">Skills involved</div>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.skills.map(s => (
                          <button type="button" key={s} onClick={() => toggleSkill(s)}
                            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all font-medium ${taskSkills.includes(s) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" disabled={!taskTitle.trim()}
                      className="w-full text-xs font-bold bg-gray-900 text-white rounded-xl py-2 disabled:opacity-30 hover:bg-gray-700 transition-colors">
                      Assign Task →
                    </button>
                  </form>
                </div>
                {agent.taskHistory.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Task History</div>
                    <div className="space-y-1.5">
                      {[...agent.taskHistory].reverse().slice(0, 5).map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] bg-white rounded-xl p-2.5 border border-gray-50">
                          {t.status === 'done'
                            ? <Check size={10} className="text-green-500 shrink-0"/>
                            : <AlertCircle size={10} className="text-red-400 shrink-0"/>}
                          <span className="text-gray-600 truncate flex-1">{t.title}</span>
                          <span className="text-gray-300 text-[9px] tabular-nums shrink-0">
                            {new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Chat */}
        {tab === 'chat' && (
          <div className="p-4 space-y-3">
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[12px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-sm'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                }`}>{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2 shadow-sm flex items-center gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animation: `typing-dot 1.4s ${d}ms infinite ease-in-out` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>
        )}
      </div>

      {/* Chat input */}
      {tab === 'chat' && (
        <form onSubmit={onSendMessage} className="px-4 py-3 border-t border-gray-100/70 flex items-center gap-2 bg-white/30 shrink-0">
          <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
            placeholder="Chat with agent…"
            className="flex-1 bg-transparent text-gray-800 text-[12px] focus:outline-none placeholder:text-gray-300"
          />
          <button type="submit" disabled={!inputValue.trim()} className="text-gray-700 p-1.5 disabled:opacity-25 hover:scale-110 transition-transform">
            <Send size={14} strokeWidth={2.5}/>
          </button>
        </form>
      )}

      {/* Tail */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/88 border-b border-r border-white/60 rotate-45"/>
    </div>
  );
}
