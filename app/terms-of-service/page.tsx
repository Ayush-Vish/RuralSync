import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "RuralSync Terms of Service — please read these terms carefully before using our platform.",
};

export default function TermsOfServicePage() {
    return (
        <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
            <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
            <p className="text-sm text-gray-500 mb-10">Last updated: March 16, 2026</p>

            <section className="space-y-8 leading-relaxed">
                <div>
                    <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using <strong>RuralSync</strong> ("Platform"), you agree to be bound
                        by these Terms of Service and our{" "}
                        <Link href="/privacy-policy" className="text-blue-600 underline">
                            Privacy Policy
                        </Link>
                        . If you do not agree, please do not use the Platform.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
                    <p>
                        RuralSync is an online marketplace that connects clients seeking home and local services
                        with verified service providers and their agents. We facilitate discovery, booking, and
                        management of services but are not ourselves a service provider.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">3. Eligibility</h2>
                    <p>
                        You must be at least 13 years old to use RuralSync. By using the Platform, you
                        represent that you meet this requirement and that all information you provide is
                        accurate and current.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">4. User Accounts</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                        <li>You are responsible for all activities that occur under your account.</li>
                        <li>Notify us immediately if you suspect unauthorized access to your account.</li>
                        <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">5. Roles on the Platform</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li><strong>Clients:</strong> May browse, search, and book services offered by providers.</li>
                        <li><strong>Service Providers:</strong> May list their services, manage bookings, and invite agents to their organization.</li>
                        <li><strong>Agents:</strong> Operate under a service provider and may only join via an invitation link from a registered provider.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">6. Prohibited Conduct</h2>
                    <p>You agree not to:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                        <li>Provide false, misleading, or fraudulent information.</li>
                        <li>Use the Platform for any unlawful purpose.</li>
                        <li>Attempt to gain unauthorized access to other accounts or systems.</li>
                        <li>Post or transmit harmful, abusive, or offensive content.</li>
                        <li>Scrape or collect data from the Platform without our written permission.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">7. Bookings and Payments</h2>
                    <p>
                        Bookings made via RuralSync create a direct agreement between the client and the
                        service provider. RuralSync is not a party to this agreement and is not responsible
                        for the quality, safety, or legality of services rendered.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">8. Intellectual Property</h2>
                    <p>
                        All content on the Platform, including logos, design, and software, is the property
                        of RuralSync or its licensors and is protected by applicable intellectual property
                        laws. You may not reproduce or distribute any content without prior written permission.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">9. Disclaimer of Warranties</h2>
                    <p>
                        The Platform is provided on an "as is" and "as available" basis without warranties
                        of any kind, express or implied. We do not warrant that the Platform will be
                        uninterrupted, error-free, or free of viruses.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">10. Limitation of Liability</h2>
                    <p>
                        To the fullest extent permitted by law, RuralSync shall not be liable for any
                        indirect, incidental, special, consequential, or punitive damages arising from your
                        use of the Platform or any services booked through it.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">11. Termination</h2>
                    <p>
                        We may terminate or suspend your access to the Platform at any time, with or without
                        notice, for conduct that we believe violates these Terms or is harmful to other users,
                        us, or third parties.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">12. Governing Law</h2>
                    <p>
                        These Terms are governed by the laws of India. Any disputes shall be subject to the
                        exclusive jurisdiction of the courts located in India.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">13. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will notify you of
                        material changes by posting a notice on the Platform or sending an email. Continued
                        use of the Platform after changes constitutes your agreement to the updated Terms.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">14. Contact Us</h2>
                    <p>
                        If you have questions about these Terms, please contact us at:
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
                <Link href="/privacy-policy" className="text-blue-600 underline mr-4">
                    Privacy Policy
                </Link>
                <Link href="/" className="text-blue-600 underline">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
