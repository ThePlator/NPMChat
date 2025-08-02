export default function TermsPage() {
  return (
    <>
      <style>{`
        .terms-container {
          padding: 3rem 2rem;
          max-width: 900px;
          margin: 3rem auto;
          line-height: 1.8;
          font-family: 'Inter', sans-serif;
          color: #111;
          background-color: #fff;
          border: 3px solid #000;
          box-shadow: 8px 8px 0 #7c3aed;
          border-radius: 12px;
          animation: fadeInUp 1s ease-in-out;
        }

        .terms-container h1 {
          font-size: 3.2rem;
          font-weight: 900;
          color: #7c3aed;
          margin-bottom: 1.5rem;
          text-align: center;
          animation: textPop 0.7s ease-out;
          letter-spacing: -1px;
        }

        .terms-container p,
        .terms-container li {
          font-size: 1.15rem;
          color: #333;
          margin-bottom: 1.2rem;
          transition: color 0.3s ease;
        }

        .terms-container p:hover {
          color: #000;
        }

        .terms-container h2 {
          font-size: 1.8rem;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: #16a34a;
          position: relative;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #16a34a;
          animation: slideInLeft 0.5s ease forwards;
        }

        .terms-container h2:hover {
          color: #15803d;
          border-bottom-color: #15803d;
          cursor: pointer;
        }

        a {
          color: #1e40af;
          text-decoration: underline;
          transition: color 0.3s ease, background-color 0.3s ease;
        }

        a:hover {
          color: #4338ca;
          background-color: #f0f0ff;
        }

        @media screen and (max-width: 768px) {
          .terms-container {
            padding: 2rem 1rem;
            border-width: 2px;
            box-shadow: 6px 6px 0 #7c3aed;
          }

          .terms-container h1 {
            font-size: 2.4rem;
          }

          .terms-container h2 {
            font-size: 1.5rem;
          }

          .terms-container p {
            font-size: 1.05rem;
          }
        }

        @keyframes fadeInUp {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0px);
            opacity: 1;
          }
        }

        @keyframes textPop {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0%);
            opacity: 1;
          }
        }
      `}</style>

      <main className="terms-container">
        <h1>Terms of Service</h1>
        <p><strong>Last Updated:</strong> July 31, 2025</p>

        <p>
          Welcome to NPMChat! These Terms of Service ("Terms") govern your access to and use of the NPMChat website,
          applications, and services (collectively, the "Service"). By accessing or using the Service, you agree to be
          bound by these Terms and our Privacy Policy. If you do not agree to these Terms, do not use our Service.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>By creating an account, accessing, or using the Service, you confirm your agreement to be bound by these Terms.</p>
        <p>
          We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms
          on the Service or by sending you an email. Your continued use of the Service after such changes constitutes your
          acceptance of the new Terms.
        </p>

        <h2>2. Eligibility and User Accounts</h2>
        <p>You must be at least 13 years old to use the Service.</p>
        <p>
          You are responsible for maintaining the confidentiality of your account password and for all activities that
          occur under your account. You agree to notify us immediately of any unauthorized use of your password or account.
        </p>
        <p>You must provide accurate and complete registration information.</p>

        <h2>3. Your Content and Conduct</h2>
        <p>
          <strong>Definition of Content:</strong> "Content" refers to any data, text, files, information, usernames,
          profiles, audio, photos, graphics, images, video, code, or other materials that you post, upload, publish,
          display, link to, or otherwise make available on the Service.
        </p>
        <p><strong>Responsibility for Content:</strong> You are solely responsible for the Content you create, upload, post, or share on NPMChat.</p>
        <p>
          <strong>Prohibited Conduct and Content:</strong> You agree not to post or share any content that is unlawful,
          harmful, abusive, infringes on rights, spreads malware, spams others, impersonates anyone, shares private info
          without consent, or promotes illegal activity.
        </p>
        <p><strong>Regarding Code:</strong> Do not share or run malicious code or misuse the platform’s code features.</p>
        <p><strong>Our Right to Monitor:</strong> We may monitor and remove content at our discretion.</p>

        <h2>4. Licenses to Your Content</h2>
        <p>
          By submitting Content, you grant NPMChat a worldwide, non-exclusive, royalty-free, transferable, sublicensable
          license to use and distribute it for the purpose of operating and improving the Service.
        </p>

        <h2>5. Intellectual Property</h2>
        <p>All rights, title, and interest in the Service (excluding user Content) belong to NPMChat and its licensors. You may not use our branding without permission.</p>

        <h2>6. Code Execution and Collaborative Tools</h2>
        <p>
          Collaborative coding and file sharing are for learning and dev purposes only. Don’t misuse code execution features
          or attempt unauthorized access.
        </p>

        <h2>7. Third-Party Links and Services</h2>
        <p>We may link to third-party sites. We’re not responsible for their content or policies.</p>

        <h2>8. Termination</h2>
        <p>
          We may suspend or terminate your account for any reason, especially for violating these Terms. You may also delete
          your account at any time.
        </p>

        <h2>9. Disclaimers and Limitation of Liability</h2>
        <p>
          The Service is provided “as is.” We are not liable for indirect damages, including data loss or inability to access
          the Service.
        </p>

        <h2>10. Governing Law</h2>
        <p>These Terms are governed by the laws of your country/state (e.g., India or United States).</p>

        <h2>11. Severability</h2>
        <p>If any part of the Terms is held invalid, the rest remain effective.</p>

        <h2>12. Entire Agreement</h2>
        <p>These Terms replace any prior agreements between us about the Service.</p>

        <h2>13. Contact Us</h2>
        <p>
          If you have questions, contact us at{' '}
          <a href="mailto:support@npmchat.com">
            support@npmchat.com
          </a>{' '}
          or via our Contact page.
        </p>
      </main>
    </>
  );
}
