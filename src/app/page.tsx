'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ArrowUp, MessageSquare, X, Menu, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import uwLogo from './assets/uw-logo.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const categories = [
  { id: 'summary', title: 'Summary' },
  { id: 'experience', title: 'Experience' },
  { id: 'projects', title: 'Projects' },
  { id: 'education-achievements', title: 'Education & Achievements' },
  { id: 'contact', title: 'Contact' }
];

// Neon color classes for tags
const neonColors = [
  'tag-neon-emerald',
  'tag-neon-purple', 
  'tag-neon-blue',
  'tag-neon-amber',
  'tag-neon-cyan',
  'tag-neon-lime',
  'tag-neon-red',
  'tag-neon-indigo'
];

// Function to get consistent color for a tag based on its text
const getTagColor = (tagText: string): string => {
  const index = tagText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % neonColors.length;
  return neonColors[index];
};

// Explicit tag style mapping for Projects & Skills sections
const tagStyleMap: Record<string, string> = {
  // Programming Languages
  'python': 'tag-neon-amber',
  'javascript': 'tag-neon-amber',
  'typescript': 'tag-neon-blue',
  'java': 'tag-neon-red',
  'sql': 'tag-neon-indigo',

  // Runtimes / Platforms
  'node.js': 'tag-neon-lime',
  'nodejs': 'tag-neon-lime',

  // Frameworks & Libraries
  'react': 'tag-neon-cyan',
  'streamlit': 'tag-neon-red',
  'express': 'tag-neon-purple',
  'jquery': 'tag-neon-blue',

  // AI/ML & Cloud Services
  'openai api': 'tag-neon-emerald',
  'azure openai': 'tag-neon-blue',
  'google gemini': 'tag-neon-indigo',
  'gemini api': 'tag-neon-indigo',
  'twilio': 'tag-neon-red',
  'google cloud speech': 'tag-neon-cyan',
  'ai/ml apis': 'tag-neon-purple',

  // Concepts / Techniques
  'rag': 'tag-neon-amber',
  'vector search': 'tag-neon-amber',
  'mcp protocol': 'tag-neon-purple',
  'document processing': 'tag-neon-blue',
  'semantic kernel': 'tag-neon-emerald',
  'agent architecture': 'tag-neon-purple',
  'data visualization': 'tag-neon-cyan'
};

// Prefer explicit mapping when available; fallback to deterministic color
const getTagClass = (tagText: string): string => {
  const key = tagText.trim().toLowerCase();
  return tagStyleMap[key] ?? getTagColor(tagText);
};

// Deterministic gradient palette for category titles
const gradientPalette = [
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#ef4444', // red
  '#22d3ee', // sky/cyan-light
  '#a3e635', // lime-light
  '#eab308'  // yellow
];

