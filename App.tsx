import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import SettingsModal from './components/SettingsModal';
import OCRTool from './components/OCRTool';
import NewsFeed from './components/NewsFeed';
import { Project, Message, Attachment, Chat, AppSettings, ProjectDocument, AppMode } from './types';
import { streamGeminiResponse } from './services/gemini';
import { INITIAL_GREETING } from './constants';
import { Menu, MessageSquarePlus, FileText, ScanEye, MessagesSquare, Plus, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [appMode, setAppMode] = useState<AppMode>('dashboard');

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ai-assistant-settings');
    return saved ? JSON.parse(saved) : { googleVisionApiKey: '' };
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('ai-assistant-projects');
    try {
      const parsed = JSON.parse(saved || '[]');
      if (parsed.length > 0 && !parsed[0].chats) {
        return parsed.map((p: any) => ({
          ...p,
          chats: [{
            id: uuidv4(),
            name: 'General Chat',
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            messages: p.messages || []
          }],
          documents: []
        }));
      }
      return parsed;
    } catch (e) {
      return [];
    }
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'docs' | 'ocr'>('chats');
  
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // New Document Input State
  const [docInput, setDocInput] = useState('');
  const [docName, setDocName] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- EFFECT: PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('ai-assistant-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('ai-assistant-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (appMode === 'dashboard' && activeTab === 'chats' && activeChatId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatId, projects, activeTab, appMode]);

  // --- DERIVED HELPERS ---
  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeChat = activeProject?.chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  // --- ACTIONS: PROJECT ---
  const createProject = () => {
    const newProject: Project = {
      id: uuidv4(),
      name: `Project ${projects.length + 1}`,
      description: 'New Project',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      chats: [],
      documents: []
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setActiveChatId(null);
    setActiveTab('chats');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setActiveChatId(null);
    }
  };

  // --- ACTIONS: CHAT ---
  const createChat = () => {
    if (!activeProjectId) return;
    const newChat: Chat = {
      id: uuidv4(),
      name: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [{
        id: uuidv4(),
        role: 'model',
        text: INITIAL_GREETING,
        timestamp: Date.now()
      }]
    };

    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return { ...p, chats: [newChat, ...p.chats] };
      }
      return p;
    }));
    setActiveChatId(newChat.id);
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return { ...p, chats: p.chats.filter(c => c.id !== chatId) };
      }
      return p;
    }));
    if (activeChatId === chatId) setActiveChatId(null);
  };

  // --- ACTIONS: DOCUMENTS ---
  const addDocument = () => {
    if (!activeProjectId || !docInput.trim() || !docName.trim()) return;
    
    const newDoc: ProjectDocument = {
      id: uuidv4(),
      name: docName,
      content: docInput,
      type: 'text',
      createdAt: Date.now()
    };

    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return { ...p, documents: [...p.documents, newDoc] };
      }
      return p;
    }));

    setDocName('');
    setDocInput('');
  };

  const deleteDocument = (docId: string) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return { ...p, documents: p.documents.filter(d => d.id !== docId) };
      }
      return p;
    }));
  };

  // --- ACTIONS: SEND MESSAGE ---
  const handleSendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || !activeProjectId || !activeChatId || isLoading) return;

    const currentProjectId = activeProjectId;
    const currentChatId = activeChatId;
    const userMessageText = input.trim();
    const userAttachments = [...attachments];

    // Reset Input
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text: userMessageText,
      attachments: userAttachments,
      timestamp: Date.now()
    };

    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          chats: p.chats.map(c => {
            if (c.id === currentChatId) {
              return { 
                ...c, 
                messages: [...c.messages, userMessage],
                updatedAt: Date.now(),
                name: c.messages.length <= 1 ? (userMessageText.slice(0, 30) || 'Image Query') : c.name
              };
            }
            return c;
          })
        };
      }
      return p;
    }));

    const botMessageId = uuidv4();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isStreaming: true
    };

    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          chats: p.chats.map(c => {
            if (c.id === currentChatId) return { ...c, messages: [...c.messages, botMessagePlaceholder] };
            return c;
          })
        };
      }
      return p;
    }));

    try {
      const currentProject = projects.find(p => p.id === currentProjectId);
      const currentChat = currentProject?.chats.find(c => c.id === currentChatId);
      const history = currentChat?.messages || []; 
      const documents = currentProject?.documents || [];

      await streamGeminiResponse(
        history, 
        userMessageText,
        userAttachments,
        documents,
        (chunk) => {
          setProjects(prev => prev.map(p => {
            if (p.id === currentProjectId) {
              return {
                ...p,
                chats: p.chats.map(c => {
                  if (c.id === currentChatId) {
                    const msgs = [...c.messages];
                    const idx = msgs.findIndex(m => m.id === botMessageId);
                    if (idx !== -1) {
                      msgs[idx] = { ...msgs[idx], text: msgs[idx].text + chunk };
                    }
                    return { ...c, messages: msgs };
                  }
                  return c;
                })
              };
            }
            return p;
          }));
        }
      );

      setProjects(prev => prev.map(p => {
        if (p.id === currentProjectId) {
          return {
            ...p,
            chats: p.chats.map(c => {
              if (c.id === currentChatId) {
                const msgs = [...c.messages];
                const idx = msgs.findIndex(m => m.id === botMessageId);
                if (idx !== -1) {
                   msgs[idx] = { ...msgs[idx], isStreaming: false };
                }
                return { ...c, messages: msgs };
              }
              return c;
            })
          };
        }
        return p;
      }));

    } catch (error) {
      setProjects(prev => prev.map(p => {
        if (p.id === currentProjectId) {
           return {
             ...p,
             chats: p.chats.map(c => {
               if (c.id === currentChatId) {
                 const msgs = [...c.messages];
                 const idx = msgs.findIndex(m => m.id === botMessageId);
                 if (idx !== -1) {
                    msgs[idx] = { 
                      ...msgs[idx], 
                      isStreaming: false,
                      isError: true,
                      text: msgs[idx].text || "Error occurred."
                    };
                 }
                 return { ...c, messages: msgs };
               }
               return c;
             })
           };
        }
        return p;
      }));
    } finally {
      setIsLoading(false);
    }
  };


  // --- RENDER ---
  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans text-gray-900">
      
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={(s) => setSettings(s)}
      />

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 md:relative md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar
          appMode={appMode}
          onSwitchMode={setAppMode}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => {
            setActiveProjectId(id);
            setActiveTab('chats');
            setActiveChatId(null);
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
          onOpenSettings={() => setSettingsOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {appMode === 'dashboard' ? (
          <>
             {/* Header */}
             {activeProject && (
               <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white/80 backdrop-blur-xl z-10 sticky top-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-500">
                      <Menu size={20} />
                    </button>
                    <h2 className="font-semibold text-gray-800 text-lg truncate max-w-[200px] md:max-w-md">
                      {activeProject.name}
                    </h2>
                  </div>

                  <div className="flex bg-gray-100/80 p-1 rounded-xl">
                    {[
                      { id: 'chats', icon: <MessagesSquare size={16} />, label: 'Chats' },
                      { id: 'docs', icon: <FileText size={16} />, label: 'Context' },
                      { id: 'ocr', icon: <ScanEye size={16} />, label: 'Vision' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === tab.id 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>
               </header>
             )}

             {/* Content */}
             <div className="flex-1 overflow-hidden relative">
               {!activeProject ? (
                 <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                   <div className="w-24 h-24 bg-gradient-to-tr from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-gray-50">
                     <span className="text-4xl">👋</span>
                   </div>
                   <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">OdiyaGPT Workspace</h1>
                   <p className="max-w-md text-gray-500 mb-8 leading-relaxed">
                     Select a project to start chatting, analyzing documents, or extracting text from images.
                   </p>
                   <button onClick={createProject} className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-black transition-all shadow-xl shadow-gray-200 font-medium flex items-center gap-2 transform hover:-translate-y-1">
                     <Plus size={20} /> New Project
                   </button>
                 </div>
               ) : (
                 <>
                   {activeTab === 'chats' && (
                     <div className="h-full flex flex-col md:flex-row">
                       
                       {/* Chat List */}
                       <div className={`w-full md:w-72 bg-gray-50/50 border-r border-gray-100 flex flex-col flex-shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
                         <div className="p-4">
                           <button onClick={createChat} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm shadow-sm">
                             <MessageSquarePlus size={18} /> New Chat
                           </button>
                         </div>
                         <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
                           {activeProject.chats.length === 0 ? (
                             <div className="text-center mt-10 text-gray-400 text-xs">No conversations yet</div>
                           ) : (
                             activeProject.chats.map(chat => (
                               <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`group p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center ${activeChatId === chat.id ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-gray-100/80 text-gray-600'}`}>
                                 <div className="min-w-0">
                                   <p className={`text-sm font-medium truncate ${activeChatId === chat.id ? 'text-gray-900' : ''}`}>{chat.name}</p>
                                   <p className="text-[10px] text-gray-400 mt-0.5">{new Date(chat.updatedAt).toLocaleDateString()}</p>
                                 </div>
                               </div>
                             ))
                           )}
                         </div>
                       </div>

                       {/* Chat Area */}
                       <div className={`flex-1 flex flex-col min-w-0 bg-white relative ${!activeChatId ? 'hidden md:flex' : 'flex'}`}>
                         {!activeChat ? (
                           <div className="flex-1 flex items-center justify-center text-gray-300">Select a chat</div>
                         ) : (
                           <>
                             <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-32">
                                <div className="md:hidden mb-4">
                                  <button onClick={() => setActiveChatId(null)} className="text-xs font-bold text-gray-500 uppercase tracking-wide">&larr; Back</button>
                                </div>
                                {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                                <div ref={messagesEndRef} />
                             </div>
                             <InputArea 
                               input={input}
                               setInput={setInput}
                               attachments={attachments}
                               setAttachments={setAttachments}
                               onSend={handleSendMessage}
                               isLoading={isLoading}
                               disabled={false}
                             />
                           </>
                         )}
                       </div>
                     </div>
                   )}

                   {/* Other Tabs Placeholder Logic kept consistent with previous structure but cleaner container */}
                   {activeTab === 'docs' && (
                     <div className="h-full overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                       <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                         <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText size={24} /></div>
                         Knowledge Base
                       </h2>
                       <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                         <div className="space-y-4">
                           <input type="text" placeholder="Document Title" value={docName} onChange={e => setDocName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                           <textarea placeholder="Paste context here..." value={docInput} onChange={e => setDocInput(e.target.value)} rows={5} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                           <div className="flex justify-end">
                             <button onClick={addDocument} disabled={!docName.trim() || !docInput.trim()} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed">Add Document</button>
                           </div>
                         </div>
                       </div>
                       <div className="grid gap-4 md:grid-cols-2">
                         {activeProject.documents.map(doc => (
                           <div key={doc.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative group">
                              <h4 className="font-bold text-gray-800 mb-2 truncate pr-8">{doc.name}</h4>
                              <button onClick={() => deleteDocument(doc.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                              <p className="text-xs text-gray-500 line-clamp-3 bg-gray-50 p-3 rounded-xl font-mono">{doc.content}</p>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {activeTab === 'ocr' && <OCRTool apiKey={settings.googleVisionApiKey} />}
                 </>
               )}
             </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
             <div className="md:hidden p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
               <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500"><Menu size={20} /></button>
               <span className="font-bold text-gray-900">Odiya News</span>
               <div className="w-5"></div>
             </div>
             <NewsFeed />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;