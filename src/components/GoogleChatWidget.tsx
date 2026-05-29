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
    "How can I revive compacted clay soil in my Oregon lawn?",
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

  return (
    <section id="google-chat-section" className="bg-white border-t border-stone-150 py-16 text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.03] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/[0.03] rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-805 text-[10px] font-mono uppercase tracking-wider font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            Direct Support Line
          </div>
          <h2 className="text-3xl font-display font-black text-stone-900 tracking-tight uppercase">
            Consult with Anthany
          </h2>
          <p className="text-stone-600 text-xs font-light max-w-xl leading-relaxed">
            Consult Anthany, our dedicated local horticulture advisor, instantly. Ask questions about grass restoration, local soil biology, organic root food, or inquire about pricing estimates before booking with Jack's team.
          </p>
        </div>

        {/* Outer Chat Frame */}
        <div className="max-w-4xl mx-auto bg-stone-50 border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
          
          {/* CHAT CORE DIALOG LAYER */}
          <div className="flex flex-col justify-between bg-white h-[530px]">
            
            {/* Header Display */}
            <div className="px-6 py-4 border-b border-stone-150 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-805 shrink-0 shadow-3xs">
                  <Leaf className="w-4 h-4 fill-emerald-100" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-stone-900 uppercase tracking-wider">
                    Anthany (Horticulture Specialist)
                  </h4>
                  <span className="text-[9px] font-mono text-emerald-700 font-medium tracking-wide">
                    OREGON HORTICULTURAL COUNSEL
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleResetChat}
                  className="text-stone-605 hover:text-emerald-805 hover:bg-stone-105 border border-stone-200/80 px-2.5 py-1.5 rounded-xl font-mono font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-3xs uppercase"
                  title="Restart Conversation"
                >
                  <RefreshCw className="w-3 h-3" /> Clear Chat
                </button>
                <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-150/40 px-2 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-850 font-bold uppercase">Online</span>
                </div>
              </div>
            </div>

            {/* Chat message stream container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6 my-auto pt-10">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 shadow-3xs">
                    <MessageSquare className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <h5 className="font-display font-bold text-xs text-stone-900 uppercase tracking-wider">Anthany's Direct Advice Line</h5>
                    <p className="text-stone-500 text-[11px] font-light leading-relaxed">
                      Anthany is online and ready to assist you. Ask any question about seasonal lawn restoration, landscaping pricing, lawn aesthetics, or soil prep.
                    </p>
                  </div>

                  {/* Suggestions block */}
                  <div className="max-w-lg w-full space-y-2.5 pt-2">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Suggested Questions:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(q)}
                          disabled={isTyping}
                          className="text-left py-2 px-3 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200/80 hover:border-emerald-250/50 text-stone-700 hover:text-emerald-950 text-[11px] transition-all cursor-pointer font-light leading-snug shadow-3xs"
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
                        className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
                      >
                        {/* Avatar icon */}
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-3xs ${
                          isBot 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-805' 
                            : 'bg-stone-50 border-stone-200 text-stone-605'
                        }`}>
                          {isBot ? <Leaf className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>

                        {/* Content block */}
                        <div className="space-y-1">
                          <div className={`p-4.5 rounded-2xl border ${
                            isBot 
                              ? 'bg-emerald-50/40 border-emerald-100 text-stone-850 rounded-tl-none font-sans' 
                              : 'bg-black border-black text-white rounded-tr-none font-mono text-xs text-left shadow-xs'
                          }`}>
                            {isBot ? (
                              <RenderMarkdown text={msg.text} />
                            ) : (
                              <p className="font-light leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            )}
                          </div>
                          <div className={`text-[9px] font-mono text-stone-400 font-light flex items-center gap-1.5 ${isBot ? 'justify-start pl-1' : 'justify-end pr-1'}`}>
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
                <div className="flex gap-3 max-w-[85%] mr-auto text-left">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-805 flex items-center justify-center shrink-0 animate-pulse">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl rounded-tl-none flex items-center gap-1 w-16 h-10">
                      <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {errorStatus && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-[10px] text-red-700 font-semibold max-w-sm mx-auto">
                  <Info className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold uppercase tracking-wider">Communication Notice</span>
                    <p className="font-light leading-normal">{errorStatus}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Footer */}
            <form onSubmit={handleFormSubmit} className="p-4 border-t border-stone-150 bg-stone-50/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isTyping ? "Anthany is typing..." : "Ask Anthany about lawn restoring, compost depth, hedge trimming..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                  className="bg-white border border-stone-300 rounded-xl py-3 px-4 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-650 focus:ring-1 focus:ring-emerald-600 flex-1 min-w-0 font-light font-sans shadow-3xs"
                />
                
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    inputValue.trim() && !isTyping
                      ? 'bg-black text-white hover:bg-stone-900 shadow-md transform hover:scale-[1.02]' 
                      : 'bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </section>
  );
}
