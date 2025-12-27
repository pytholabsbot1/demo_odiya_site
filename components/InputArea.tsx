import React, { useRef } from 'react';
import { Send, Paperclip, X, FileText, Loader2, Sparkles } from 'lucide-react';
import { Attachment } from '../types';

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  attachments: Attachment[];
  setAttachments: (files: Attachment[]) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
  input,
  setInput,
  attachments,
  setAttachments,
  onSend,
  isLoading,
  disabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = [];
      const files = Array.from(e.target.files);

      const promises = files.map((file: File) => {
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (readEvent) => {
            if (readEvent.target?.result) {
              const base64String = (readEvent.target.result as string).split(',')[1];
              const type = file.type.startsWith('image/') ? 'image' : 'pdf';
              
              if (type === 'image' || file.type === 'application/pdf') {
                newAttachments.push({
                  type: type,
                  mimeType: file.type,
                  data: base64String,
                  fileName: file.name
                });
              }
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(() => {
        setAttachments([...attachments, ...newAttachments]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="absolute bottom-6 left-0 right-0 px-4 md:px-0 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        
        {/* Attachments Preview - Floating above */}
        {attachments.length > 0 && (
          <div className="flex gap-3 overflow-x-auto mb-3 p-2 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg mx-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="relative group flex-shrink-0 animate-in zoom-in duration-200">
                <div className="h-14 w-14 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  {att.type === 'image' ? (
                    <img 
                      src={`data:${att.mimeType};base64,${att.data}`} 
                      alt="preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-red-50 flex items-center justify-center">
                      <FileText className="text-red-500 w-6 h-6" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md transform hover:scale-110"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Floating Input Bar */}
        <div className={`
          relative flex items-end gap-2 p-2 rounded-[28px] shadow-2xl transition-all duration-300
          ${disabled ? 'bg-gray-100' : 'bg-white border border-gray-100/50'}
        `}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
            className="p-3 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all flex-shrink-0"
          >
            <Paperclip size={20} />
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept="image/*,application/pdf"
          />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Select a project..." : "Ask OdiyaGPT..."}
            disabled={disabled}
            className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 text-gray-800 placeholder:text-gray-400 font-medium"
            rows={1}
          />

          <button
            onClick={onSend}
            disabled={(!input.trim() && attachments.length === 0) || isLoading || disabled}
            className={`p-3 rounded-full transition-all duration-300 shadow-md flex-shrink-0 ${
              (!input.trim() && attachments.length === 0) || isLoading || disabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-black text-white hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 transform hover:scale-105'
            }`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={input.trim() ? "translate-x-0.5" : ""} />}
          </button>
        </div>
        
        <div className="text-center mt-3">
          <p className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
             <Sparkles size={10} className="text-brand-400" /> Powered by Gemini 3 Flash
          </p>
        </div>
      </div>
    </div>
  );
};

export default InputArea;