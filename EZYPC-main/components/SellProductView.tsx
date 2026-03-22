import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassSurface from './GlassSurface';

interface SellProductPageProps {
  onBack: () => void;
}

const SellProductPage: React.FC<SellProductPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    contact: '',
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    
    try {
        const botToken = '8693050331:AAF3t0RfSb8Y2eOO6ZVz5dnIWlHl3S0iU1M';
        const chatId = '7154626182';
        
        const caption = `🚀 NEW EZYPC SELL REQUEST:%0AProduct: ${formData.name}%0APrice: ₹${formData.price}%0ADetails: ${formData.description}%0AContact: ${formData.contact}`;

        if (selectedFile) {
            const formDataPhoto = new FormData();
            formDataPhoto.append('chat_id', chatId);
            formDataPhoto.append('caption', decodeURIComponent(caption));
            formDataPhoto.append('photo', selectedFile);

            await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: 'POST',
                body: formDataPhoto
            });
        } else {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${caption}`);
        }

        setStatus('sent');
    } catch (error) {
        console.error('Telegram automation failed:', error);
        const wsMsg = `EZYPC SELL REQUEST:%0AProduct: ${formData.name}%0APrice: ₹${formData.price}%0ADetails: ${formData.description}%0AContact: ${formData.contact}`;
        window.open(`https://wa.me/917025053379?text=${wsMsg}`, '_blank');
        setStatus('sent');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', description: '', price: '', contact: '' });
    setPreview(null);
    setSelectedFile(null);
    setStatus('idle');
  };

  if (status === 'sent') {
    return (
        <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-8">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-8 mx-auto">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter">Listing Received</h1>
                <p className="text-on-surface-secondary mb-12 max-w-md">Our team has received your part details and will contact you shortly.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                    <button onClick={handleReset} className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black tracking-widest uppercase">Sell Another Product</button>
                    <button onClick={onBack} className="px-10 py-5 border border-black/10 dark:border-white/10 text-on-surface dark:text-dark-on-surface text-[10px] font-black tracking-widest uppercase">Back to Store</button>
                </div>
            </motion.div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-24 px-6 md:px-0">
      <div className="mb-16">
        <button onClick={onBack} className="flex items-center gap-4 group">
            <div className="w-8 h-[1px] bg-black/20 dark:bg-white/20 group-hover:w-12 group-hover:bg-black dark:group-hover:bg-white transition-all" />
            <span className="text-[10px] font-black tracking-[0.3em] text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white uppercase transition-colors" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Return</span>
        </button>
      </div>

      <div className="mb-20">
        <span className="text-[10px] font-black tracking-[0.5em] text-black/40 dark:text-white/40 uppercase mb-4 block" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Marketplace</span>
        <h1 className="text-6xl font-black tracking-tighter text-on-surface dark:text-dark-on-surface uppercase leading-none mb-6" style={{ fontFamily: '"Host Grotesk", sans-serif' }}>Sell your Product.</h1>
        <p className="text-lg text-on-surface-secondary max-w-xl">List your high-performance components on our curated used parts marketplace.</p>
      </div>

      <GlassSurface width="100%" height="auto" borderRadius={20} backgroundOpacity={0.03} className="p-12 border border-black/10 dark:border-white/10">
        <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase">Product Name</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xl font-bold focus:outline-none focus:border-black dark:focus:border-white transition-colors text-on-surface dark:text-dark-on-surface"
                            placeholder="e.g. NVIDIA RTX 4080"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase">Your Contact (WhatsApp/Tele)</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xl font-bold focus:outline-none focus:border-black dark:focus:border-white transition-colors text-on-surface dark:text-dark-on-surface"
                            placeholder="+91 or @username"
                            value={formData.contact}
                            onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase">Description & Condition</label>
                    <textarea 
                        required 
                        rows={4}
                        className="w-full bg-transparent border border-black/10 dark:border-white/10 p-4 text-sm font-medium focus:outline-none focus:border-black dark:focus:border-white transition-colors text-on-surface dark:text-dark-on-surface"
                        placeholder="Describe the usage, age, and condition..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase">Asking Price (INR)</label>
                        <input 
                            type="number" 
                            required 
                            className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-4 text-xl font-bold focus:outline-none focus:border-black dark:focus:border-white transition-colors text-on-surface dark:text-dark-on-surface"
                            placeholder="₹ 0"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-black/40 dark:text-white/40 uppercase">Image Upload</label>
                        <div className="relative w-full h-32 border-2 border-dashed border-black/10 dark:border-white/10 flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden group">
                           {preview ? (
                               <img src={preview} alt="Upload preview" className="absolute inset-0 w-full h-full object-cover opacity-100 group-hover:opacity-40 transition-opacity" />
                           ) : (
                               <div className="text-[10px] font-black tracking-widest text-black/20 dark:text-white/20 uppercase pointer-events-none">Click to upload</div>
                           )}
                           <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                           />
                        </div>
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={status === 'sending'}
                className="w-full py-6 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black tracking-widest uppercase hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
                {status === 'sending' ? 'Sending Listing...' : 'Submit Listing for Review'}
            </button>
        </form>
      </GlassSurface>
    </div>
  );
};

export default SellProductPage;
