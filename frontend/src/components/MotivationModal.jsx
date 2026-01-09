import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';

const motivationalQuotes = [
  {
    id: 1,
    text: "A vision without execution is just a dream.",
    icon: "💡"
  },
  {
    id: 2,
    text: "Always deliver more than what's expected.",
    icon: "⚡"
  },
  {
    id: 3,
    text: "Don't focus on the competition; focus on the customer.",
    icon: "🎯"
  },
  {
    id: 4,
    text: "What do you need to start a business? Know your product, understand your customer, and have an unstoppable drive to succeed.",
    icon: "🚀"
  },
  {
    id: 5,
    text: "Your greatest asset as an entrepreneur is your mind. Train it well.",
    icon: "🧠"
  }
];

export default function MotivationModal({ isOpen, onClose }) {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentQuote(Math.floor(Math.random() * motivationalQuotes.length));
    }
  }, [isOpen]);

  const handleNext = () => {
    setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
  };

  const handlePrev = () => {
    setCurrentQuote((prev) => (prev - 1 + motivationalQuotes.length) % motivationalQuotes.length);
  };

  const quote = motivationalQuotes[currentQuote];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
        <div className="p-6 text-center">
          <div className="text-6xl mb-6">{quote.icon}</div>
          <p className="text-2xl font-bold leading-relaxed mb-8">
            {quote.text}
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            {motivationalQuotes.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentQuote ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handlePrev}
              variant="outline"
              className="bg-white/20 border-white text-white hover:bg-white/30"
            >
              ← Previous
            </Button>
            <Button
              onClick={handleNext}
              variant="outline"
              className="bg-white/20 border-white text-white hover:bg-white/30"
            >
              Next →
            </Button>
          </div>

          <Button
            onClick={onClose}
            className="w-full mt-4 bg-white text-orange-500 hover:bg-white/90 font-semibold"
          >
            Let's Get Started! 🎯
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
