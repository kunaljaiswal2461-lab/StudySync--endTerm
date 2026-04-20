import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Users, Clock, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { completeOnboarding } from '../services/authService';

const OnboardingModal = ({ userId, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding(userId);
      onComplete(); // update local state so it doesn't show again immediately
      onClose();
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="card max-w-lg w-full bg-slate-900 border border-white/10  overflow-hidden relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
          <div 
            className="h-full bg-active transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <div className="p-8 sm:p-10 min-h-[350px] flex flex-col justify-center relative">
          
          {/* Step 1: Welcome */}
          <div className={`transition-all duration-500 absolute inset-0 p-8 sm:p-10 flex flex-col items-center text-center justify-center ${step === 1 ? 'opacity-100 translate-x-0 relative' : 'opacity-0 translate-x-8 pointer-events-none absolute'}`}>
            <div className="w-20 h-20 bg-active/20 rounded-full flex items-center justify-center mb-6 border border-active/30 text-active ">
              <BookOpen size={40} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Welcome to <span className="text-active">StudySync</span></h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              The ultimate collaborative platform designed to help you and your squad achieve deep, synchronized focus.
            </p>
          </div>

          {/* Step 2: Rooms */}
          <div className={`transition-all duration-500 absolute inset-0 p-8 sm:p-10 flex flex-col items-center text-center justify-center ${step === 2 ? 'opacity-100 translate-x-0 relative' : step < 2 ? 'opacity-0 translate-x-8 pointer-events-none absolute' : 'opacity-0 -translate-x-8 pointer-events-none absolute'}`}>
            <div className="w-20 h-20 bg-focus/20 rounded-full flex items-center justify-center mb-6 border border-focus/30 text-focus ">
              <Users size={40} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Create or Join</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              Launch a public room in the <span className="text-white font-bold">Active Pulse</span> feed, or share a private <span className="text-white font-bold font-mono">6-CHAR CODE</span> with your friends.
            </p>
            <div className="flex gap-2 items-center justify-center bg-slate-950 px-4 py-2 rounded-xl border border-white/5">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-black">Example Code:</span>
              <span className="text-sm text-focus font-mono font-bold tracking-widest">X9K2PL</span>
            </div>
          </div>

          {/* Step 3: Focusing */}
          <div className={`transition-all duration-500 absolute inset-0 p-8 sm:p-10 flex flex-col items-center text-center justify-center ${step === 3 ? 'opacity-100 translate-x-0 relative' : 'opacity-0 -translate-x-8 pointer-events-none absolute'}`}>
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 border border-amber-500/30 text-amber-500 ">
              <Clock size={40} />
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Start Focusing</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              The <span className="text-white font-bold">Session Commander</span> controls the shared Pomodoro timer. Stay present! Your <span className="text-white font-bold">Focus Minutes</span> are synced directly to your dashboard every 60 seconds.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/50 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-1">
             {[1, 2, 3].map(i => (
               <div key={i} className={`w-2 h-2 rounded-full transition-all ${step === i ? 'bg-active w-6' : 'bg-slate-700'}`}></div>
             ))}
          </div>

          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            
            {step < 3 ? (
              <button 
                onClick={nextStep}
                className="btn-primary"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleComplete}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Syncing...' : 'Let\'s Go'} <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default OnboardingModal;
