import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, RefreshCw, Sparkles, User, Check, X, HelpCircle, Leaf, Info
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

// Simple and safe text parser to render basic Markdown (paragraphs, bullet lists, bold text)
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Unordered list item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const listText = trimmed.substring(2);
          return (
            <ul key={idx} className="list-disc pl-4 text-emerald-900/90 font-light my-1">
              <li>{renderBoldText(listText)}</li>
            </ul>
          );
        }
        
        // Ordered list item
        const orderedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (orderedMatch) {
          const num = orderedMatch[1];
          const listText = orderedMatch[2];
          return (
            <ol key={idx} className="list-decimal pl-4 text-emerald-900/90 font-light my-1">
              <li value={parseInt(num)}>{renderBoldText(listText)}</li>
            </ol>
          );
        }

        // Empty line
        if (trimmed === '') {
          return <div key={idx} className="h-1" />;
        }

        // Standard paragraph
        return <p key={idx} className="font-light">{renderBoldText(line)}</p>;
      })}
    </div>
  );
}

// Inline helper to split text on ** for bolding
function renderBoldText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, index) => {
    // Every odd item in the split is inside the ** bold indicators
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-stone-900">{part}</strong>;
    }
    return part;
  });
}

export default function GoogleChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested starter prompts
  const suggestedQuestions = [
    "How can I revive compacted clay soil in my Milltown lawn?",
    "What services does Jack propose for weed removal?",
    "What is the cost of leaf cleanup and hedge trimming?",
    "How do I request an onsite fixed-price estimate?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    setErrorStatus(null);
    const userMessageId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Map prior messages for context
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Communication error:", err);
      setErrorStatus(err.message || String(err));
      
      // Fallback helpful message that doesn't say "Gemini AI"
      const fallbackMsg: ChatMessage = {
        id: `error-fallback-${Date.now()}`,
        sender: 'bot',
        text: "I apologize, but we are currently experiencing high connection volumes at our horticulture desk. Please try resubmitting your question in a moment, or use our digital **Booking Form** at the top of the page to schedule an direct in-person quote on-site.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleResetChat = () => {
    setMessages([]);
    setErrorStatus(null);
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.25 }}
            className="mb-4 w-96 max-w-[calc(100vw-32px)] h-[540px] bg-white border border-stone-200/90 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header Display */}
            <div className="px-5 py-4 border-b border-stone-150 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-805 shrink-0 shadow-3xs">
                  <Leaf className="w-4 h-4 fill-emerald-100" />
                </div>
                <div className="text-left">
                  <h4 className="font-display font-bold text-xs text-stone-900 uppercase tracking-wider">
                    Anthany (AI Advisor)
                  </h4>
                  <span className="text-[9px] font-mono text-emerald-700 font-medium tracking-wide block">
                    NEW JERSEY HORTICULTURAL COUNSEL
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleResetChat}
                  className="text-stone-605 hover:text-emerald-805 hover:bg-stone-105 border border-stone-200/80 px-2 py-1 rounded-lg font-mono font-bold text-[9px] transition-all cursor-pointer flex items-center gap-1 shadow-3xs uppercase"
                  title="Clear Chat"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> Clear
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-stone-405 hover:text-stone-700 p-1 hover:bg-stone-100 rounded-full"
                  title="Close Advisor"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat message stream container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white text-left">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-4 text-center space-y-4 my-auto pt-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-3xs">
                    <MessageSquare className="w-4 h-4 text-emerald-705" />
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <h5 className="font-display font-bold text-xs text-stone-900 uppercase tracking-wider">Anthany's Direct Advice Line</h5>
                    <p className="text-stone-500 text-[11px] font-light leading-relaxed">
                      Anthany is online and ready to assist you. Ask any question about seasonal lawn restoration, landscaping pricing, lawn aesthetics, or soil prep.
                    </p>
                  </div>

                  {/* Suggestions block */}
                  <div className="max-w-lg w-full space-y-2 pt-2">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Suggested Questions:</span>
                    <div className="grid grid-cols-1 gap-1.5 text-left">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(q)}
                          disabled={isTyping}
                          className="text-left py-1.5 px-3 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200/80 hover:border-emerald-250/50 text-stone-750 hover:text-emerald-950 text-[10px] transition-all cursor-pointer font-light leading-snug shadow-3xs"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isBot = msg.sender === 'bot';
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-2.5 max-w-[90%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                      >
                        {/* Avatar icon */}
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 shadow-3xs ${
                          isBot 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-805' 
                            : 'bg-stone-50 border-stone-200 text-stone-605'
                        }`}>
                          {isBot ? <Leaf className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>

                        {/* Content block */}
                        <div className="space-y-0.5">
                          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                            isBot 
                              ? 'bg-emerald-50/40 border-emerald-100 text-stone-850 rounded-tl-none font-sans text-left' 
                              : 'bg-stone-900 border-stone-900 text-white rounded-tr-none font-mono text-[11px] text-left shadow-xs'
                          }`}>
                            {isBot ? (
                              <RenderMarkdown text={msg.text} />
                            ) : (
                              <p className="font-light leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            )}
                          </div>
                          <div className={`text-[8px] font-mono text-stone-400 font-light flex items-center gap-1.5 ${isBot ? 'justify-start pl-1' : 'justify-end pr-1'}`}>
                            <span className="font-bold text-stone-500 uppercase">{isBot ? "Anthany" : "You"}</span>
                            <span>•</span>
                            <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}

              {/* Bot typing state indicator */}
              {isTyping && (
                <div className="flex gap-2.5 max-w-[90%] mr-auto text-left">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-805 flex items-center justify-center shrink-0 animate-pulse">
                    <Leaf className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl rounded-tl-none flex items-center gap-1 w-14 h-8">
                      <span className="w-1 h-1 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {errorStatus && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-[9px] text-red-750 font-semibold max-w-sm mx-auto">
                  <Info className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <span className="font-bold uppercase tracking-wider">Notice</span>
                    <p className="font-light leading-normal">{errorStatus}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <form onSubmit={handleFormSubmit} className="p-3 border-t border-stone-150 bg-stone-50/50">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder={isTyping ? "Anthany is typing..." : "Ask about grass restoration, hedge trimming..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                  className="bg-white border border-stone-300 rounded-xl py-2 px-3 text-[11px] text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-650 focus:ring-1 focus:ring-emerald-600 flex-1 min-w-0 font-light font-sans shadow-3xs"
                />
                
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    inputValue.trim() && !isTyping
                      ? 'bg-black text-white hover:bg-stone-900 shadow-md' 
                      : 'bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Circle Button with Message Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-black hover:bg-zinc-900 border border-stone-800 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
        title="Chat with Anthany"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
