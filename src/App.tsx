/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  ChevronRight, 
  RefreshCw, 
  Download,
  Check,
  Info,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KITCHEN_STYLES, generateKitchenInspiration, GenerationResult } from './services/geminiService';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState(KITCHEN_STYLES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setMimeType(file.type);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setIsGenerating(true);
    setError(null);
    try {
      const res = await generateKitchenInspiration(selectedImage, mimeType, selectedStyle);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError("Failed to generate inspiration. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `kitchen-inspiration-${selectedStyle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-8 border-b border-black/5 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight">Kitchen Modernizer</h1>
              <p className="text-xs text-black/40 font-medium uppercase tracking-widest">AI Interior Design</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-black/60">
            <a href="#" className="hover:text-black transition-colors">How it works</a>
            <a href="#" className="hover:text-black transition-colors">Styles</a>
            <a href="#" className="hover:text-black transition-colors">Gallery</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded">01</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black/80">Upload Photo</h2>
            </div>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
                ${selectedImage ? 'border-black/10 bg-black/5' : 'border-black/20 hover:border-black/40 bg-white hover:bg-black/[0.02]'}`}
            >
              {selectedImage ? (
                <>
                  <img src={selectedImage} alt="Original" className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> Change Photo
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-black/40" />
                  </div>
                  <p className="text-sm font-medium text-black/60">Click to upload or drag and drop</p>
                  <p className="text-xs text-black/30 mt-1">JPG, PNG up to 10MB</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded">02</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-black/80">Select Style</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {KITCHEN_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 group
                    ${selectedStyle === style.id 
                      ? 'bg-black border-black text-white shadow-lg shadow-black/10' 
                      : 'bg-white border-black/5 hover:border-black/20 text-black/60 hover:text-black'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{style.name}</span>
                    {selectedStyle === style.id && <Check className="w-4 h-4" />}
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${selectedStyle === style.id ? 'text-white/60' : 'text-black/40'}`}>
                    {style.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={handleGenerate}
            disabled={!selectedImage || isGenerating}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all
              ${!selectedImage || isGenerating 
                ? 'bg-black/10 text-black/20 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-black/90 active:scale-[0.98] shadow-xl shadow-black/20'}`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Reimagining...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Inspiration
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3">
              <Info className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-black/5 p-4 md:p-8 min-h-[600px] flex flex-col">
            <AnimatePresence mode="wait">
              {!result && !isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="w-20 h-20 bg-[#F5F5F0] rounded-full flex items-center justify-center mb-6">
                    <ImageIcon className="w-10 h-10 text-black/10" />
                  </div>
                  <h3 className="font-serif text-2xl mb-2">Ready to transform?</h3>
                  <p className="text-black/40 max-w-xs mx-auto">
                    Upload a photo of your current kitchen and select a style to see the magic happen.
                  </p>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-black/5 border-t-black rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-black animate-pulse" />
                  </div>
                  <h3 className="font-serif text-2xl mb-2">Crafting your vision</h3>
                  <p className="text-black/40 max-w-xs mx-auto">
                    Our AI is analyzing your space and applying the {KITCHEN_STYLES.find(s => s.id === selectedStyle)?.name} aesthetic...
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-serif text-3xl font-bold">Your New Kitchen</h3>
                      <p className="text-black/40 flex items-center gap-2 mt-1">
                        Style: <span className="text-black font-medium">{KITCHEN_STYLES.find(s => s.id === selectedStyle)?.name}</span>
                      </p>
                    </div>
                    <button 
                      onClick={downloadImage}
                      className="p-3 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
                      title="Download Image"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 group">
                    <img 
                      src={result?.imageUrl} 
                      alt="Generated Inspiration" 
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm leading-relaxed">
                        {result?.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="p-6 bg-[#F5F5F0] rounded-2xl">
                      <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-black/40">Design Notes</h4>
                      <p className="text-sm leading-relaxed text-black/70">
                        This transformation focuses on maximizing light and creating a cohesive flow. 
                        The {selectedStyle} elements were chosen to complement your existing layout while providing a significant visual upgrade.
                      </p>
                    </div>
                    <div className="p-6 bg-black text-white rounded-2xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-white/40">Next Steps</h4>
                        <p className="text-sm leading-relaxed text-white/80">
                          Love this design? You can share it with a contractor or use it as a moodboard for your renovation project.
                        </p>
                      </div>
                      <button className="flex items-center gap-2 text-sm font-bold mt-4 hover:gap-3 transition-all">
                        Find local contractors <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-black/5 bg-white mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center">
              <Sparkles className="text-black w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-lg">Kitchen Modernizer</span>
          </div>
          <p className="text-sm text-black/40">
            © 2026 Kitchen Modernizer. Powered by Gemini AI.
          </p>
          <div className="flex gap-6 text-sm font-medium text-black/60">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

