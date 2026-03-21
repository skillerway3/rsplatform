'use client';

import React from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Image as ImageIcon, X } from 'lucide-react';

interface SellStepDetailsProps {
  formData: {
    title: string;
    description: string;
    images: string[];
  };
  updateFormData: (data: Partial<SellStepDetailsProps['formData']>) => void;
}

export function SellStepDetails({ formData, updateFormData }: SellStepDetailsProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateFormData({ images: [...formData.images, base64String] });
      };
      reader.readAsDataURL(file);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    updateFormData({ images: formData.images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold border border-amber-500/20">3</span>
          Listing Details
        </h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Listing Title</label>
            <Input
              placeholder="e.g. 100M OSRS Gold - Instant Delivery"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              className="bg-zinc-900/50 border-zinc-800 focus:border-amber-500 transition-colors h-14 text-lg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Description</label>
            <textarea
              placeholder="Describe what you are selling in detail..."
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 min-h-[150px] focus:outline-none focus:border-amber-500 transition-colors text-zinc-300"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold border border-amber-500/20">4</span>
          Media
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.images.map((image, index) => (
            <div key={index} className="aspect-square relative rounded-xl overflow-hidden group border border-zinc-800">
              <Image src={image} alt="Upload" fill className="object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {formData.images.length < 4 && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                onClick={triggerFileInput}
                className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-amber-500"
              >
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs font-medium uppercase tracking-widest">Add Image</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
