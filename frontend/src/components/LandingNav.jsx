import { useState } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';

import Logo from './Logo';

/**
 * LandingNav
 *
 * Plan section 103 — a minimal navbar, not "a giant enterprise
 * navbar": brand mark, four in-page anchor links, one CTA. Links
 * scroll to sections already on the page (#how-it-works, #resolution,
 * #map, #team) rather than routing anywhere, since this is a
 * single-page landing experience.
 *
 * Also carries the theme toggle and the "By GeoCoderz" credit — both
 * used to float as separate fixed-position elements before this
 * navbar existed; consolidating them here avoids three independent
 * fixed elements competing for the same top strip of the page.
 *
 * On mobile, collapses into a simple toggled menu rather than trying
 * to fit five items in a cramped bar.
 *
 * Props:
 *  - onEnter: () => void   Same callback every other CTA on this page
 *                          uses to continue into the app.
 *  - theme: 'light' | 'dark'
 *  - onToggleTheme: () => void
 */
const NAV_LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#resolution', label: 'Resolution' },
  { href: '#map', label: 'Map' },
  { href: '#team', label: 'Team' },
];

export default function LandingNav({ onEnter, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <a href="#top" className="landing-nav-brand">
          <div className="landing-nav-logo">
            <Logo size={18} />
          </div>

          <div className="landing-nav-brand-text">
            <span className="landing-nav-brand-name">GeoMapAI</span>
            <span className="landing-nav-presented-by">
              By GeoCoderz
            </span>
          </div>
        </a>

        <div className="landing-nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="landing-nav-actions">
          <button
            type="button"
            className="landing-nav-theme-toggle"
            onClick={onToggleTheme}
            aria-label={
              theme === 'light'
                ? 'Switch to dark mode'
                : 'Switch to light mode'
            }
          >
            {theme === 'light' ? (
              <Moon size={15} />
            ) : (
              <Sun size={15} />
            )}
          </button>

          <button
            type="button"
            className="landing-nav-cta"
            onClick={onEnter}
          >
            Open Workspace
          </button>

          <button
            type="button"
            className="landing-nav-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="landing-nav-mobile-menu">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
            >
              {link.label}
            </a>
          ))}

          <button
            type="button"
            className="landing-nav-cta landing-nav-cta--mobile"
            onClick={() => {
              handleLinkClick();
              onEnter();
            }}
          >
            Open Workspace
          </button>
        </div>
      )}
    </nav>
  );
}
