'use client';

import { Search, Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { ModeToggle } from '../ui/mode-toggle';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-background border-b-4 border-primary px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <span className="text-background font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-2xl tracking-tight text-primary">
            NPMChat
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="/docs"
            className="font-semibold text-black hover:text-purple-400 transition-colors">
            Docs
          </a>
          <a
            href="https://github.com/ThePlator/NPMChat"
            className="font-semibold text-black hover:text-purple-400 transition-colors">
            GitHub
          </a>

          <Link
            href="/features"
            className="font-semibold text-foreground hover:text-purple-400 transition-colors">
            Features
          </Link>
        </nav>

        {/* Icons */}
        <div className="hidden md:flex items-center space-x-4">
          <ModeToggle />
          <button className="p-2 hover:bg-muted rounded-sm transition-colors">
            <Search className="w-5 h-5 text-primary" />
          </button>
          <button className="p-2 hover:bg-muted rounded-sm transition-colors">
            <Heart className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 border-2 border-foreground  rounded-sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? (
            <X className="w-5 h-5 text-foreground" />
          ) : (
            <Menu className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t-2 border-foreground">
          <nav className="flex flex-col space-y-4 pt-4">
            <a
              href="/docs"
              className="font-semibold text-black hover:text-purple-400 transition-colors">
              Docs
            </a>
            <a
              href="/github"
              className="font-semibold text-black hover:text-purple-400 transition-colors">

              GitHub
            </a>

            <Link
              href="/features"
              className="font-semibold text-foreground hover:text-purple-400 transition-colors">
              Features
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
