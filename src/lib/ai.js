/**
 * ai.js
 * Handles AI-powered agent character generation.
 * Supports Claude (Anthropic) and Gemini (Google) APIs, with a
 * rule-based local fallback when no API key is provided.
 */

const PROMPT = ({ name, profession, description, skills, tools, mcps, projectDir }) => `You are helping create a virtual desktop agent character. Based on the following details, generate a character profile.

Agent Details:
- Name: ${name || 'unnamed'}
- Profession/Role: ${profession || 'general assistant'}
- Description: ${description || 'a helpful assistant'}
- Skills: ${skills.length > 0 ? skills.join(', ') : 'general'}
- Tools: ${tools.length > 0 ? tools.join(', ') : 'none specified'}
- MCP Servers: ${mcps.length > 0 ? mcps.join(', ') : 'none specified'}
- Project/Directory: ${projectDir || 'not specified'}

Respond with a JSON object only (no markdown, no code block, raw JSON):
{
  "characterType": "architect",
  "persona": "brief description of what this character looks like and does (1 sentence)",
  "tone": "personality and communication style (1 sentence)",
  "greeting": "first message this agent says when spawned (friendly, 1-2 sentences, mention their specialty)",
  "suggestedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"]
}

Rules for characterType:
- "architect": planners, designers, analysts, product managers, system architects, researchers
- "pilot": DevOps, deployment, monitoring, infrastructure, ops, coordinators, SRE
- "cyclist": performance engineers, data scientists, optimizers, backend devs, pipeline builders`;

/**
 * Call Claude or Gemini to generate a character profile from form data.
 * Returns { characterType, persona, tone, greeting, suggestedSkills }.
 * Throws on network/API errors — callers should catch and fall back to
 * generateAgentPersonaLocal().
 */
export async function generateAgentPersona({ name, profession, description, skills, tools, mcps, projectDir, aiModel, apiKey }) {
  const prompt = PROMPT({ name, profession, description, skills, tools, mcps, projectDir });

  if (aiModel === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.content[0].text);
  }

  // Gemini
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

/**
 * Offline fallback: infer character type from profession keywords and
 * return a sensible default persona/greeting without any API call.
 */
export function generateAgentPersonaLocal({ profession, description, skills }) {
  const text = ((profession || '') + ' ' + (description || '')).toLowerCase();

  let characterType = 'cyclist';
  if (/architect|design|plan|product|analys|research|strateg|manager/.test(text)) {
    characterType = 'architect';
  } else if (/devops|deploy|infra|ops|monitor|sre|cloud|pipeline|ci.?cd/.test(text)) {
    characterType = 'pilot';
  }

  const role = profession || 'Developer';
  return {
    characterType,
    persona: `A skilled ${role} agent ready to tackle complex challenges.`,
    tone: 'Professional, focused, and eager to help.',
    greeting: `Hi! I'm your ${role} agent. Assign me a task and I'll get started right away!`,
    suggestedSkills: skills.length > 0
      ? skills
      : ['Problem Solving', 'Communication', 'Analysis', 'Planning', 'Execution', 'Review'],
  };
}
