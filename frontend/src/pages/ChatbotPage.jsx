import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';
import { translations } from '../utils/translations';

export default function ChatbotPage({ lang }) {
  const t = translations[lang] || translations.en;
  const [messages, setMessages] = useState([
    { sender: 'bot', text: lang === 'ta' ? 'வணக்கம்! நான் உழவர் ஆலோசகர் AI. விவசாயம், பயிர்கள், உரங்கள் மற்றும் நோய்கள் பற்றி என்னிடம் கேளுங்கள்.' : 'Hello! I am your AI Farmer Advisor. Ask me anything about crop cultivation, fertilizers, irrigation, or plant diseases.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTtsActive, setIsTtsActive] = useState(true);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Set up Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === 'ta' ? 'ta-IN' : 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(null, transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
      recognitionRef.current.start();
    }
  };

  const speakText = (text) => {
    if (!isTtsActive || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e, directText = null) => {
    if (e) e.preventDefault();
    const query = directText || input;
    if (!query.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { sender: 'user', text: query }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Build history for API (last 6 messages)
      const historyFormatted = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })).slice(-6);

      const response = await api.getChatResponse(query, historyFormatted, lang);
      
      setMessages(prev => [...prev, { sender: 'bot', text: response.reply }]);
      
      // Speak response aloud
      speakText(response.reply);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: lang === 'ta' ? 'மன்னிக்கவும், சேவையகத்துடன் இணைப்பதில் பிழை ஏற்பட்டது.' : 'Sorry, could not connect to the backend server. Please verify it is running.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    window.speechSynthesis?.cancel();
    setMessages([
      { sender: 'bot', text: lang === 'ta' ? 'வணக்கம்! நான் உழவர் ஆலோசகர் AI. விவசாயம், பயிர்கள், உரங்கள் மற்றும் நோய்கள் பற்றி என்னிடம் கேளுங்கள்.' : 'Hello! I am your AI Farmer Advisor. Ask me anything about crop cultivation, fertilizers, irrigation, or plant diseases.' }
    ]);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>{t.chatTitle}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isListening ? t.voiceActive : t.voiceInactive}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* TTS Toggle Button */}
          <button 
            onClick={() => {
              setIsTtsActive(!isTtsActive);
              if (isTtsActive) window.speechSynthesis?.cancel();
            }} 
            className="btn btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
            title={isTtsActive ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}
          >
            {isTtsActive ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          {/* Reset Button */}
          <button 
            onClick={resetChat} 
            className="btn btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
            title="Reset Chat"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="glass-card chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat Messages */}
        <div className="chat-history">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`chat-message ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="chat-message message-bot" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite' }}></span>
              <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite', animationDelay: '0.2s' }}></span>
              <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite', animationDelay: '0.4s' }}></span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => handleSend(e)} className="chat-input-area">
          <button
            type="button"
            className={`mic-btn ${isListening ? 'active' : ''}`}
            onClick={toggleListening}
            title={isListening ? "Stop listening" : "Start Voice Input"}
          >
            {isListening ? <Mic size={22} /> : <MicOff size={22} />}
          </button>

          <input
            type="text"
            className="form-input"
            style={{ flex: 1, border: '1px solid var(--border-color)' }}
            placeholder={t.chatPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)' }}
            disabled={loading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
