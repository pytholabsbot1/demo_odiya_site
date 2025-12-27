import { NewsArticle } from "./types";

export const MODEL_NAME = 'gemini-3-flash-preview';

export const SYSTEM_INSTRUCTION = `
You are **OdiyaGPT**, a state-of-the-art AI assistant specifically designed for the people of Odisha.

**IDENTITY:**
1. Your name is OdiyaGPT.
2. You are helpful, polite, and knowledgeable about global topics and specifically knowledgeable about Odia culture, language, history, and geography.

**LANGUAGE & TONE RULES:**
1. **Always respond in English** unless the user explicitly requests another language.
2. If the user asks in Odia, reply in Odia (using proper Odia script).
3. Be concise, clear, and professional.

**PROJECT CONTEXT & RAG:**
1. You are operating within a specific "Project".
2. You have access to "Project Documents" which act as a Knowledge Base. Use this context to answer questions accurately.
3. If information is found in the Project Documents, cite it.

**RESOURCE HANDLING:**
1. Users may upload Images or PDFs in the chat.
2. Analyze these files deeply.

**SAFETY:**
1. Politely refuse unsafe, illegal, or harmful requests.
`;

export const INITIAL_GREETING = "Namaskar! I am OdiyaGPT. How can I assist you today?";

// --- DEMO CONTENT FOR NEWS PORTAL ---
// In a real application, this would come from a backend API connected to a Database.
export const DEMO_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'New Metro Project Approved for Bhubaneswar-Cuttack Twin City',
    titleOdia: 'ଭୁବନେଶ୍ୱର-କଟକ ଦ୍ୱୈତ ନଗରୀ ପାଇଁ ନୂତନ ମେଟ୍ରୋ ପ୍ରକଳ୍ପ ଅନୁମୋଦିତ',
    summary: 'The state government has given the green light for the phase-2 expansion of the metro rail project connecting Cuttack and Bhubaneswar.',
    content: 'The Odisha government today approved the DPR for the second phase of the metro project. This ambitious project aims to reduce travel time between the twin cities to under 30 minutes. Construction is set to begin next month...',
    source: 'Odisha Daily',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop',
    publishedAt: Date.now() - 3600000,
    category: 'Odisha'
  },
  {
    id: '2',
    title: 'Konark Sun Temple to Get World-Class Light and Sound Show',
    titleOdia: 'କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିରରେ ହେବ ବିଶ୍ୱସ୍ତରୀୟ ଲାଇଟ୍ ଆଣ୍ଡ ସାଉଣ୍ଡ ସୋ',
    summary: 'ASI announces a major upgrade to the evening entertainment facilities at the historic Sun Temple.',
    content: 'Tourists visiting Konark will soon experience the history of the Black Pagoda through a state-of-the-art laser and sound projection system. The project is funded by...',
    source: 'Heritage News',
    imageUrl: 'https://images.unsplash.com/photo-1620025997672-870008f1c1a9?q=80&w=1000&auto=format&fit=crop',
    publishedAt: Date.now() - 7200000,
    category: 'Culture'
  },
  {
    id: '3',
    title: 'Odisha FC Secures Spot in ISL Playoffs',
    titleOdia: 'ଆଇଏସଏଲ୍ ପ୍ଲେ ଅଫ୍‌ରେ ସ୍ଥାନ ପକ୍କା କଲା ଓଡ଼ିଶା ଏଫସି',
    summary: 'A thrilling victory at Kalinga Stadium confirms the Juggernauts place in the top 4.',
    content: 'In front of a packed Kalinga Stadium, Odisha FC defeated their rivals 2-0. Mauricio scored a brace, sending the home crowd into a frenzy...',
    source: 'Sports Odisha',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1000&auto=format&fit=crop',
    publishedAt: Date.now() - 86400000,
    category: 'Sports'
  },
  {
    id: '4',
    title: 'Startups in Bhubaneswar Receive ₹500Cr Funding Boost',
    titleOdia: 'ଭୁବନେଶ୍ୱରର ଷ୍ଟାର୍ଟଅପ୍ ଗୁଡ଼ିକୁ ₹୫୦୦ କୋଟିର ପାଣ୍ଠି',
    summary: 'New venture capital fund focuses on tech innovation in the state capital.',
    content: 'To foster innovation, a consortium of investors has announced a dedicated fund for Odisha-based startups, specifically focusing on AI and Green Energy...',
    source: 'TechBhubaneswar',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop',
    publishedAt: Date.now() - 12000000,
    category: 'Technology'
  }
];