'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ArrowUp, MessageSquare, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showGoToTop, setShowGoToTop] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [showMiniHeader, setShowMiniHeader] = useState(false);
  const [isMiniHeaderExpanded, setIsMiniHeaderExpanded] = useState(true);
  
  // Animation sequence states
  const [isAnimating, setIsAnimating] = useState(false);
  const [titleVisible, setTitleVisible] = useState(true);
  const [chatAtBottom, setChatAtBottom] = useState(false);
  const [messagesVisible, setMessagesVisible] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aboutMeRef = useRef<HTMLDivElement>(null);
  const miniMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    // Check authentication status on mount
    checkAuthStatus();
  }, []);

  // Check if user is already authenticated
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setAuthCheckComplete(true);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isAuthenticating) return;

    setIsAuthenticating(true);
    setAuthError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
        setAuthError('');
      } else {
        setAuthError(data.error || 'Authentication failed');
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Connection error. Please try again.');
      setPassword('');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'DELETE',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setMessages([]);
      setShowChat(false);
      setTitleVisible(true);
      setChatAtBottom(false);
      setMessagesVisible(false);
      setIsAnimating(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Show go to top button when scrolled down
      setShowGoToTop(currentScrollY > window.innerHeight / 2);
      
      // Show mini header when scrolled down and there are messages
      setShowMiniHeader(currentScrollY > window.innerHeight / 2 && messages.length > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  useEffect(() => {
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll mini messages to bottom when messages update and mini header is visible
  useEffect(() => {
    if (showMiniHeader && isMiniHeaderExpanded && miniMessagesEndRef.current) {
      miniMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showMiniHeader, isMiniHeaderExpanded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isAnimating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    const isFirstMessage = messages.length === 0;
    setInput('');

    if (isFirstMessage) {
      // First message - run the animation sequence
      setIsAnimating(true);
      
      // Step 1: Fade out title
      setTitleVisible(false);
      
      // Step 2: After title fade, drop chat to bottom
      setTimeout(() => {
        setChatAtBottom(true);
        setShowChat(true);
      }, 800);
      
      // Step 3: After chat drops, show messages and start API call
      setTimeout(() => {
        setMessages(prev => [...prev, userMessage]);
        setMessagesVisible(true);
        setIsAnimating(false);
        // Start API call for first message
        handleApiCall(userMessage);
      }, 1600);
    } else {
      // Subsequent messages - no animation delays
      setMessages(prev => [...prev, userMessage]);
      
      // Auto scroll to top if mini header is not visible
      if (!showMiniHeader) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Start API call immediately
      handleApiCall(userMessage);
    }
  };

  const handleApiCall = async (userMessage: Message) => {
    setIsLoading(true);
    
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
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate the offset needed to account for headers
      let offset = 80; // Base offset for the sticky navigation header (64px + padding)
      
      // Add mini header height if it's visible
      if (showMiniHeader) {
        offset += isMiniHeaderExpanded ? window.innerHeight * 0 : -200; // Increased offsets to scroll higher
      }
      
      // If there are chat messages, we need additional offset for the chat container
      if (messages.length > 0 && chatAtBottom) {
        // Get the actual height of the chat interface
        const chatInterface = document.querySelector('[data-chat-interface]');
        if (chatInterface) {
          const chatHeight = chatInterface.getBoundingClientRect().height;
          offset += chatHeight + 16; // Add chat height plus some padding
        } else {
          // Fallback if chat interface not found
          offset += 300; // Approximate chat height
        }
      }
      
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;
      
      window.scrollTo({
        top: Math.max(0, offsetPosition), // Ensure we don't scroll to negative position
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const titleOpacity = !titleVisible ? 0 : (showChat ? Math.max(0, 1 - scrollY / 300) : 1);

  // Show loading screen while checking client and auth status
  if (!isClient || !authCheckComplete) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center relative overflow-hidden">
        {/* Modern Radial Gradient Background - Consistent with main component */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {/* Primary radial gradient - Microsoft/Google inspired */}
          <div className="absolute top-0 left-0 w-full h-full radial-cyan-blue"></div>
          {/* Secondary accent gradient */}
          <div className="absolute top-1/4 right-0 w-96 h-96 radial-cyan-blue rounded-full blur-3xl"></div>
          {/* Tertiary subtle gradient */}
          <div className="absolute bottom-0 left-1/4 w-80 h-80 radial-purple rounded-full blur-2xl"></div>
          {/* Additional depth layer */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] radial-indigo-blue rounded-full blur-3xl"></div>
        </div>
        <div className="text-center relative z-10">
          {!authCheckComplete ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-4 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-light text-gray-300 mb-2">Hello, I&apos;m</h1>
              <h2 className="text-6xl md:text-8xl font-bold text-white ml-8">TONY LE</h2>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center relative overflow-hidden">
        {/* Modern Radial Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute top-0 left-0 w-full h-full radial-cyan-blue"></div>
          <div className="absolute top-1/4 right-0 w-96 h-96 radial-cyan-blue rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 radial-purple rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] radial-indigo-blue rounded-full blur-3xl"></div>
        </div>
        
        <div className="text-center relative z-10 max-w-md w-full mx-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError(''); // Clear error when typing
              }}
              placeholder="Password"
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isAuthenticating}
              autoComplete="current-password"
              maxLength={50}
            />

            {authError && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/30 rounded-lg py-2 px-4">
                {authError}
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
                    {/* Modern Radial Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                  {/* Primary radial gradient - Microsoft/Google inspired */}
          <div className="absolute top-0 left-0 w-full h-full radial-green"></div>
          {/* Secondary accent gradient */}
          <div className="absolute top-1/4 right-0 w-96 h-96 radial-cyan-blue rounded-full blur-3xl"></div>
          {/* Tertiary subtle gradient */}
          <div className="absolute bottom-0 left-1/4 w-80 h-80 radial-purple rounded-full blur-2xl"></div>
        {/* Additional depth layer */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] radial-indigo-blue rounded-full blur-3xl"></div>
      </div>
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <nav className="flex justify-between items-center py-2 px-2 sm:px-4">
          <div className="flex justify-center flex-1 space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                className="text-white hover:text-gray-300 transition-colors duration-200 text-[10px] xs:text-xs sm:text-sm font-medium whitespace-nowrap px-0.5 xs:px-1 sm:px-2"
              >
                {category.title}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors duration-200 text-[10px] xs:text-xs sm:text-sm font-medium flex items-center space-x-1 px-1 sm:px-2 ml-1"
            title="Logout"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Logout</span>
          </button>
        </nav>
      </header>

      {/* Mini Header Messages */}
      <AnimatePresence>
        {showMiniHeader && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-9 left-0 right-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/10"
          >
            <div className={`transition-all duration-300 ease-in-out ${
              isMiniHeaderExpanded ? 'h-[20vh]' : 'h-12'
            }`}>
              {/* Mini Header Controls */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} className="text-gray-300" />
                  <span className="text-sm text-gray-300">Chat Messages</span>
                  <span className="text-xs text-gray-400">({messages.length})</span>
                </div>
                <button
                  onClick={() => setIsMiniHeaderExpanded(!isMiniHeaderExpanded)}
                  className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
                >
                  {isMiniHeaderExpanded ? (
                    <ChevronUp size={16} className="text-gray-300" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-300" />
                  )}
                </button>
              </div>

              {/* Mini Messages Container */}
              {isMiniHeaderExpanded && (
                <div className="h-[calc(20vh-3rem)] overflow-y-auto px-4 py-2 space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`text-xs ${
                        message.role === 'user'
                          ? 'p-2 rounded-lg bg-blue-600/80 ml-auto max-w-[60%] min-w-[20%] w-fit'
                          : 'p-2 rounded-lg mr-auto max-w-screen'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-white whitespace-pre-wrap break-words">{message.content}</p>
                      ) : (
                        <div className="text-gray-100 prose prose-xs prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-gray-700/80 p-2 rounded-lg mr-auto w-fit">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={miniMessagesEndRef} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Homepage Title and Chat */}
      <div className={`min-h-screen flex flex-col items-center transition-all duration-800 ease-in-out relative z-10 ${
        chatAtBottom ? 'justify-start pt-0 pb-0 px-0 w-screen h-screen' : 'justify-center px-8'
      }`}>
        <AnimatePresence>
          {titleVisible && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ 
                opacity: titleOpacity,
                y: 0
              }}
              exit={{ 
                opacity: 0,
                y: -50
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
          )}
        </AnimatePresence>

        {/* Chat Interface */}
        <motion.div
          className={`${chatAtBottom ? 'w-screen h-screen flex flex-col' : 'w-full max-w-4xl'}`}
          initial={false}
          animate={{
            y: chatAtBottom ? 0 : 0
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            delay: titleVisible ? 0 : 0.2
          }}
          data-chat-interface
        >
          {/* Chat Messages */}
          <AnimatePresence>
            {showChat && messages.length > 0 && messagesVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`overflow-y-auto space-y-4 ${chatAtBottom ? 'flex-1 h-full px-8 pt-20 pb-4' : 'max-h-96 mb-6 px-4'}`}
                data-chat-container
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 ml-auto max-w-xs w-fit min-w-[20%]'
                        : 'mr-auto max-w-screen'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-white whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="markdown-content">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-700 p-4 rounded-2xl mr-auto w-fit"
                  >
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Input - Only render when not chatAtBottom */}
          {!chatAtBottom && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim() || isLoading || isAnimating) return;
              handleSubmit(e);
            }} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (isLoading || isAnimating)) {
                    e.preventDefault();
                  }
                }}
                placeholder="Ask me anything..."
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isAnimating}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors duration-200"
              >
                <ArrowUp size={20} />
              </button>
            </form>
          )}
        </motion.div>
      </div>

      {/* About Me Container */}
      <div 
        className="relative z-10"
        style={{ 
          marginTop: showMiniHeader ? (isMiniHeaderExpanded ? '20vh' : '3rem') : '0px'
        }}
      >
        <motion.div
          ref={aboutMeRef}
          className={`bg-slate-800 text-white min-h-screen pt-24 mt-8 ${
            chatAtBottom ? 'pb-32' : 'pb-24'
          }`}
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

      {/* Sticky Chat Input - Only when chat is active */}
      <AnimatePresence>
        {chatAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-t border-white/10 p-4"
          >
            <div className="max-w-4xl mx-auto">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim() || isLoading || isAnimating) return;
                handleSubmit(e);
              }} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (isLoading || isAnimating)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || isAnimating}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors duration-200"
                >
                  <ArrowUp size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Go to Top Button */}
      <AnimatePresence>
        {showGoToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className={`fixed z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors duration-200 ${
              chatAtBottom ? 'bottom-24 right-8' : 'bottom-8 right-8'
            }`}
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
