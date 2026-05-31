import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const EFFECTIVE_DATE = 'May 2026';

export default function Privacy() {
  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}><Logo /></Link>
      </nav>

      <main style={styles.content}>
        <h1 style={styles.h1}>Privacy Policy</h1>
        <p style={styles.effective}>Effective date: {EFFECTIVE_DATE}</p>

        <p style={styles.p}>
          This Privacy Policy explains how Revara ("we", "us", or "our") collects, uses, and
          shares information when you use our automated B2B prospecting service (the "Service").
          By using the Service, you agree to the practices described below.
        </p>

        <h2 style={styles.h2}>1. Information We Collect</h2>
        <p style={styles.p}>We collect the following categories of information:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <strong>Account information.</strong> Your email address and the credentials you use
            to sign in.
          </li>
          <li style={styles.li}>
            <strong>Payment information.</strong> Billing details needed to process your
            subscription. Card data is collected and stored by our payment processor, Stripe; we
            do not store your full card number on our servers.
          </li>
          <li style={styles.li}>
            <strong>CRM data.</strong> Information from the CRM and prospecting accounts you
            connect, including contacts, prospects, and records that flow through the Service so we
            can deduplicate, enrich, and sync them on your behalf.
          </li>
          <li style={styles.li}>
            <strong>Usage data.</strong> Technical and usage information such as log data, device
            and browser details, and how you interact with the Service.
          </li>
        </ul>

        <h2 style={styles.h2}>2. How We Use Your Information</h2>
        <p style={styles.p}>We use the information we collect to:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Provide, operate, and maintain the Service, including running your prospecting and enrichment workflows.</li>
          <li style={styles.li}>Process payments and manage your subscription and billing.</li>
          <li style={styles.li}>Analyze usage to monitor, troubleshoot, and improve the Service.</li>
          <li style={styles.li}>Communicate with you about your account, security, and updates.</li>
        </ul>

        <h2 style={styles.h2}>3. How We Share Your Information</h2>
        <p style={styles.p}>
          We do not sell your personal information. We share information only with the following
          third parties:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>
            <strong>Stripe</strong> — to process payments and manage subscriptions.
          </li>
          <li style={styles.li}>
            <strong>Enrichment tools (e.g., Lusha, Apollo, Hunter)</strong> — to look up and enrich
            prospect data, only as directed by you through the integrations you connect.
          </li>
          <li style={styles.li}>
            <strong>CRM providers (e.g., Outreach, HubSpot, Salesforce)</strong> — to read from and
            write prospects to your CRM, only as directed by you through the integrations you connect.
          </li>
        </ul>
        <p style={styles.p}>
          We may also disclose information if required by law or to protect the rights, property, or
          safety of Revara, our users, or others.
        </p>

        <h2 style={styles.h2}>4. Data Retention</h2>
        <p style={styles.p}>
          We retain your information for as long as your account is active or as needed to provide
          the Service. When you close your account, we delete or anonymize your personal information
          within a reasonable period, except where we are required to retain it to comply with legal
          obligations, resolve disputes, or enforce our agreements.
        </p>

        <h2 style={styles.h2}>5. Your Rights</h2>
        <p style={styles.p}>
          Depending on your location, you may have the right to access, correct, export, or delete
          the personal information we hold about you, and to object to or restrict certain
          processing. You can exercise these rights, or withdraw consent where applicable, by
          contacting us at the address below. We will respond consistent with applicable law.
        </p>

        <h2 style={styles.h2}>6. Contact Us</h2>
        <p style={styles.p}>
          If you have questions about this Privacy Policy or your data, contact us at{' '}
          <a href="mailto:privacy@revara.ai" style={styles.link}>privacy@revara.ai</a>.
        </p>

        <p style={styles.footerNote}>
          See also our <Link to="/terms" style={styles.link}>Terms of Service</Link>.
        </p>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#ffffff', color: '#1a1a2e' },
  nav: {
    display: 'flex',
    alignItems: 'center',
    height: 64,
    padding: '0 2rem',
    borderBottom: '1px solid #e5e7eb',
  },
  logo: { display: 'inline-flex', alignItems: 'center', textDecoration: 'none' },
  content: { maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem 5rem' },
  h1: { fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' },
  effective: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' },
  h2: { fontSize: '1.25rem', fontWeight: 700, margin: '2rem 0 0.75rem' },
  p: { fontSize: '1rem', lineHeight: 1.7, color: '#374151', margin: '0 0 1rem' },
  ul: { margin: '0 0 1rem', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  li: { fontSize: '1rem', lineHeight: 1.7, color: '#374151' },
  link: { color: '#4f46e5', textDecoration: 'underline' },
  footerNote: { marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.875rem' },
};
