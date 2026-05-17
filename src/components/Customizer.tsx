import React from 'react';
import { MouseCustomization } from '../types';
import { motion } from 'motion/react';
import { Check, Palette } from 'lucide-react';

interface CustomizerProps {
  customization: MouseCustomization;
  onChange: (customization: MouseCustomization) => void;
  onSave: () => void;
}

const COLORS = {
  body: ['#a8a29e', '#737373', '#d4d4d4', '#404040', '#78350f', '#065f46'],
  ear: ['#a8a29e', '#fbcfe8', '#f9a8d4', '#be185d', '#737373', '#404040'],
  nose: ['#f472b6', '#db2777', '#000000', '#dc2626', '#f59e0b', '#7c2d12'],
};

export const Customizer: React.FC<CustomizerProps> = ({ customization, onChange, onSave }) => {
  const updateColor = (key: keyof MouseCustomization, color: string) => {
    onChange({ ...customization, [key]: color });
  };

  return (
    <div className="bg-[#e8e8df] p-8 rounded-3xl border border-[#b3a492] shadow-xl w-full max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#5a5a40] p-2 rounded-lg">
          <Palette className="w-6 h-6 text-[#f5f5f0]" />
        </div>
        <h2 className="text-3xl font-bold italic text-[#5a5a40]">Mouse Tailor</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Preview */}
        <div className="flex flex-col items-center justify-center bg-[#f5f5f0] rounded-2xl p-12 border border-[#b3a492]/30 shadow-inner min-h-[300px]">
          <div className="relative transform scale-[2.5]">
            {/* Body */}
            <div 
              className="w-10 h-8 rounded-full transition-colors duration-300"
              style={{ backgroundColor: customization.bodyColor }}
            />
            {/* Ears */}
            <div 
              className="absolute -top-2 -left-1 w-5 h-5 rounded-full border-2 transition-colors duration-300"
              style={{ backgroundColor: customization.bodyColor, borderColor: customization.earColor }}
            />
            <div 
              className="absolute -top-2 -right-1 w-5 h-5 rounded-full border-2 transition-colors duration-300"
              style={{ backgroundColor: customization.bodyColor, borderColor: customization.earColor }}
            />
            {/* Eye */}
            <div className="absolute top-2 right-2 w-1 h-1 bg-black rounded-full" />
            {/* Nose */}
            <div 
              className="absolute top-3 -right-1 w-2 h-2 rounded-full transition-colors duration-300"
              style={{ backgroundColor: customization.noseColor }}
            />
            {/* Tail */}
            <div className="absolute top-4 -left-4 w-6 h-1 bg-stone-300 rounded-full origin-right -rotate-12 transition-colors duration-300" />
          </div>
          <p className="mt-16 text-[10px] uppercase tracking-widest text-[#5a5a40]/60 font-bold">Your Custom Scurrier</p>
        </div>

        {/* Options */}
        <div className="space-y-8">
          <section>
            <label className="block text-[10px] uppercase tracking-widest text-[#5a5a40] font-bold mb-3">Coat Color</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.body.map(color => (
                <button
                  key={color}
                  onClick={() => updateColor('bodyColor', color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 flex items-center justify-center ${customization.bodyColor === color ? 'border-[#5a5a40] ring-4 ring-[#5a5a40]/10' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                >
                  {customization.bodyColor === color && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-[#5a5a40] font-bold mb-3">Ear Highlight</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.ear.map(color => (
                <button
                  key={color}
                  onClick={() => updateColor('earColor', color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 flex items-center justify-center ${customization.earColor === color ? 'border-[#5a5a40] ring-4 ring-[#5a5a40]/10' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                >
                  {customization.earColor === color && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-[10px] uppercase tracking-widest text-[#5a5a40] font-bold mb-3">Snout Color</label>
            <div className="flex flex-wrap gap-3">
              {COLORS.nose.map(color => (
                <button
                  key={color}
                  onClick={() => updateColor('noseColor', color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 flex items-center justify-center ${customization.noseColor === color ? 'border-[#5a5a40] ring-4 ring-[#5a5a40]/10' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                >
                  {customization.noseColor === color && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={onSave}
            className="w-full bg-[#5a5a40] text-[#f5f5f0] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#4a4a35] transition-all shadow-lg mt-8"
          >
            Confirm Appearance
          </button>
        </div>
      </div>
    </div>
  );
};
