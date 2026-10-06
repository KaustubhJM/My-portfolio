// Page content, kept apart from the components that animate it.
// Media paths are relative to public/ (e.g. 'media/classroom.webm'); see README → "Project media".

export const RESUME = 'assets/Kaustubh-Jeet-Mishra-Resume.pdf';
export const EMAIL = 'kaustubhjeet2019@gmail.com';
export const GITHUB = 'https://github.com/KaustubhJM';
export const LINKEDIN = 'https://www.linkedin.com/in/kaustubh-jeet-mishra-b83ba8345/';

// B.Tech runs 2024 → 2028 (shown under "Years" in About)
export const STUDY = { start: 2024, end: 2028 };

export const NAV = [
  { href: '#work', num: '01', label: 'Work' },
  { href: '#tails', num: '02', label: 'Disciplines' },
  { href: '#sheet', num: '03', label: 'About' },
  { href: '#summon', num: '04', label: 'Contact' },
];

export const BANDS = {
  bone: ['Scikit-learn', 'XGBoost', 'PyTorch', 'TensorFlow', 'Keras', 'LangGraph', 'LangChain', 'Hugging Face', 'FAISS', 'DeepEval'],
  blood: ['Classification & regression', 'Neural networks', 'Multi-agent systems', 'Retrieval-augmented generation', 'Tool calling', 'Human-in-the-loop', 'Model Context Protocol', 'LoRA / PEFT'],
};

export const FACTS = [
  { term: 'Studying', detail: ['B.Tech, AI & ML', 'JSS Academy of Technical Education, Noida'] },
  { term: 'Years', detail: [`${STUDY.start} — ${STUDY.end}`] },
  { term: 'Focus', detail: ['Machine learning, deep learning and agentic AI'] },
];

/* Project shape (FEATURE, PROJECTS and ML_PROJECTS all use it):
   links        { github, demo, video, caseStudy } — empty string renders "… — coming soon"
   thumb        image / GIF / WebP shown at the top of the card (hidden when empty)
   problem      one or two sentences: what was broken or missing
   architecture how the pieces fit together
   results      list of measured outcomes (strings)
   year, status shown in the detail panel (status also on the card)
   graph        optional Mermaid export of the real LangGraph (draw_mermaid()); when set,
                its node order replaces the hand-written `flow`
   `human` in a flow marks the step where a person steps in (drawn in crimson) */

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
  // TODO(Kaustubh): fill in how the 0.68 → 0.90 figure was measured (shown under the metric)
  methodology: {
    dataset: '',   // e.g. which documents / lessons were indexed
    queries: '',   // number of evaluation queries
    k: '',         // the k in precision@k
    judge: '',     // DeepEval metric(s) / judge model used
    baseline: '',  // what the 0.68 baseline ranking was
  },
  // TODO(Kaustubh): evaluation table in the detail panel — baseline vs. best-first
  evaluation: [
    { metric: 'Precision@k', baseline: '', best: '' },
    { metric: 'Number of queries', baseline: '', best: '' },
    { metric: 'Latency', baseline: '', best: '' },
    { metric: 'Cost per lesson', baseline: '', best: '' },
  ],
  links: { github: '', demo: '', video: '', caseStudy: '' }, // TODO(Kaustubh): repo, live demo, video and case-study URLs
  thumb: '',        // TODO(Kaustubh): card/panel image, e.g. 'media/classroom.webp'
  demo: '',         // TODO(Kaustubh): short looping clip — one path or ['media/classroom.webm', 'media/classroom.mp4']
  poster: '',       // TODO(Kaustubh): poster frame for the demo clip, e.g. 'media/classroom-poster.webp'
  problem: '',      // TODO(Kaustubh): the problem this solves
  architecture: '', // TODO(Kaustubh): how the agents, retrieval and voice fit together
  results: [],      // TODO(Kaustubh): measured outcomes
  year: '',         // TODO(Kaustubh)
  status: 'In progress',
  graph: '',        // TODO(Kaustubh): optional Mermaid export of the real LangGraph
};

