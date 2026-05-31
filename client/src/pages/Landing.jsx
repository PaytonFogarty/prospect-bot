import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductDemo from '../components/ProductDemo';
import RefreshDemo from '../components/RefreshDemo';
import './Landing.css';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.15 }
    );
    sectionsRef.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el);
  };

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className={`ln-nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="#" className="ln-nav-logo">Revara<span className="dot" /></a>
        <div className="ln-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
        </div>
        <Link to="/signup" className="ln-btn ln-btn-primary">Get Started</Link>
      </nav>

      {/* Hero */}
      <section className="ln-hero">
        <div className="ln-hero-glow" />
        <div className="ln-hero-grid" />
        <div className="ln-particles">
          <span /><span /><span /><span /><span /><span />
        </div>
        <div className="ln-hero-content">
          <h1>Your pipeline fills itself.</h1>
          <p className="sub">
            Revara finds, enriches, and delivers qualified prospects into your CRM — automatically. You just do outbound.
          </p>
          <div className="ln-hero-ctas">
            <Link to="/signup" className="ln-btn ln-btn-primary">Start for free</Link>
            <a href="#how-it-works" className="ln-btn ln-btn-ghost">See how it works</a>
          </div>
          <p className="ln-social-proof">Trusted by sales teams at fast-growing companies</p>
          <div className="ln-company-pills">
            <span>Meridian Capital</span>
            <span>Arcline Digital</span>
            <span>Voss & Partners</span>
            <span>Northbeam</span>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="ln-section fade-section" ref={addRef}>
        <h2 className="ln-section-title">Prospecting is broken.</h2>
        <div className="ln-problems">
          <div className="ln-problem-card">
            <div className="icon">&#9200;</div>
            <h4>Hours wasted on manual research</h4>
            <p>Your reps spend more time finding prospects than actually selling to them.</p>
          </div>
          <div className="ln-problem-card">
            <div className="icon">&#128274;</div>
            <h4>Stale contact data in your CRM</h4>
            <p>Emails bounce, phones disconnect, job titles change — your data rots faster than you can fix it.</p>
          </div>
          <div className="ln-problem-card">
            <div className="icon">&#128221;</div>
            <h4>Reps doing data entry instead of selling</h4>
            <p>Copy-pasting from LinkedIn to your CRM is not a revenue activity.</p>
          </div>
        </div>
      </section>

      {/* Product Demo */}
      <section className="ln-section fade-section" ref={addRef} style={{ textAlign: 'center' }}>
        <h2 className="ln-section-title">Watch it work.</h2>
        <p style={{ color: '#8a8a9a', fontSize: '1.125rem', marginTop: '-1.5rem', marginBottom: '2.5rem' }}>From config to CRM in under 60 seconds.</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ProductDemo />
        </div>
      </section>

      {/* Contact Refresh */}
      <section className="ln-section fade-section" ref={addRef}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c3aed', fontWeight: 700, marginBottom: 12 }}>Contact Refresh</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16, lineHeight: 1.15 }}>Your CRM data goes stale. We fix that.</h2>
            <p style={{ color: '#8a8a9a', fontSize: '1rem', lineHeight: 1.7, marginBottom: 24 }}>
              Revara scans your existing contacts and fills in missing emails, phones, and refreshes outdated info — automatically.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Email addresses', 'Direct phone numbers', 'Job titles', 'Company changes'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9375rem' }}>
                  <span style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.875rem' }}>&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RefreshDemo />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="ln-section fade-section" ref={addRef} id="how-it-works">
        <h2 className="ln-section-title">How it works</h2>
        <div className="ln-steps">
          <div className="ln-step">
            <div className="step-num">1</div>
            <h4>Connect your tools</h4>
            <p>Plug in Lusha and your CRM. Takes 2 minutes. You keep your own API keys and credits.</p>
          </div>
          <div className="ln-step">
            <div className="step-num">2</div>
            <h4>Define your ICP</h4>
            <p>Set keywords, locations, target companies. Create multiple configs for different buyer personas.</p>
          </div>
          <div className="ln-step">
            <div className="step-num">3</div>
            <h4>Wake up to new prospects</h4>
            <p>Your pipeline fills automatically. Net-new, deduplicated, enriched contacts land in your CRM overnight.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="ln-section fade-section" ref={addRef} id="features">
        <h2 className="ln-section-title">Everything you need</h2>
        <div className="ln-features">
          <div className="ln-feature">
            <div className="feat-icon">&#128269;</div>
            <h4>Keyword search</h4>
            <p>Search by job title keywords just like Sales Navigator — but fully automated.</p>
          </div>
          <div className="ln-feature">
            <div className="feat-icon">&#128279;</div>
            <h4>Auto dedup</h4>
            <p>Never adds someone who's already in your CRM. Checks LinkedIn URL and email.</p>
          </div>
          <div className="ln-feature">
            <div className="feat-icon">&#128339;</div>
            <h4>Smart scheduling</h4>
            <p>Runs on the days and times you choose. Weekdays at 8 AM, or whatever works for your team.</p>
          </div>
          <div className="ln-feature">
            <div className="feat-icon">&#128260;</div>
            <h4>Contact refresh</h4>
            <p>Scans your existing CRM prospects and updates stale emails, phones, and job titles.</p>
          </div>
          <div className="ln-feature">
            <div className="feat-icon">&#128203;</div>
            <h4>Multi-config</h4>
            <p>Run different searches for different ICPs. One config for VPs, another for directors.</p>
          </div>
          <div className="ln-feature">
            <div className="feat-icon">&#128268;</div>
            <h4>Works with your stack</h4>
            <p>Lusha, Apollo, Hunter for enrichment. Outreach, HubSpot, Salesforce for CRM.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="ln-section fade-section" ref={addRef} id="pricing">
        <h2 className="ln-section-title">Simple pricing</h2>
        <div className="ln-pricing-wrap">
          <div className="ln-pricing">
            <div className="price">$149<span className="price-period">/month</span></div>
            <ul className="ln-pricing-features">
              <li><span className="check">&#10003;</span> Unlimited prospects</li>
              <li><span className="check">&#10003;</span> Unlimited configs</li>
              <li><span className="check">&#10003;</span> Auto dedup and enrichment</li>
              <li><span className="check">&#10003;</span> Smart scheduling</li>
              <li><span className="check">&#10003;</span> CRM contact refresh</li>
              <li><span className="check">&#10003;</span> All integrations included</li>
            </ul>
            <Link to="/signup" className="ln-btn ln-btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Start free</Link>
            <p className="note">No credit card required to start.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ln-footer">
        <span className="ln-nav-logo" style={{ fontSize: '0.9375rem' }}>Revara<span className="dot" /></span>
        <span>&copy; 2026 Revara</span>
        <div className="ln-footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
}
