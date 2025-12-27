import React, { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, ScanEye, Type } from 'lucide-react';
import { performOCR } from '../services/vision';
import { OCRResult } from '../types';

interface OCRToolProps {
  apiKey: string;
}

const OCRTool: React.FC<OCRToolProps> = ({ apiKey }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImage(ev.target.result as string);
          setResult(null);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const runOCR = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);

    try {
      const base64 = image.split(',')[1];
      const data = await performOCR(base64, apiKey);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "OCR Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (image && result && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image
        ctx?.drawImage(img, 0, 0);

        // Draw bounding boxes
        if (ctx) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#ef4444'; // Red color
          ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';

          result.blocks.forEach(block => {
            const vertices = block.boundingBox;
            if (vertices.length > 0) {
              ctx.beginPath();
              ctx.moveTo(vertices[0].x, vertices[0].y);
              for (let i = 1; i < vertices.length; i++) {
                ctx.lineTo(vertices[i].x, vertices[i].y);
              }
              ctx.closePath();
              ctx.stroke();
              ctx.fill();
            }
          });
        }
      };
    } else if (image && !result && canvasRef.current) {
       // Just draw the image if no result yet
       const canvas = canvasRef.current;
       const ctx = canvas.getContext('2d');
       const img = new Image();
       img.src = image;
       img.onload = () => {
         canvas.width = img.width;
         canvas.height = img.height;
         ctx?.drawImage(img, 0, 0);
       }
    }
  }, [image, result]);

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
        <ScanEye size={48} className="mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-700">Vision API Key Missing</h3>
        <p className="max-w-md mt-2">Please go to Settings (Gear icon in sidebar) and add your Google Vision API Key to use this feature.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <ScanEye className="text-brand-600" /> OCR Lab
             </h2>
             <p className="text-gray-500 text-sm">Upload an image to extract text and visualize detection.</p>
          </div>
          <div className="flex gap-3">
             <button
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
             >
               <Upload size={18} /> Upload Image
             </button>
             <button
               onClick={runOCR}
               disabled={!image || loading}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition ${
                 !image || loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
               }`}
             >
               {loading ? <Loader2 size={18} className="animate-spin" /> : <ScanEye size={18} />}
               Extract Text
             </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            Error: {error}
          </div>
        )}

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Canvas View */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex items-center justify-center overflow-hidden">
            {image ? (
              <div className="relative w-full overflow-auto max-h-[600px]">
                 <canvas ref={canvasRef} className="max-w-full h-auto" />
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Upload className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p>No image uploaded</p>
              </div>
            )}
          </div>

          {/* Results View */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full min-h-[400px]">
             <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
               <Type size={18} /> Extracted Text
             </h3>
             <div className="flex-1 bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-[600px]">
               {result ? result.fullText : <span className="text-gray-400 italic">Extracted text will appear here...</span>}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OCRTool;