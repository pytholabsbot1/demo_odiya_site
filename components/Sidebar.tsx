import React from 'react';
import { Plus, Folder, Trash2, Settings, LayoutGrid, PanelLeft, PanelRight, Globe, Bot, Newspaper } from 'lucide-react';
import { Project, AppMode } from '../types';

interface SidebarProps {
  appMode: AppMode;
  onSwitchMode: (mode: AppMode) => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  appMode,
  onSwitchMode,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <div 
      className={`bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out z-20 ${
        isCollapsed ? 'w-20' : 'w-[280px]'
      }`}
    >
      {/* Brand Header */}
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold text-lg">
             O
           </div>
           {!isCollapsed && (
             <span className="font-bold text-xl tracking-tight text-gray-900">
               Odiya<span className="text-brand-600">GPT</span>
             </span>
           )}
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <PanelLeft size={18} />
          </button>
        )}
      </div>

      {/* Main Navigation (Mode Switcher) */}
      <div className="px-4 py-6">
        <div className="bg-gray-100/50 p-1 rounded-2xl flex flex-col gap-1">
          <NavButton 
            active={appMode === 'dashboard'} 
            onClick={() => onSwitchMode('dashboard')}
            icon={<Bot size={20} />}
            label="Assistant"
            collapsed={isCollapsed}
          />
          <NavButton 
            active={appMode === 'news'} 
            onClick={() => onSwitchMode('news')}
            icon={<Newspaper size={20} />}
            label="News Portal"
            collapsed={isCollapsed}
          />
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 no-scrollbar">
        
        {appMode === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            {!isCollapsed && (
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Projects</span>
                <button 
                  onClick={onCreateProject}
                  className="p-1 hover:bg-gray-100 rounded-md text-gray-500 hover:text-brand-600 transition-all"
                  title="New Project"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            {isCollapsed && (
              <button onClick={onCreateProject} className="w-full flex justify-center mb-4 p-2 text-gray-400 hover:text-brand-600">
                <Plus size={24} />
              </button>
            )}

            <div className="space-y-1">
              {projects.length === 0 ? (
                <div className="text-gray-400 text-xs text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  {!isCollapsed && "No projects yet"}
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className={`group relative flex items-center rounded-xl cursor-pointer transition-all duration-200 ${
                      isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'
                    } ${
                      activeProjectId === project.id
                        ? 'bg-white shadow-md shadow-gray-200/50 text-brand-700 ring-1 ring-gray-100'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Folder size={18} className={`flex-shrink-0 transition-colors ${
                      activeProjectId === project.id ? 'fill-brand-100 text-brand-600' : 'text-gray-400'
                    }`} />
                    
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 min-w-0 text-sm font-medium truncate">
                          {project.name}
                        </span>
                        <button
                          onClick={(e) => onDeleteProject(project.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {appMode === 'news' && !isCollapsed && (
           <div className="bg-gradient-to-br from-brand-50 to-purple-50 p-4 rounded-2xl border border-brand-100/50">
             <h4 className="text-sm font-bold text-brand-900 mb-3 flex items-center gap-2">
               <Globe size={14} /> Trusted Sources
             </h4>
             <ul className="space-y-3">
               {['Odisha TV', 'Sambad', 'Dharitri', 'The Samaja'].map((source) => (
                 <li key={source} className="flex items-center gap-3 text-sm text-gray-600">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-200"></span>
                   {source}
                 </li>
               ))}
             </ul>
           </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <button 
          onClick={onOpenSettings}
          className={`w-full flex items-center rounded-xl transition-all duration-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 ${
             isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
          }`}
        >
          <Settings size={20} />
          {!isCollapsed && <span className="font-medium text-sm">Settings</span>}
        </button>
        
        {isCollapsed && (
           <div className="mt-2 flex justify-center">
             <button onClick={onToggleCollapse} className="text-gray-300 hover:text-gray-500">
               <PanelRight size={20} />
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

// Helper Sub-component for Nav Buttons
const NavButton = ({ active, onClick, icon, label, collapsed }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center transition-all duration-200 rounded-xl ${
      active 
        ? 'bg-white shadow-sm text-brand-700 font-semibold ring-1 ring-gray-200' 
        : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'
    } ${collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}`}
    title={label}
  >
    {React.cloneElement(icon, { 
      size: 20, 
      className: active ? 'text-brand-600' : 'text-gray-400' 
    })}
    {!collapsed && <span>{label}</span>}
  </button>
);

export default Sidebar;