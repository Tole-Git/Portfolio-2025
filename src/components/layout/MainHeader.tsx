'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Menu, Search } from 'lucide-react';
import { Category } from '@/components/shared/types';

type MainHeaderProps = {
  categories: Category[];
  activeSection: string;
  navSearch: string;
  setNavSearch: (value: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  scrollToSection: (id: string) => void;
  scrollToTop: () => void;
};

export default function MainHeader({
  categories,
  activeSection,
  navSearch,
  setNavSearch,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  scrollToSection,
  scrollToTop,
}: MainHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10" data-element="main-header" title="Main Navigation Header">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex h-14 items-center gap-3">
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
  );
}



