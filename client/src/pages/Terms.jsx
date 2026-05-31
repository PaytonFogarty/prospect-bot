import { Link } from 'react-router-dom';

const EFFECTIVE_DATE = 'May 2026';

export default function Terms() {
  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>Revara</Link>
      </nav>

      <main style={styles.content}>
        <h1 style={styles.h1}>Terms of Service</h1>
        <p style={styles.effective}>Effective date: {EFFECTIVE_DATE}</p>

        <h2 style={styles.h2}>1. Acceptance of Terms</h2>
        <p style={styles.p}>
          These Terms of Service ("Terms") govern your access to and use of Revara (the "Service").
          By creating an account, subscribing, or otherwise using the Service, you agree to be bound
          by these Terms. If you do not agree, do not use the Service.
        </p>

        <h2 style={styles.h2}>2. Description of Service</h2>
        <p style={styles.p}>
          Revara is an automated B2B prospecting tool. It searches for prospects, filters them by
          your ideal customer profile, deduplicates against your CRM, enriches contact data using
          third-party enrichment tools you connect, and pushes net-new prospects into your CRM. The
          Service relies on the third-party accounts and credentials you provide.
        </p>

        <h2 style={styles.h2}>3. User Responsibilities</h2>
        <p style={styles.p}>You are responsible for your use of the Service. You represent and agree that:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>
            You have all necessary rights, licenses, and authorizations to use the CRM and
            enrichment accounts you connect, and to provide their credentials and API keys to us.
          </li>
          <li style={styles.li}>
            Your use of prospect and contact data complies with all applicable laws, including
            data protection and anti-spam laws, and with the terms of your connected providers.
          </li>
          <li style={styles.li}>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activity under your account.
          </li>
        </ul>

        <h2 style={styles.h2}>4. Payment Terms</h2>
        <p style={styles.p}>
          The Service is offered for <strong>$149 per month</strong>, billed monthly in advance
          through our payment processor, Stripe. Your subscription renews automatically each month
          until cancelled. You may <strong>cancel anytime</strong>; cancellation stops future
          renewals and your access continues through the end of the current billing period.
        </p>

        <h2 style={styles.h2}>5. No Refunds</h2>
        <p style={styles.p}>
          All payments are non-refundable. We do not provide refunds or credits for partial billing
          periods, unused time, or fees already paid, except where required by law.
        </p>

        <h2 style={styles.h2}>6. Limitation of Liability</h2>
        <p style={styles.p}>
          To the maximum extent permitted by law, Revara and its affiliates will not be liable for
          any indirect, incidental, special, consequential, or punitive damages, or any loss of
          profits, revenue, data, or goodwill, arising out of or related to your use of the Service.
          Our total liability for any claim relating to the Service will not exceed the amount you
          paid us in the twelve (12) months preceding the event giving rise to the claim. The
          Service is provided "as is" without warranties of any kind.
        </p>

        <h2 style={styles.h2}>7. Prohibited Uses</h2>
        <p style={styles.p}>You agree not to:</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Use the Service for any unlawful, fraudulent, or abusive purpose.</li>
          <li style={styles.li}>Send spam or unsolicited communications in violation of applicable law.</li>
          <li style={styles.li}>Attempt to access, reverse engineer, or disrupt the Service or its infrastructure.</li>
          <li style={styles.li}>Use the Service in violation of the terms of any connected CRM or enrichment provider.</li>
          <li style={styles.li}>Resell or provide access to the Service without our authorization.</li>
        </ul>

        <h2 style={styles.h2}>8. Termination</h2>
        <p style={styles.p}>
          You may stop using the Service and cancel your subscription at any time. We may suspend or
          terminate your access if you breach these Terms, fail to pay, or use the Service in a way
          that may cause harm or legal liability. Upon termination, your right to use the Service
          ceases immediately.
        </p>

        <h2 style={styles.h2}>9. Governing Law</h2>
        <p style={styles.p}>
          These Terms are governed by the laws of the State of Delaware, without regard to its
          conflict-of-laws principles. You agree to the exclusive jurisdiction of the state and
          federal courts located in Delaware for any disputes arising out of these Terms.
        </p>

        <h2 style={styles.h2}>10. Contact Us</h2>
        <p style={styles.p}>
          Questions about these Terms can be sent to{' '}
          <a href="mailto:legal@revara.ai" style={styles.link}>legal@revara.ai</a>.
        </p>

        <p style={styles.footerNote}>
          See also our <Link to="/privacy" style={styles.link}>Privacy Policy</Link>.
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
  logo: { fontWeight: 700, fontSize: '1.25rem', color: '#4f46e5', textDecoration: 'none' },
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
