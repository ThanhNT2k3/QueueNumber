
import React, { useState, useEffect } from 'react';
import { useQMS } from '../../stores/QMSContext';
import * as Icons from 'lucide-react';

const TAGS_POSITIVE = ["Friendly Staff", "Fast Service", "Professional", "Clear Advice"];
const TAGS_NEGATIVE = ["Long Wait", "Rude Attitude", "Slow System", "Unclear Info"];

export const FeedbackTerminal: React.FC = () => {
  const { counters, tickets, submitFeedback } = useQMS();
  // Hardcoded to Counter 1 for this demo. In real app, this is config based.
  const counter = counters.find(c => c.id === '1');
  
  // The feedback system targets the LAST served ticket from this counter
  const lastTicketId = counter?.lastServedTicketId;
  const ticket = tickets.find(t => t.id === lastTicketId);

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Check if feedback is already submitted for this ticket
  const isSubmitted = ticket && ticket.feedbackRating !== undefined;
  
  // If the ticket changes (new customer), reset local rating state
  useEffect(() => {
    if (ticket && !ticket.feedbackRating) {
        setRating(0);
        setHoverRating(0);
        setSelectedTags([]);
    }
  }, [ticket?.id]);

  const handleRate = (score: number) => {
    setRating(score);
    // Auto submit rating initially, update with tags later
    if (ticket) {
        submitFeedback(ticket.id, score, "", []);
    }
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    if (ticket && rating > 0) {
        submitFeedback(ticket.id, rating, "", newTags);
    }
  };

  const getEmojiConfig = (score: number) => {
    switch (score) {
        case 1: return { emoji: "😠", text: "Dissatisfied", color: "text-red-500" };
        case 2: return { emoji: "😞", text: "Poor", color: "text-orange-500" };
        case 3: return { emoji: "😐", text: "Neutral", color: "text-yellow-500" };
        case 4: return { emoji: "🙂", text: "Good", color: "text-lime-500" };
        case 5: return { emoji: "🤩", text: "Excellent!", color: "text-green-500" };
        default: return { emoji: "👋", text: "How was it?", color: "text-gray-400" };
    }
  };

  const currentConfig = getEmojiConfig(hoverRating || rating);

  if (!ticket) {
      return (
        <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
             <div className="bg-white p-12 rounded-full shadow-xl mb-8 animate-bounce-slow">
                <Icons.Smile size={80} className="text-brand-500" />
             </div>
             <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to BankNext</h1>
             <p className="text-xl text-gray-500">Please wait for your number.</p>
        </div>
      );
  }

  return (
    <div className="h-full bg-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b p-6 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
           <div className="bg-brand-600 p-2 rounded-lg text-white">
             <Icons.MessageSquare size={24} />
           </div>
           <h1 className="text-xl font-bold text-gray-800">Service Feedback</h1>
        </div>
        <div className="px-4 py-1 bg-gray-100 rounded-full text-sm font-mono text-gray-600">
           Ticket: <span className="font-bold text-brand-600">{ticket.number}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
        {isSubmitted && rating > 0 ? (
            // POST-RATING VIEW (Tags & Thank you)
           <div className="animate-fade-in w-full max-w-3xl flex flex-col items-center">
              
              <div className={`text-6xl mb-4 transition-transform duration-300 transform scale-110`}>
                 {getEmojiConfig(rating).emoji}
              </div>
              <h2 className={`text-4xl font-bold mb-8 ${getEmojiConfig(rating).color}`}>
                {getEmojiConfig(rating).text}
              </h2>

              <div className="bg-gray-50 p-8 rounded-3xl w-full border border-gray-100 shadow-inner mb-8">
                <p className="text-gray-500 mb-6 font-medium uppercase tracking-widest text-sm">What contributed to your experience?</p>
                <div className="flex flex-wrap justify-center gap-4">
                    {(rating >= 4 ? TAGS_POSITIVE : TAGS_NEGATIVE).map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-6 py-3 rounded-xl text-lg font-medium transition-all transform active:scale-95 border-2 ${
                                selectedTags.includes(tag)
                                ? 'bg-brand-600 border-brand-600 text-white shadow-lg scale-105'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
              </div>

              <div className="animate-fade-in-up bg-green-50 text-green-700 px-8 py-4 rounded-2xl flex items-center gap-3">
                <Icons.CheckCircle size={24} />
                <span className="font-bold text-lg">Feedback Sent. Thank you!</span>
              </div>
           </div>
        ) : (
            // RATING VIEW
           <div className="animate-fade-in w-full max-w-3xl">
             <div className="mb-12 min-h-[120px] flex flex-col items-center justify-center transition-all duration-300">
                 <span className="text-8xl mb-4 filter drop-shadow-xl animate-pulse-slow">
                    {currentConfig.emoji}
                 </span>
                 <h2 className={`text-3xl font-bold transition-colors duration-300 ${hoverRating ? currentConfig.color : 'text-gray-800'}`}>
                    {hoverRating ? currentConfig.text : "How was your experience?"}
                 </h2>
             </div>
             
             <div className="flex justify-center gap-4 mb-12" onMouseLeave={() => setHoverRating(0)}>
               {[1, 2, 3, 4, 5].map((star) => (
                 <button
                   key={star}
                   onClick={() => handleRate(star)}
                   onMouseEnter={() => setHoverRating(star)}
                   className="group transition-all duration-200 hover:-translate-y-2 focus:outline-none"
                 >
                   <Icons.Star 
                     size={80} 
                     className={`transition-all duration-200 ${
                        star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-md' 
                        : 'text-gray-200 group-hover:text-yellow-200'
                     }`}
                   />
                 </button>
               ))}
             </div>

             <p className="text-gray-400">Tap a star to rate</p>
           </div>
        )}
      </div>
      
      <div className="p-4 bg-white border-t text-center flex justify-center gap-8 text-gray-300 text-xs">
         <span>Transaction ID: {ticket.id.substring(0,8)}</span>
         <span>Teller: John Doe (ID: 8832)</span>
      </div>
    </div>
  );
};
