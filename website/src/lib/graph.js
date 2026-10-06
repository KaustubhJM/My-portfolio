/* Turns a project's flow into the list of steps the Flow component draws.
   If the project has a Mermaid `graph` (LangGraph's draw_mermaid() output), its nodes are
   used in the order they're reached from __start__; otherwise the hand-written `flow`. */

const HUMAN = /human|review|approv|interrupt/i;
// id followed by a shape: A[..]  A(..)  A([..])  A[[..]]  A((..))  A{{..}}  A{..}  A>..]
const SHAPE = /\b([A-Za-z_]\w*)(\(\[|\[\[|\[\(|\(\(|\{\{|\[|\(|\{|>)(.*?)(\]\)|\]\]|\)\]|\)\)|\}\}|\]|\)|\})(?::::[\w-]+)?/g;
const ARROW = /\s*(?:<?-\.+->|<?-->|<?==>|--\s[^-]*?-->|-\.\s[^.]*?\.->)\s*(?:\|[^|]*\|\s*)?/;

const clean = (label) => label.replace(/<[^>]+>/g, '').replace(/^["']|["']$/g, '').trim();
const pretty = (id) => id.replace(/[_-]+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());

export function parseMermaid(src) {
  const labels = new Map();
  const next = new Map();
  const order = [];
  const see = (id) => { if (!order.includes(id)) order.push(id); };

  src.replace(/^---[\s\S]*?---/, '').split(/\r?\n|;/).forEach((line) => {
    const text = line.trim();
    if (!text || /^(graph|flowchart|classDef|class\s|style|linkStyle|subgraph|end$|%%)/.test(text)) return;
    // Record inline labels, then reduce each node to its id so edges are easy to split
    const ids = text.replace(SHAPE, (_, id, open, label) => { labels.set(id, clean(label)); return id; });
    const chain = ids.split(ARROW).map((t) => t.trim()).filter((t) => /^\w+$/.test(t));
    chain.forEach(see);
    for (let i = 0; i < chain.length - 1; i += 1) {
      if (!next.has(chain[i])) next.set(chain[i], []);
      next.get(chain[i]).push(chain[i + 1]);
    }
  });

  // Breadth-first from __start__ (or the first node declared), then anything unreached
  const start = order.includes('__start__') ? '__start__' : order[0];
  const seen = new Set();
  const queue = start ? [start] : [];
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    (next.get(id) || []).forEach((n) => queue.push(n));
  }
  order.forEach((id) => seen.add(id));

  return [...seen]
    .filter((id) => id !== '__start__' && id !== '__end__')
    .map((id) => {
      const label = labels.get(id);
      return !label || label === id ? pretty(id) : label;
    });
}

// Steps as Flow expects them: strings, plus { human } for the step a person takes
export function flowSteps(project) {
  if (!project.graph?.trim()) return project.flow;
  const nodes = parseMermaid(project.graph);
  if (!nodes.length) return project.flow;
  const human = project.flow.find((s) => typeof s !== 'string')?.human;
  return nodes.map((label) => ((human && label.toLowerCase() === human.toLowerCase()) || HUMAN.test(label) ? { human: label } : label));
}
