'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

import { Message, categories } from '@/components/shared/types';
import MainHeader from '@/components/layout/MainHeader';
import MiniChatHeader from '@/components/chat/MiniChatHeader';
import MessageList from '@/components/chat/MessageList';
import CenterChatInput from '@/components/chat/CenterChatInput';
import StickyChatInput from '@/components/chat/StickyChatInput';
import Summary from '@/components/sections/Summary';
import Experience from '@/components/sections/Experience';
import ProjectsSkills from '@/components/sections/ProjectsSkills';
import EducationAchievements from '@/components/sections/EducationAchievements';
import Contact from '@/components/sections/Contact';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [navSearch, setNavSearch] = useState('');
  
  
  
  // Animation sequence states
  const [isAnimating, setIsAnimating] = useState(false);
  const [titleVisible, setTitleVisible] = useState(true);
  const [chatAtBottom, setChatAtBottom] = useState(false);
  const [messagesVisible, setMessagesVisible] = useState(false);
  
  // Mobile keyboard states
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollPositionBeforeKeyboard, setScrollPositionBeforeKeyboard] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aboutMeRef = useRef<HTMLDivElement>(null);
  const miniMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    // Check authentication status on mount
    checkAuthStatus();
    
    // Set up periodic session checking (every 5 minutes)
    const sessionCheckInterval = setInterval(() => {
      if (isAuthenticated) {
        checkAuthStatus();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated]);

  // Mobile keyboard detection and viewport handling
  useEffect(() => {
    if (!isClient) return;

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    setViewportHeight(initialViewportHeight);

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Keyboard is considered open if viewport height decreased by more than 150px
      const keyboardOpen = heightDifference > 150;
      
      if (keyboardOpen && !isKeyboardOpen) {
        // Keyboard just opened - save current scroll position
        setScrollPositionBeforeKeyboard(window.scrollY);
        setIsKeyboardOpen(true);
      } else if (!keyboardOpen && isKeyboardOpen) {
        // Keyboard just closed - restore scroll position with a slight delay
        setIsKeyboardOpen(false);
        setTimeout(() => {
          window.scrollTo({ top: scrollPositionBeforeKeyboard, behavior: 'instant' });
        }, 100);
      }
      
      setViewportHeight(currentHeight);
    };

    // Add event listeners for both visual viewport and window resize
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }
    
    window.addEventListener('resize', handleViewportChange);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [isClient, isKeyboardOpen, scrollPositionBeforeKeyboard]);

  // Check if user is already authenticated
  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      
      // If session expired or deployment reset occurred, automatically logout
      if (!data.authenticated && isAuthenticated) {
        // Session was valid but now invalid - force logout
        setIsAuthenticated(false);
        setMessages([]);
        setShowChat(false);
        setTitleVisible(true);
        setChatAtBottom(false);
        setMessagesVisible(false);
        setIsAnimating(false);
        console.log('Session expired or deployment reset - automatically logged out');
      } else {
        setIsAuthenticated(data.authenticated);
      }
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
      
      // Close mobile menu when scrolling
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [messages.length, isMobileMenuOpen]);

  useEffect(() => {
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-scroll mini messages to bottom when messages update and mini header is visible
  useEffect(() => {
    if (showMiniHeader && isMiniHeaderExpanded && miniMessagesEndRef.current) {
      miniMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showMiniHeader, isMiniHeaderExpanded]);

  // Auto sign-out 1 hour after login
  useEffect(() => {
    if (!isAuthenticated) return;
    const logoutTimer = setTimeout(() => {
      handleLogout();
    }, 60 * 60 * 1000);
    return () => clearTimeout(logoutTimer);
  }, [isAuthenticated]);

  // Track active section based on scroll position
  useEffect(() => {
    if (!isClient) return;

    const sections = categories
      .map(c => document.getElementById(c.id))
      .filter(Boolean) as HTMLElement[];

    if (!sections.length) return;

    const computeActive = () => {
      const scrollTop = window.scrollY;
      const probeY = scrollTop + window.innerHeight * 0.35; // consider a point above viewport center

      // No highlight when above the first section (chat area)
      const firstTop = sections[0]?.offsetTop ?? 0;
      if (scrollTop + 1 < firstTop - 10) {
        if (activeSection !== '') setActiveSection('');
        return;
      }

      let current: string = '';
      for (const el of sections) {
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (probeY >= top && probeY < bottom) {
          current = el.id;
          break;
        }
      }
      if (current !== activeSection) setActiveSection(current);
    };

    computeActive();
    window.addEventListener('scroll', computeActive, { passive: true });
    window.addEventListener('resize', computeActive);
    return () => {
      window.removeEventListener('scroll', computeActive);
      window.removeEventListener('resize', computeActive);
    };
  }, [isClient, activeSection]);

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
      // Close mobile menu first
      setIsMobileMenuOpen(false);
      
      // Small delay to let menu close
      setTimeout(() => {
        // Get viewport and header dimensions
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 48;
        const viewportHeight = window.innerHeight;
        
        // Get element position
        const elementRect = element.getBoundingClientRect();
        const elementTop = elementRect.top + window.pageYOffset;
        const elementHeight = elementRect.height;
        
        // Calculate position to center the section in viewport
        // Center = elementTop - (viewportHeight / 2) + (elementHeight / 2) + headerHeight
        const centerPosition = elementTop - (viewportHeight / 2) + (elementHeight / 2) + (headerHeight / 2);
        const targetPosition = Math.max(0, centerPosition);
      
        // Smooth scroll with proper CSS support
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Reset scroll behavior after animation
          setTimeout(() => {
            document.documentElement.style.scrollBehavior = 'auto';
          }, 1000);
        });
        
      }, 150); // Slightly longer delay for menu animation
      
    } else {
      console.error('Section not found:', sectionId);
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
        {/* Modern Minimal Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          {/* Subtle red accent */}
          <div className="absolute top-0 left-0 w-full h-full radial-red-accent"></div>
          {/* Gray depth layer */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] radial-minimal rounded-full blur-3xl"></div>
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
        {/* Modern Minimal Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute top-0 left-0 w-full h-full radial-red-accent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] radial-minimal rounded-full blur-3xl"></div>
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
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-white/40"
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
      {/* Modern Minimal Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Subtle red accent */}
        <div className="absolute top-0 left-0 w-full h-full radial-red-accent"></div>
        {/* Gray depth layer */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] radial-minimal rounded-full blur-3xl"></div>
      </div>
      <MainHeader
        categories={categories}
        activeSection={activeSection}
        navSearch={navSearch}
        setNavSearch={setNavSearch}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        scrollToSection={scrollToSection}
        scrollToTop={scrollToTop}
      />

      <MiniChatHeader
        visible={showMiniHeader}
        isMiniHeaderExpanded={isMiniHeaderExpanded}
        setIsMiniHeaderExpanded={setIsMiniHeaderExpanded}
        messages={messages}
        isLoading={isLoading}
        miniMessagesEndRef={miniMessagesEndRef}
      />

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
          <AnimatePresence>
            {showChat && messages.length > 0 && messagesVisible && (
              <MessageList
                messages={messages}
                isLoading={isLoading}
                chatAtBottom={chatAtBottom}
                isKeyboardOpen={isKeyboardOpen}
                viewportHeight={viewportHeight}
                messagesEndRef={messagesEndRef}
              />
            )}
          </AnimatePresence>

          {!chatAtBottom && (
            <CenterChatInput
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isAnimating={isAnimating}
            />
          )}
        </motion.div>
      </div>

      {/* Full-Page Sections Container */}
      <div 
        className="relative z-10"
        style={{ 
          marginTop: showMiniHeader ? (isMiniHeaderExpanded ? 'calc(20vh + 3.5rem)' : '6.5rem') : '3.5rem'
        }}
      >
        <Summary />
        <Experience />
        <ProjectsSkills />
        <EducationAchievements />
        <Contact />
      </div>

      <StickyChatInput
        visible={chatAtBottom}
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isAnimating={isAnimating}
        chatInputRef={chatInputRef}
        isKeyboardOpen={isKeyboardOpen}
      />

      {/* Go to Top Button */}
      <AnimatePresence>
        {showGoToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className={`fixed z-50 p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full shadow-lg transition-colors duration-200 ${
              chatAtBottom ? 'bottom-24 right-8' : 'bottom-8 right-8'
            }`}
            data-element="scroll-to-top"
            title="Scroll to top of page"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
