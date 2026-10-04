// Page content, kept apart from the components that animate it.

export const RESUME = 'assets/Kaustubh-Jeet-Mishra-Resume.pdf';
export const EMAIL = 'kaustubhjeet2019@gmail.com';
export const GITHUB = 'https://github.com/KaustubhJM';
export const LINKEDIN = 'https://www.linkedin.com/in/kaustubh-jeet-mishra-b83ba8345/';

export const NAV = [
  { href: '#sheet', num: '01', label: 'About' },
  { href: '#tails', num: '02', label: 'Disciplines' },
  { href: '#work', num: '03', label: 'Work' },
  { href: '#summon', num: '04', label: 'Contact' },
];

export const BANDS = {
  bone: ['LangGraph', 'LangChain', 'Hugging Face', 'PyTorch', 'TensorFlow', 'FAISS', 'DeepEval', 'Streamlit'],
  blood: ['Multi-agent systems', 'Retrieval-augmented generation', 'Tool calling', 'Human-in-the-loop', 'Model Context Protocol', 'LoRA / PEFT'],
};

export const FACTS = [
  { term: 'Studying', detail: ['B.Tech, AI & ML', 'JSS Academy of Technical Education, Noida'] },
  { term: 'Years', detail: ['2024 — 2028'] },
  { term: 'Focus', detail: ['Agentic AI, RAG and multi-agent orchestration'] },
];

export const DETAILS = [
  { src: 'assets/eye.jpg', w: 298, alt: "Close-up of the fox's crimson eye", caption: 'Eye detail',
    trait: 'Detail-oriented.', text: 'Reads the stack trace, the token count and the edge case nobody tested.' },
  { src: 'assets/mark.jpg', w: 254, alt: "The crimson flame-shaped marking on the fox's forehead", caption: 'Forehead marking',
    trait: 'Analytical.', text: 'Turns a fuzzy problem into nodes, edges and state before writing a single prompt.' },
  { src: 'assets/paw.jpg', w: 212, alt: "Close-up of the fox's crimson paw and black claws", caption: 'Paw detail',
    trait: 'Quality-driven.', text: 'Measures before trusting — retrieval gets evaluated, not assumed.' },
  { src: 'assets/tail.jpg', w: 304, alt: 'Brush-stroke detail of a white tail dipped in crimson', caption: 'Tail detail',
    trait: 'Adaptable.', text: 'Moves between Gemini, OpenAI and Groq — picks the model that fits the job.' },
];

export const TAILS = [
  { num: '一', title: 'Large Language Models', text: 'Transformers, self-attention and embeddings — and the prompt engineering that steers them.', tags: ['NLP', 'Transformers', 'Prompting'] },
  { num: '二', title: 'Agentic AI', text: 'Agents that reason and act: ReAct loops, planning, memory and careful state management.', tags: ['ReAct', 'Planning', 'Memory'] },
  { num: '三', title: 'Multi-Agent Orchestration', text: 'Graphs of specialist agents that hand work to one another without dropping context.', tags: ['LangGraph', 'LangChain'] },
  { num: '四', title: 'Retrieval-Augmented Generation', text: 'Semantic chunking and document pipelines that ground every answer in a real source.', tags: ['RAG', 'OCR', 'Multimodal'] },
  { num: '五', title: 'Vector Search', text: 'FAISS indexes and ranking strategies that put the right passage first, not fifth.', tags: ['FAISS', 'Embeddings'] },
  { num: '六', title: 'Tool & Function Calling', text: 'Agents that search the web, fetch live data and call external APIs through clean tool contracts.', tags: ['Function calling', 'MCP'] },
  { num: '七', title: 'Human-in-the-Loop', text: 'Review checkpoints and interrupts, so a person approves before anything goes out.', tags: ['Approvals', 'Interrupts'] },
  { num: '八', title: 'Fine-Tuning', text: 'Parameter-efficient adaptation of open models when prompting alone isn’t enough.', tags: ['LoRA', 'PEFT', 'Hugging Face'] },
  { num: '九', title: 'Evaluation', text: 'Custom metrics that prove a pipeline got better instead of hoping it did.', tags: ['DeepEval', 'Scikit-learn'] },
];

// `human` marks the step where a person steps in (drawn in crimson)
export const FEATURE = {
  no: '01',
  title: 'Teacher–Student AI Classroom',
  desc: 'A multi-agent voice tutor built on LangGraph. Planner, Explainer and Quiz agents run the lesson — and students can interrupt at any moment to ask a doubt.',
  points: [
    'Multimodal RAG pipeline — OCR, Gemini vision and FAISS — with document and web-search tool calling.',
    'Retrieval evaluated with custom DeepEval metrics; best-first ranking lifted ranking precision from 0.68 to 0.90.',
  ],
  flow: ['Planner', 'Explainer', 'Quiz', { human: 'Student interrupts' }],
  tags: ['LangGraph', 'Groq', 'Gemini', 'RAG', 'FAISS', 'DeepEval'],
  metric: { label: 'Ranking precision', from: 0.68, to: 0.9, note: 'after moving retrieval to best-first ranking' },
};

export const PROJECTS = [
  {
    no: '02', title: 'Blog Writing Agent',
    desc: 'An autonomous blog pipeline: ideation, live web research, outlining, drafting, human review and publishing to WordPress or Ghost.',
    flow: ['Ideate', 'Research', 'Outline', 'Write', { human: 'Review' }, 'Publish'],
    tags: ['LangGraph', 'Web search', 'Streamlit'],
  },
  {
    no: '03', title: 'LinkedIn Posting Agent',
    desc: 'Turns messy notes into structured LinkedIn posts with gpt-oss-120b via ChatGroq, then publishes through OAuth2 and the LinkedIn API.',
    flow: ['Notes', 'Draft', { human: 'Approve' }, 'Post'],
    tags: ['LangGraph', 'ChatGroq', 'LinkedIn API'],
  },
  {
    no: '04', title: 'Conversational AI Assistant',
    desc: 'A stateful assistant on gemini-2.5-flash with memory across threads, web search, live stock prices, maths tools and a full RAG pipeline.',
    flow: ['Chat', 'Route', 'Tools / RAG', 'Memory'],
    tags: ['LangGraph', 'Gemini', 'FAISS'],
  },
];
