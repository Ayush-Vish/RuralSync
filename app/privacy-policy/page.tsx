import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "RuralSync Privacy Policy — learn how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
    return (
        <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
            <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mb-10">Last updated: March 16, 2026</p>

            <section className="space-y-8 leading-relaxed">
                <div>
                    <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                    <p>
                        Welcome to <strong>RuralSync</strong> ("we", "our", or "us"). We are committed to protecting
                        your personal information and your right to privacy. This Privacy Policy explains how we
                        collect, use, disclose, and safeguard your information when you use our platform.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
                    <p>We may collect the following types of information:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                        <li><strong>Account Information:</strong> Name, email address, and profile picture — collected when you register or sign in with Google.</li>
                        <li><strong>Usage Data:</strong> Pages visited, services searched, bookings made, and other interactions with the platform.</li>
                        <li><strong>Location Data:</strong> City or region you select to find local services.</li>
                        <li><strong>Device Info:</strong> IP address, browser type, and operating system for security and analytics purposes.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>To create and manage your account.</li>
                        <li>To facilitate bookings between clients and service providers.</li>
                        <li>To send transactional emails (booking confirmations, invitations).</li>
                        <li>To improve platform features and user experience.</li>
                        <li>To detect and prevent fraudulent or unauthorized activity.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">4. Google Sign-In</h2>
                    <p>
                        We use Google OAuth 2.0 for authentication. When you sign in with Google, we receive
                        your name, email address, and profile picture from Google. We do not receive or store
                        your Google password. Your use of Google Sign-In is also subject to{" "}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >
                            Google's Privacy Policy
                        </a>
                        .
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">5. Data Sharing</h2>
                    <p>
                        We do not sell your personal data. We may share data with:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                        <li>Service providers on our platform who fulfil your bookings.</li>
                        <li>Third-party services (email delivery, analytics) under strict data processing agreements.</li>
                        <li>Law enforcement or government authorities when required by law.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">6. Data Retention</h2>
                    <p>
                        We retain your data for as long as your account is active or as required to provide
                        services. You can request deletion of your account and associated data at any time.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Access the personal data we hold about you.</li>
                        <li>Request correction of inaccurate data.</li>
                        <li>Request deletion of your account and data.</li>
                        <li>Withdraw consent for optional data processing at any time.</li>
                    </ul>
                    <p className="mt-2">
                        To exercise these rights, contact us at{" "}
                        <a href="mailto:support@ruralsync.in" className="text-blue-600 underline">
                            support@ruralsync.in
                        </a>
                        .
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">8. Cookies</h2>
                    <p>
                        We use cookies and similar technologies to keep you logged in, remember your
                        preferences, and understand how you use our platform. You can configure your browser
                        to reject cookies, but some features may not work correctly.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">9. Security</h2>
                    <p>
                        We implement industry-standard security measures including encrypted tokens, HTTPS,
                        and access controls. However, no method of transmission over the internet is 100%
                        secure, and we cannot guarantee absolute security.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">10. Children's Privacy</h2>
                    <p>
                        RuralSync is not intended for users under the age of 13. We do not knowingly collect
                        personal data from children.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">11. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy periodically. We will notify you of significant
                        changes by email or a prominent notice on our platform. Continued use after changes
                        constitutes acceptance.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">12. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, please contact us at:
                    </p>
                    <address className="not-italic mt-2 text-gray-700">
                        <strong>RuralSync</strong><br />
                        Email:{" "}
                        <a href="mailto:support@ruralsync.in" className="text-blue-600 underline">
                            support@ruralsync.in
                        </a>
                    </address>
                </div>
            </section>

            <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
                <Link href="/terms-of-service" className="text-blue-600 underline mr-4">
                    Terms of Service
                </Link>
                <Link href="/" className="text-blue-600 underline">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
