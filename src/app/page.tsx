'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const categories = [
  { id: 'summary', title: 'Summary' },
  { id: 'experience', title: 'Experience' },
  { id: 'projects', title: 'Projects' },
  { id: 'skills', title: 'Skills' },
  { id: 'education', title: 'Education' },
  { id: 'achievements', title: 'Achievements' }
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showGoToTop, setShowGoToTop] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // Animation sequence states
  const [isAnimating, setIsAnimating] = useState(false);
  const [titleVisible, setTitleVisible] = useState(true);
  const [chatAtBottom, setChatAtBottom] = useState(false);
  const [messagesVisible, setMessagesVisible] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aboutMeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Show go to top button when scrolled down
      setShowGoToTop(currentScrollY > window.innerHeight / 2);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isAnimating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    // Start animation sequence
    setIsAnimating(true);
    setInput('');
    
    // Step 1: Fade out title
    setTitleVisible(false);
    
    // Step 2: After title fade, drop chat to bottom
    setTimeout(() => {
      setChatAtBottom(true);
      setShowChat(true);
    }, 800); // Wait for title fade animation
    
    // Step 3: After chat drops, show messages and start API call
    setTimeout(() => {
      setMessages(prev => [...prev, userMessage]);
      setMessagesVisible(true);
      setIsLoading(true);
      setIsAnimating(false);
    }, 1600); // Wait for title fade + chat drop animations

    // Wait for the animation sequence to complete before starting API call
    setTimeout(async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          }),
        });

      if (!response.ok) throw new Error('Failed to fetch');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      };

      setMessages(prev => [...prev, assistantMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: msg.content + parsed.content }
                      : msg
                  ));
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }]);
      } finally {
        setIsLoading(false);
      }
    }, 1600); // Wait for animation sequence to complete
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowChat(false);
    setMessages([]);
    // Reset animation states
    setTitleVisible(true);
    setChatAtBottom(false);
    setMessagesVisible(false);
    setIsAnimating(false);
  };

  const titleOpacity = !titleVisible ? 0 : (showChat ? Math.max(0, 1 - scrollY / 300) : 1);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-light text-gray-300 mb-2">Hello, I&apos;m</h1>
          <h2 className="text-6xl md:text-8xl font-bold text-white ml-8">TONY LE</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <nav className="flex justify-center space-x-8 py-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToSection(category.id)}
              className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
            >
              {category.title}
            </button>
          ))}
        </nav>
      </header>

      {/* Homepage Title and Chat */}
      <div className={`min-h-screen flex flex-col items-center px-8 transition-all duration-800 ease-in-out ${
        chatAtBottom ? 'justify-start pt-24' : 'justify-center'
      }`}>
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ 
            opacity: titleOpacity,
            y: !titleVisible ? -50 : 0
          }}
          transition={{ 
            opacity: { duration: 0.8, ease: "easeInOut" },
            y: { duration: 0.8, ease: "easeInOut" }
          }}
          className="text-center mb-8"
        >
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: titleOpacity 
            }}
            transition={{ 
              delay: 0.2,
              opacity: { duration: 0.8, ease: "easeInOut" }
            }}
            className="text-4xl md:text-6xl font-light text-gray-300 mb-2"
          >
            Hello, I&apos;m
          </motion.h1>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: titleOpacity 
            }}
            transition={{ 
              delay: 0.4,
              opacity: { duration: 0.8, ease: "easeInOut" }
            }}
            className="text-6xl md:text-8xl font-bold text-white ml-8"
          >
            TONY LE
          </motion.h2>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          className={`w-full max-w-4xl ${chatAtBottom ? 'fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40' : ''}`}
          initial={false}
          animate={{
            y: chatAtBottom ? 0 : 0
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            delay: titleVisible ? 0 : 0.2
          }}
        >
          {/* Chat Messages */}
          <AnimatePresence>
            {showChat && messages.length > 0 && messagesVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-6 max-h-96 overflow-y-auto space-y-4 px-4"
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 ml-auto w-[min-content]'
                        : 'mr-auto'
                    }`}
                  >
                    <p className="text-white whitespace-pre-wrap">{message.content}</p>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-700 p-4 rounded-2xl mr-auto max-w-xs"
                  >
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors duration-200"
            >
              <Send size={20} />
            </button>
          </form>
        </motion.div>
      </div>

      {/* About Me Container */}
      <div 
        className="relative z-10"
      >
        <motion.div
          ref={aboutMeRef}
          className="bg-slate-800 text-white min-h-screen pt-24 pb-24"
        >
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-center mb-12">About Me</h2>
          
          {/* Summary Section */}
          <section id="summary" className="mb-16">
            <h3 className="text-2xl font-semibold mb-6">Summary</h3>
            <div className="bg-slate-700 p-6 rounded-lg">
              <p className="text-lg leading-relaxed">
                AI Engineer with 3+ years of production AI development experience, serving 4,000+ monthly active users. 
                Early enterprise OpenAI API adopter (August 2023) with expertise in agent-to-agent communication, 
                MCP protocol implementation, and full-stack AI applications. Specialized in building scalable AI copilots, 
                real-time voice systems, and custom agent architectures for enterprise environments.
              </p>
            </div>
          </section>

          {/* Experience Section */}
          <section id="experience" className="mb-16">
            <h3 className="text-2xl font-semibold mb-6">Professional Experience</h3>
            <div className="space-y-8">
              <div className="bg-slate-700 p-6 rounded-lg">
                <h4 className="text-xl font-semibold mb-2">Software Engineer</h4>
                <p className="text-blue-400 mb-2">T-Mobile | May 2024 – Present | Bellevue, WA</p>
                <ul className="space-y-2 text-gray-200">
                  <li>• Production AI Systems: Architect and maintain AI copilot serving 4,000+ unique monthly users</li>
                  <li>• MCP Innovation: First engineer in organization to implement Model Context Protocol (MCP)</li>
                  <li>• Advanced AI Architecture: Built custom agent-to-agent communication systems</li>
                  <li>• Enterprise Integration: Developed actionable AI tools including automated ticket creation</li>
                </ul>
              </div>
              
              <div className="bg-slate-700 p-6 rounded-lg">
                <h4 className="text-xl font-semibold mb-2">Associate Software Engineer</h4>
                <p className="text-blue-400 mb-2">T-Mobile | August 2022 – May 2024 | Bellevue, WA</p>
                <ul className="space-y-2 text-gray-200">
                  <li>• AI Pioneer: First to develop enterprise OpenAI API integration (August 2023)</li>
                  <li>• Full-Stack Development: Led frontend development of AI troubleshooting interface</li>
                  <li>• RAG Implementation: Designed and implemented Retrieval-Augmented Generation</li>
                  <li>• Early Promotion: Promoted 1 year ahead of standard timeline</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section id="projects" className="mb-16">
            <h3 className="text-2xl font-semibold mb-6">Featured Projects</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-700 p-6 rounded-lg">
                <h4 className="text-xl font-semibold mb-2">AI Receptionist System</h4>
                <p className="text-gray-300 mb-3">October 2024 – Present</p>
                <p className="text-gray-200">
                  Developed intelligent voice-activated receptionist with real-time speech processing and 
                  natural language understanding using Node.js, Twilio, Google Cloud Speech, and Gemini API.
                </p>
              </div>
              
              <div className="bg-slate-700 p-6 rounded-lg">
                <h4 className="text-xl font-semibold mb-2">Medical AI Analysis Platform</h4>
                <p className="text-gray-300 mb-3">August 2024 – Present</p>
                <p className="text-gray-200">
                  Created AI system for automated bloodwork analysis, parsing medical documents and 
                  generating structured health insights with Python and AI/ML APIs.
                </p>
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section id="skills" className="mb-16">
            <h3 className="text-2xl font-semibold mb-6">Technical Skills</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-700 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">AI/ML Technologies</h4>
                <p className="text-gray-200">OpenAI API, Azure OpenAI, Google Gemini, RAG Implementation, Vector Search, Agent Communication, MCP Protocol</p>
              </div>
              <div className="bg-slate-700 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">Programming Languages</h4>
                <p className="text-gray-200">Python, JavaScript, Node.js, Java, SQL, HTML, CSS</p>
              </div>
              <div className="bg-slate-700 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">Frameworks & Libraries</h4>
                <p className="text-gray-200">React, Streamlit, Express, jQuery, Twilio API, Google Cloud Speech</p>
              </div>
            </div>
          </section>

          {/* Education Section */}
          <section id="education" className="mb-16">
            <h3 className="text-2xl font-semibold mb-6">Education</h3>
            <div className="bg-slate-700 p-6 rounded-lg">
              <h4 className="text-xl font-semibold mb-2">Bachelor of Science in Computer Science & Systems</h4>
              <p className="text-blue-400 mb-2">University of Washington Tacoma | Graduated June 2022</p>
              <p className="text-gray-200">
                Relevant Coursework: Algorithms, Artificial Intelligence, Advanced Software Engineering, 
                Matrix Algebra, Data Structures, Computer Architecture, Probability & Statistics, Machine Learning Fundamentals
              </p>
            </div>
          </section>

          {/* Achievements Section */}
          <section id="achievements" className="mb-16">
            <h3 className="text-2xl font-semibold mb-6">Key Achievements</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-700 p-6 rounded-lg">
                <ul className="space-y-3 text-gray-200">
                  <li>• Production Scale: 4,000+ monthly active users on AI systems</li>
                  <li>• Innovation Leadership: First in organization to implement MCP protocol</li>
                  <li>• Early Adoption: Enterprise AI developer since August 2023</li>
                </ul>
              </div>
              <div className="bg-slate-700 p-6 rounded-lg">
                <ul className="space-y-3 text-gray-200">
                  <li>• Career Acceleration: Promoted 1 year early due to AI copilot success</li>
                  <li>• Cross-Functional Impact: Delivered AI solutions across multiple divisions</li>
                  <li>• Technical Innovation: Pioneered agent-to-agent communication and dynamic UI generation</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
        </motion.div>
      </div>

      {/* Go to Top Button */}
      <AnimatePresence>
        {showGoToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors duration-200"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