export const PROJECTS = [
  {
    no: '02', title: 'Blog Writing Agent',
    desc: 'An autonomous blog pipeline: ideation, live web research, outlining, drafting, human review and publishing to WordPress or Ghost.',
    flow: ['Ideate', 'Research', 'Outline', 'Write', { human: 'Review' }, 'Publish'],
    tags: ['LangGraph', 'Web search', 'Streamlit'],
    links: { github: '', demo: '', video: '', caseStudy: '' }, // TODO(Kaustubh): project URLs
    thumb: '',        // TODO(Kaustubh): card image
    problem: '',      // TODO(Kaustubh)
    architecture: '', // TODO(Kaustubh)
    results: [],      // TODO(Kaustubh)
    year: '',         // TODO(Kaustubh)
    status: '',       // TODO(Kaustubh): e.g. 'Shipped'
    graph: '',        // TODO(Kaustubh): optional Mermaid export
  },
  {
    no: '03', title: 'LinkedIn Posting Agent',
    desc: 'Turns messy notes into structured LinkedIn posts with gpt-oss-120b via ChatGroq, then publishes through OAuth2 and the LinkedIn API.',
    flow: ['Notes', 'Draft', { human: 'Approve' }, 'Post'],
    tags: ['LangGraph', 'ChatGroq', 'LinkedIn API'],
    links: { github: '', demo: '', video: '', caseStudy: '' }, // TODO(Kaustubh): project URLs
    thumb: '',        // TODO(Kaustubh): card image
    problem: '',      // TODO(Kaustubh)
    architecture: '', // TODO(Kaustubh)
    results: [],      // TODO(Kaustubh)
    year: '',         // TODO(Kaustubh)
    status: '',       // TODO(Kaustubh)
    graph: '',        // TODO(Kaustubh): optional Mermaid export
  },
  {
    no: '04', title: 'Conversational AI Assistant',
    desc: 'A stateful assistant on gemini-2.5-flash with memory across threads, web search, live stock prices, maths tools and a full RAG pipeline.',
    flow: ['Chat', 'Route', 'Tools / RAG', 'Memory'],
    tags: ['LangGraph', 'Gemini', 'FAISS'],
    links: { github: '', demo: '', video: '', caseStudy: '' }, // TODO(Kaustubh): project URLs
    thumb: '',        // TODO(Kaustubh): card image
    problem: '',      // TODO(Kaustubh)
    architecture: '', // TODO(Kaustubh)
    results: [],      // TODO(Kaustubh)
    year: '',         // TODO(Kaustubh)
    status: '',       // TODO(Kaustubh)
    graph: '',        // TODO(Kaustubh): optional Mermaid export
  },
];

