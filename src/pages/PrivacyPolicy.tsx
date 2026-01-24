import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/more">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-primary/10">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold font-poem text-foreground">
              Your Privacy Matters
            </h2>
            <p className="text-muted-foreground">
              Effective Date: January 1, {new Date().getFullYear()}
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">1. Introduction</h3>
            <p className="text-muted-foreground leading-relaxed">
              WordStack ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">2. Information We Collect</h3>
            <div className="text-muted-foreground leading-relaxed space-y-3">
              <p><strong className="text-foreground">Information You Provide:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Account information (email, username, display name)</li>
                <li>Profile information (bio, avatar, links)</li>
                <li>Content you create (poems, comments)</li>
                <li>Communications with us</li>
              </ul>
              
              <p><strong className="text-foreground">Information Collected Automatically:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (pages visited, features used)</li>
                <li>Log data (IP address, access times)</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h3>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Create and manage your account</li>
                <li>Display your content to other users</li>
                <li>Send you notifications and updates</li>
                <li>Respond to your requests and support needs</li>
                <li>Analyze usage patterns to improve the platform</li>
                <li>Detect, prevent, and address security issues</li>
                <li>Enforce our Terms of Service and Community Guidelines</li>
              </ul>
            </div>
          </section>

          {/* Sharing Information */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">4. Sharing Your Information</h3>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>We may share your information in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong className="text-foreground">Public Content:</strong> Your poems, profile, and comments are visible to other users</li>
                <li><strong className="text-foreground">Service Providers:</strong> With third parties who help us operate the platform</li>
                <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale</li>
              </ul>
              <p>
                We do not sell your personal information to third parties.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">5. Data Retention</h3>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. If you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it by law.
            </p>
          </section>

          {/* Your Rights */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">6. Your Rights</h3>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your personal information</li>
                <li>Export your data in a portable format</li>
                <li>Object to certain processing of your information</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us at the email below.
              </p>
            </div>
          </section>

          {/* Security */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">7. Security</h3>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">8. Children's Privacy</h3>
            <p className="text-muted-foreground leading-relaxed">
              WordStack is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected such information, we will take steps to delete it promptly.
            </p>
          </section>

          {/* International Transfers */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">9. International Transfers</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable laws.
            </p>
          </section>

          {/* Cookies */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">10. Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. You can manage cookie preferences through your browser settings, though some features may not function properly without cookies.
            </p>
          </section>

          {/* Changes */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">11. Changes to This Policy</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the platform or sending you an email. Your continued use of WordStack after changes take effect constitutes acceptance.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-xl bg-card border border-border space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
            <p className="text-muted-foreground text-sm">
              If you have questions about this Privacy Policy or our data practices, please contact us at{' '}
              <a href="mailto:privacy@wordstack.app" className="text-primary hover:underline">
                privacy@wordstack.app
              </a>
            </p>
          </section>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            Last updated: January 1, {new Date().getFullYear()}
          </p>
        </motion.div>
      </main>
    </div>
  );
}