const hashString = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getCategoryGradient = (id: string): { left: string; right: string } => {
  const base = hashString(id);
  const leftIdx = base % gradientPalette.length;
  let rightIdx = (base * 7 + 3) % gradientPalette.length;
  if (rightIdx === leftIdx) rightIdx = (rightIdx + 1) % gradientPalette.length;
  const left = gradientPalette[leftIdx];
  const right = gradientPalette[rightIdx];
  return { left, right };
};

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
        
        // Calculate position
        // Default: center the section in viewport
        const centerPosition = elementTop - (viewportHeight / 2) + (elementHeight / 2) + (headerHeight / 2);
        // For Projects, bias lower to create more space above the title
        let targetPosition = centerPosition;
        if (sectionId === 'projects') {
          targetPosition = elementTop - headerHeight;
        }
        targetPosition = Math.max(0, targetPosition);
      
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
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10" data-element="main-header" title="Main Navigation Header">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex h-14 items-center gap-3">
            {/* Brand */}
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/10 transition-colors"
              title="Go to top"
              data-element="brand"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20 text-[11px] font-semibold tracking-wider">
                TL
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 mx-2 overflow-x-auto flex-nowrap" data-element="main-nav">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToSection(category.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
                    activeSection === category.id
                      ? 'bg-white/15 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  data-section={category.id}
                  title={`Navigate to ${category.title} section`}
                >
                  {category.title}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Desktop Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const query = navSearch.trim().toLowerCase();
                if (!query) return;
                const match = categories.find(c => c.title.toLowerCase().includes(query));
                if (match) scrollToSection(match.id);
              }}
              className="relative hidden md:flex items-center"
              role="search"
              aria-label="Search sections"
            >
              <Search size={16} className="absolute left-3 text-white/60" />
              <input
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search"
                className="pl-8 pr-3 py-1.5 w-40 focus:w-56 text-sm bg-white/10 border border-white/10 rounded-full text-white placeholder:text-white/50 focus:border-white/30 outline-none transition-[width,border-color] duration-200"
              />
            </form>

            {/* Mobile menu button */}
            <div className="md:hidden ml-auto">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white/90 hover:text-white hover:bg-white/10 p-2 transition-colors rounded-md"
                data-element="mobile-menu-toggle"
                title={`${isMobileMenuOpen ? 'Close' : 'Open'} navigation menu`}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="md:hidden border-t border-white/10 bg-white/5 backdrop-blur-xl"
              data-element="mobile-menu"
            >
              <div className="p-4 space-y-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
                  <input
                    value={navSearch}
                    onChange={(e) => setNavSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const query = navSearch.trim().toLowerCase();
                        const match = categories.find(c => c.title.toLowerCase().includes(query));
                        if (match) {
                          scrollToSection(match.id);
                        }
                      }
                    }}
                    placeholder="Search sections"
                    className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/10 rounded-md text-sm text-white placeholder:text-white/50 focus:border-white/30 outline-none"
                  />
                </div>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => scrollToSection(category.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === category.id
                        ? 'bg-white/15 text-white'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                    data-element="mobile-nav-button"
                    data-section={category.id}
                    title={`Navigate to ${category.title} section`}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mini Header Messages */}
      <AnimatePresence>
        {showMiniHeader && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-14 left-0 right-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/5"
            data-element="mini-chat-header"
            title="Mini Chat Messages"
          >
            <div className={`transition-all duration-300 ease-in-out ${
              isMiniHeaderExpanded ? 'h-[20vh]' : 'h-12'
            }`}>
              {/* Mini Header Controls */}
              <div className="flex items-center justify-between px-4 py-2 border-white/10">
                <div className="flex items-center space-x-2">
                  <MessageSquare size={16} className="text-gray-300" />
                  <span className="text-sm text-gray-300">Chat Messages</span>
                  <span className="text-xs text-gray-400">({messages.length})</span>
                </div>
                <button
                  onClick={() => setIsMiniHeaderExpanded(!isMiniHeaderExpanded)}
                  className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
                  data-element="mini-chat-toggle"
                  title={`${isMiniHeaderExpanded ? 'Collapse' : 'Expand'} mini chat`}
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
                <div className="h-[calc(20vh-3rem)] overflow-y-auto px-4 py-2 space-y-2" data-element="mini-chat-messages" title="Mini Chat Messages Container">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`text-xs ${
                        message.role === 'user'
                          ? 'p-2 rounded-lg bg-gray-700/50 border border-white/30 ml-auto max-w-[60%] min-w-[20%] w-fit shadow-md shadow-white/10'
                          : 'p-2 rounded-lg mr-auto max-w-screen bg-black'
                      }`}
                      data-element={`mini-message-${message.role}`}
                      data-message-id={message.id}
                      title={`${message.role === 'user' ? 'User' : 'AI'} message in mini chat`}
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
                className={`overflow-y-auto space-y-4 ${
                  chatAtBottom 
                    ? `flex-1 h-full px-8 pt-20 ${
                        isKeyboardOpen 
                          ? 'pb-24' // Extra padding when keyboard is open
                          : 'pb-4' 
                      }` 
                    : 'max-h-96 mb-6 px-4'
                }`}
                style={{
                  // Adjust height when keyboard is open to ensure messages remain visible
                  maxHeight: isKeyboardOpen && chatAtBottom 
                    ? `${viewportHeight - 200}px` // Account for header, input, and padding
                    : undefined
                }}
                data-chat-container
              >
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gray-700/50 border border-white/30 ml-auto max-w-xs w-fit min-w-[20%]'
                        : 'mr-auto max-w-screen'
                    }`}
                    data-element={`main-message-${message.role}`}
                    data-message-id={message.id}
                    title={`${message.role === 'user' ? 'User' : 'AI'} message in main chat`}
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
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:border-white/40"
                data-element="chat-input-center"
                title="Chat input - center of page"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || isAnimating}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors duration-200"
                data-element="chat-submit-center"
                title="Send message - center chat"
              >
                <ArrowUp size={20} />
              </button>
            </form>
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
        {/* Summary Section - Full Page */}
        <section id="summary" className="min-h-screen flex items-center px-8">
          <motion.div
            ref={aboutMeRef}
            className="container-golden mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="border-t border-gray-600 pt-8 mb-8">
              <h2 className="text-sm font-medium tracking-widest uppercase mb-8">
                {(() => { const g = getCategoryGradient('summary'); return (
                  <span
                    className="gradient-text-duo"
                    style={{
                      ['--grad-left' as any]: '#3b82f6',
                      ['--grad-right' as any]: '#8b5cf6',
                      ['--grad-split' as any]: '75%'
                    }}
                  >
                    SUMMARY
                  </span>
                ); })()}
              </h2>
            </div>
            <p className="text-2xl leading-relaxed text-gray-300">
              AI Engineer with 3+ years of production AI development experience, serving 4,000+ monthly active users. 
              Experienced in agent-to-agent communication, 
              MCP protocol implementation, and full-stack AI applications. Specialized in building scalable AI copilots, 
              real-time voice systems, and custom agent architectures for enterprise environments.
            </p>
          </motion.div>
        </section>

        {/* Professional Experience Section - Full Page */}
        <section id="experience" className="min-h-screen flex items-center px-8">
          <motion.div
            className="container-golden mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="border-t border-gray-600 pt-8 mb-12">
              <h2 className="text-sm font-medium tracking-widest uppercase">
                {(() => { const g = getCategoryGradient('experience'); return (
                  <span
                    className="gradient-text-duo"
                    style={{
                      ['--grad-left' as any]: '#84cc16',
                      ['--grad-right' as any]: '#3b82f6',
                      ['--grad-split' as any]: '75%'
                    }}
                  >
                    EXPERIENCE
                  </span>
                ); })()}
              </h2>
            </div>
            
            <div className="space-y-16">
              <div className="border-b border-gray-700 pb-16">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <span>2024 - PRESENT</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-4"></div>
                      <span>BELLEVUE, WA</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-4xl font-light text-white mb-2">T-Mobile</h3>
                <h4 className="text-xl text-gray-300 mb-8">Software Engineer</h4>
                
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Architect and maintain AI copilot serving 4,000+ unique monthly users. First engineer in organization to implement Model Context Protocol (MCP). Built custom agent-to-agent communication systems and developed actionable AI tools including automated ticket creation.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-xs rounded ${getTagColor('OpenAI API')}`}>OpenAI API</span>
                  <span className={`px-3 py-1 text-xs rounded ${getTagColor('MCP Protocol')}`}>MCP Protocol</span>
                  <span className={`px-3 py-1 text-xs rounded ${getTagColor('Agent Architecture')}`}>Agent Architecture</span>
                  <span className={`px-3 py-1 text-xs rounded ${getTagColor('Full-Stack')}`}>Full-Stack</span>
                </div>
              </div>
              
              <div className="border-b border-gray-700 pb-16">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <span>2022 - 2024</span>
                      <span className="mx-4"></span>
                      <span>BELLEVUE, WA</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-4xl font-light text-white mb-2">T-Mobile</h3>
                <h4 className="text-xl text-gray-300 mb-8">Associate Software Engineer</h4>
                
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Led frontend development of AI troubleshooting interface and implemented Retrieval-Augmented Generation. Promoted 1 year ahead of standard timeline.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-xs rounded ${getTagColor('React')}`}>React</span>
                  <span className={`px-3 py-1 text-xs rounded ${getTagColor('TypeScript')}`}>TypeScript</span>
                  <span className={`px-3 py-1 text-xs rounded ${getTagColor('RAG')}`}>RAG</span>
                  <span className={`px-3 py-1 text-xs rounded ${getTagColor('AI Integration')}`}>AI Integration</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Projects Section - Full Page */}
        <section id="projects" className="min-h-screen flex items-center px-8 scroll-mt-40 md:scroll-mt-56 lg:scroll-mt-64">
          <motion.div
            className="container-golden mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="border-t border-gray-600 pt-8 mb-12">
              <h2 className="text-sm font-medium tracking-widest uppercase"> 
                {(() => { const g = getCategoryGradient('projects'); return (
                  <span
                    className="gradient-text-duo"
                    style={{
                      ['--grad-left' as any]: '#f59e0b',
                      ['--grad-right' as any]: '#ef4444',
                      ['--grad-split' as any]: '75%'
                    }}
                  >
                    PROJECTS
                  </span>
                ); })()}
              </h2>
            </div>
            
            {/* Projects */}
            <div className="mb-20">
              <div className="space-y-12">
                <div className="border-b border-gray-700 pb-12">
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <span>AUGUST 2025</span>
                  </div>
                  <h3 className="text-3xl font-light text-white mb-4">Technical Customer Support Agent</h3>
                  <p className="inline-block px-3 py-1 text-xs rounded border border-white text-white mb-2">T-Mobile's CNO Create-A-Thon</p>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    Built an autonomous support agent that can search, diagnose, create and sort tickets, and resolve issues end-to-end for millions of accounts. Reduced handling time from 5–10 minutes to ~30 seconds for Technical Care teams. Utilized Streamlit, Python, MCP, custom AI visualizations (charts, graphs, tables), custom Semantic Kernel, orchestrated workflows, and agent-to-agent architecture.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Python')}`}>Python</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Streamlit')}`}>Streamlit</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('MCP Protocol')}`}>MCP Protocol</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Semantic Kernel')}`}>Semantic Kernel</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Agent Architecture')}`}>Agent Architecture</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Data Visualization')}`}>Data Visualization</span>
                  </div>
                </div>
                
                <div className="border-b border-gray-700 pb-12">
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <span>JUNE 2025 - PRESENT</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-4"></div>
                  </div>
                  <h3 className="text-3xl font-light text-white mb-4">AI Receptionist System</h3>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    Built a voice-driven receptionist that automates call intake, authentication, and triage with
                    streaming speech recognition and LLM-guided dialog. Generates structured call summaries and
                    suggested actions for seamless human handoff. Integrated Twilio webhooks and external tools for
                    task execution, designed for low-latency interactions and resilient error handling.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Node.js')}`}>Node.js</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Twilio')}`}>Twilio</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Google Cloud Speech')}`}>Google Cloud Speech</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Gemini API')}`}>Gemini API</span>
                  </div>
                </div>

                <div className="border-b border-gray-700 pb-12">
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <span>April 2025 - PRESENT</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-4"></div>
                  </div>
                  <h3 className="text-3xl font-light text-white mb-4">Medical AI Analysis Platform</h3>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    Developed an AI pipeline that ingests multi-format lab panels, normalizes units and reference
                    ranges, and extracts clinically relevant entities. Flags out-of-range markers, trends deltas over
                    time, and produces clinician-ready summaries with interactive visualizations. Implemented robust
                    document parsing, validation, and batch processing using Python and AI/ML APIs.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Python')}`}>Python</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('AI/ML APIs')}`}>AI/ML APIs</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Document Processing')}`}>Document Processing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills moved to Education & Achievements */}
          </motion.div>
        </section>

        {/* Education & Achievements Section - Full Page */}
        <section id="education-achievements" className="min-h-screen flex items-center px-8">
          <motion.div
            className="container-golden mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="border-t border-gray-600 pt-8 mb-12">
              <h2 className="text-sm font-medium tracking-widest uppercase">
                {(() => { const g = getCategoryGradient('education-achievements'); return (
                  <span
                    className="gradient-text-duo"
                    style={{
                      ['--grad-left' as any]: '#ddd6fe',
                      ['--grad-right' as any]: '#c4b5fd',
                      ['--grad-split' as any]: '75%'
                    }}
                  >
                    EDUCATION & ACHIEVEMENTS
                  </span>
                ); })()}
              </h2>
            </div>
            
            {/* Education */}
            <div className="mb-20 border-b border-gray-700 pb-16">
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <span>GRADUATED JUNE 2022</span>
                <span className="mx-4"></span>
                <span>TACOMA, WA</span>
              </div>
              <h3 className="text-4xl font-light text-white mb-2">
                <span className="glow-purple-subtle inline-block">
                  <span className="align-middle inline-block mr-2" style={{ width: '1.14em', height: '1.14em', transform: 'translateY(-4px)' }}>
                    <img src={uwLogo.src ?? (uwLogo as any)} alt="UW Logo" className="w-full h-full object-contain" />
                  </span>
                  <span className="text-white font-semibold">University of Washington</span>
                </span>
              </h3>
              <h4 className="text-xl text-gray-300 mb-8">Bachelor of Science in Computer Science & Systems</h4>
              <p className="text-lg text-gray-300 leading-relaxed">
                Relevant Coursework: Algorithms, Artificial Intelligence, Advanced Software Engineering, 
                Matrix Algebra, Data Structures, Computer Architecture, Probability & Statistics, Machine Learning Fundamentals
              </p>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-2xl font-light text-white mb-8">Key Achievements</h3>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Production Scale</h4>
                    <p className="text-gray-300">4,000+ monthly active users on AI systems</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Innovation Leadership</h4>
                    <p className="text-gray-300">First in organization to implement MCP protocol</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Hackathon Recognition</h4>
                    <p className="text-gray-300">2025 T-Mobile Create-a-thon Second Place (2nd of 34 teams)</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Enterprise Copilot Architecture</h4>
                    <p className="text-gray-300">Pioneered the first AI copilot to orchestrate and interoperate with core internal tools (2023)</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Cross-Functional Impact</h4>
                    <p className="text-gray-300">Delivered AI solutions across multiple divisions</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Technical Innovation</h4>
                    <p className="text-gray-300">Pioneered agent-to-agent communication and dynamic UI generation</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Technical Skills */}
            <div className="mt-16">
              <h3 className="text-2xl font-light text-white mb-8">Technical Skills</h3>
              <div className="grid md:grid-cols-3 gap-12">
                <div>
                  <h4 className="font-medium mb-4 text-white">AI/ML Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('OpenAI API')}`}>OpenAI API</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Azure OpenAI')}`}>Azure OpenAI</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Google Gemini')}`}>Google Gemini</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('RAG')}`}>RAG</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Vector Search')}`}>Vector Search</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('MCP Protocol')}`}>MCP Protocol</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4 text-white">Programming Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Python')}`}>Python</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('JavaScript')}`}>JavaScript</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Node.js')}`}>Node.js</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Java')}`}>Java</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('SQL')}`}>SQL</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-4 text-white">Frameworks & Libraries</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('React')}`}>React</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Streamlit')}`}>Streamlit</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('Express')}`}>Express</span>
                    <span className={`px-3 py-1 text-xs rounded ${getTagClass('jQuery')}`}>jQuery</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Contact/Footer Section - Full Page */}
        <section id="contact" className="min-h-screen flex items-center px-8">
          <motion.div
            className="container-golden mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="border-t border-gray-600 pt-8 mb-12">
              <h2 className="text-sm font-medium tracking-widest uppercase">
                {(() => { const g = getCategoryGradient('contact'); return (
                  <span
                    className="gradient-text-duo"
                    style={{
                      ['--grad-left' as any]: '#8b5cf6',
                      ['--grad-right' as any]: '#3b82f6',
                      ['--grad-split' as any]: '75%'
                    }}
                  >
                    CONTACT
                  </span>
                ); })()}
              </h2>
            </div>
            
            <div className="mb-16">
              <h3 className="text-6xl font-light text-white mb-8 leading-tight">HAVE AN<br />OPPORTUNITY?</h3>
              <p className="text-xl text-gray-300 leading-relaxed">
                I'm open to new roles, freelance projects, and creative collaborations! If you have an idea you'd like to discuss, let's get in touch.
              </p>
            </div>
            
            <div className="mb-12">
              <a href="mailto:inquiries@tonytle.dev" className="text-3xl text-white hover:text-gray-300 transition-colors duration-200">
                inquiries@tonytle.dev
              </a>
            </div>
            <div className="flex space-x-8">
              <a 
                href="https://github.com/Tole-Git" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2"
              >
                <span>GitHub</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/letan87262910/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-2"
              >
                <span>LinkedIn</span>
              </a>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Sticky Chat Input - Only when chat is active */}
      <AnimatePresence>
        {chatAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed left-0 right-0 z-50 p-4 ${
              isKeyboardOpen 
                ? 'bottom-0' 
                : 'bottom-0' 
            }`}
            data-element="sticky-chat-footer"
            title="Sticky Chat Input Footer"
            style={{
              bottom: isKeyboardOpen ? '0px' : '0px',
              transform: isKeyboardOpen ? 'translateY(0)' : 'translateY(0)'
            }}
          >
            <div className="max-w-4xl mx-auto">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim() || isLoading || isAnimating) return;
                handleSubmit(e);
              }} className="relative">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (isLoading || isAnimating)) {
                      e.preventDefault();
                    }
                  }}
                  onFocus={() => {
                    if (window.innerWidth <= 768) {
                      setTimeout(() => {
                        if (chatInputRef.current) {
                          chatInputRef.current.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                          });
                        }
                      }, 300);
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="w-full px-6 py-4 bg-gray-800 border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:border-white/40"
                  data-element="chat-input-sticky"
                  title="Chat input - sticky footer"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || isAnimating}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors duration-200"
                  data-element="chat-submit-sticky"
                  title="Send message - sticky footer"
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