export const ML_PROJECTS = [
  {
    no: '05', title: 'Kirana Store Inventory Intelligence',
    desc: 'ML pipelines for kirana and FMCG warehouse stock: product freshness scoring, expiry-risk tiers and inventory insights, trained on engineered synthetic retail data.',
    flow: ['Synthetic data', 'Features', 'XGBoost vs RF', 'Risk tiers'],
    tags: ['XGBoost', 'Random Forest', 'Pandas'],
    links: { github: '', demo: '', video: '', caseStudy: '' }, // TODO(Kaustubh): project URLs
    thumb: '',        // TODO(Kaustubh): card image
    problem: '',      // TODO(Kaustubh)
    architecture: '', // TODO(Kaustubh)
    results: [],      // TODO(Kaustubh): e.g. XGBoost vs. Random Forest scores
    year: '',         // TODO(Kaustubh)
    status: '',       // TODO(Kaustubh)
    graph: '',
  },
  {
    no: '06', title: 'Fraud Detection Model',
    desc: 'A classifier that flags anomalous and fraudulent transactions in a heavily imbalanced dataset, with resampling to lift precision and recall on the rare class.',
    flow: ['Transactions', 'Resample', 'Classify', 'Flag fraud'],
    tags: ['Scikit-learn', 'Anomaly detection'],
    links: { github: '', demo: '', video: '', caseStudy: '' }, // TODO(Kaustubh): project URLs
    thumb: '',        // TODO(Kaustubh): card image
    problem: '',      // TODO(Kaustubh)
    architecture: '', // TODO(Kaustubh)
    results: [],      // TODO(Kaustubh): e.g. precision / recall on the fraud class before and after resampling
    year: '',         // TODO(Kaustubh)
    status: '',       // TODO(Kaustubh)
    graph: '',
  },
  // TODO(Kaustubh): uncomment to show this project (it renders as soon as it's in the array)
  // {
  //   no: '07', title: 'Kirana Retail Demand Forecasting (XGBoost)',
  //   desc: '',
  //   flow: ['Sales history', 'Features', 'XGBoost', 'Forecast'],
  //   tags: ['XGBoost', 'Pandas'],
  //   links: { github: '', demo: '', video: '', caseStudy: '' },
  //   thumb: '',
  //   problem: '',
  //   architecture: '',
  //   results: [],
  //   year: '',
  //   status: '',
  //   graph: '',
  // },
];

// Hero proof line (the 0.68 → 0.90 figure already sits under the lede and in Work)
export const PROOF = [
  'RAG evaluation',
  'Multi-agent systems',
  'ML pipelines',
  // TODO(Kaustubh): add or reword items (keep them short and verifiable)
];

/* `proof` (optional) names the project that shows the skill, as a "Shown in" line.
   TODO(Kaustubh): add a `proof` to Deep Learning and Fine-Tuning when ready. */
export const TAILS = [
  { num: '一', title: 'Machine Learning', text: 'Regression and classification models — XGBoost, Random Forests and decision trees — compared until the best fit wins.', tags: ['Scikit-learn', 'XGBoost', 'Random Forest'], proof: 'Kirana Store Inventory Intelligence' },
  { num: '二', title: 'Data & Features', text: 'Preprocessing, synthetic datasets and feature engineering, plus resampling when the class that matters is the rare one.', tags: ['Pandas', 'Resampling', 'Imbalanced data'], proof: 'Fraud Detection Model' },
  { num: '三', title: 'Deep Learning', text: 'Neural networks built and trained end to end, from dense layers to transformers and attention.', tags: ['PyTorch', 'TensorFlow', 'Keras'] },
  { num: '四', title: 'Large Language Models', text: 'Transformers, embeddings and the prompt engineering that steers them, with open models from Hugging Face.', tags: ['Transformers', 'Prompting', 'Hugging Face'], proof: 'LinkedIn Posting Agent' },
  { num: '五', title: 'Agentic AI', text: 'Graphs of specialist agents that reason, plan, remember and hand work to one another without dropping context.', tags: ['LangGraph', 'LangChain', 'Memory'], proof: 'Teacher–Student AI Classroom' },
  { num: '六', title: 'Retrieval-Augmented Generation', text: 'Chunking, embeddings and FAISS indexes that ground every answer in a real source — and put the right passage first.', tags: ['RAG', 'FAISS', 'Embeddings'], proof: 'Teacher–Student AI Classroom' },
  { num: '七', title: 'Tool & Function Calling', text: 'Agents that search the web, fetch live data and call external APIs through clean tool contracts.', tags: ['Function calling', 'APIs'], proof: 'Conversational AI Assistant' },
  { num: '八', title: 'Fine-Tuning', text: 'Parameter-efficient adaptation of open models when prompting alone isn’t enough.', tags: ['LoRA', 'PEFT', 'Hugging Face'] },
  { num: '九', title: 'Evaluation', text: 'Precision, recall and custom LLM metrics that prove a model got better instead of hoping it did.', tags: ['Scikit-learn', 'DeepEval', 'LangSmith'], proof: 'Teacher–Student AI Classroom' },
];
