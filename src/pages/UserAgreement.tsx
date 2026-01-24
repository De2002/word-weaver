import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function UserAgreement() {
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
          <h1 className="text-lg font-semibold text-foreground">User Agreement</h1>
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
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold font-poem text-foreground">
              Terms of Service
            </h2>
            <p className="text-muted-foreground">
              Effective Date: January 1, {new Date().getFullYear()}
            </p>
          </div>

          {/* Introduction */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">1. Introduction</h3>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to WordStack. By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms"). Please read them carefully. If you do not agree to these Terms, you may not use our services.
            </p>
          </section>

          {/* Eligibility */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">2. Eligibility</h3>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 13 years old to use WordStack. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf. By using WordStack, you represent that you meet these requirements.
            </p>
          </section>

          {/* Account */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">3. Your Account</h3>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide accurate and complete information when creating your account</li>
                <li>Keep your login credentials secure and confidential</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Not share your account or allow others to access it</li>
              </ul>
            </div>
          </section>

          {/* User Content */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">4. User Content</h3>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>
                <strong className="text-foreground">Ownership:</strong> You retain all rights to the poetry and content you post on WordStack. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on our platform.
              </p>
              <p>
                <strong className="text-foreground">Responsibility:</strong> You are solely responsible for the content you post. You represent that you own or have the rights to share all content you submit.
              </p>
              <p>
                <strong className="text-foreground">Prohibited Content:</strong> You agree not to post content that violates our Community Guidelines, infringes on others' rights, or is illegal.
              </p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">5. Acceptable Use</h3>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use automated systems to access the platform without permission</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the platform</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">6. Intellectual Property</h3>
            <p className="text-muted-foreground leading-relaxed">
              The WordStack platform, including its design, features, and content (excluding user-generated content), is owned by WordStack and protected by intellectual property laws. You may not copy, modify, or distribute our platform or its contents without permission.
            </p>
          </section>

          {/* Termination */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">7. Termination</h3>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violations of these Terms or our Community Guidelines. You may also delete your account at any time through your account settings.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">8. Disclaimers</h3>
            <p className="text-muted-foreground leading-relaxed">
              WordStack is provided "as is" without warranties of any kind. We do not guarantee that the platform will be uninterrupted, secure, or error-free. We are not responsible for any user-generated content or interactions between users.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">9. Limitation of Liability</h3>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, WordStack shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.
            </p>
          </section>

          {/* Changes */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">10. Changes to Terms</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify you of significant changes by posting a notice on the platform or sending you an email. Your continued use of WordStack after changes take effect constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-xl bg-card border border-border space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Contact Us</h3>
            <p className="text-muted-foreground text-sm">
              If you have questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@wordstack.app" className="text-primary hover:underline">
                legal@wordstack.app
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
