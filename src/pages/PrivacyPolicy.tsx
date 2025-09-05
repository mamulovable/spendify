import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">Spendify Privacy Policy</h1>
          <p className="text-gray-600 mb-6">Last updated: 5 september 2025</p>

          <p className="mb-4">
            At Spendify, your privacy is our top priority. We understand that your financial data is highly sensitive, and we are committed to protecting it. This Privacy Policy explains what information we collect, how we use it, and the choices you have.
          </p>

          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="mb-4">
            We only collect the minimum data necessary for Spendify to function:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li><strong>Uploaded Files:</strong> PDF, CSV, or TXT statements you choose to upload.</li>
            <li><strong>Account Information:</strong> Name, email address, and login credentials.</li>
            <li><strong>Usage Data:</strong> Non-identifiable analytics about how you use Spendify (e.g., pages visited, errors encountered) to improve performance.</li>
          </ul>
          <p className="font-semibold mb-4">
            👉 We never request or store your online banking credentials.
          </p>

          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Data</h2>
          <p className="mb-4">
            We use your data strictly to provide the Spendify service:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Parse and categorize transactions from uploaded files.</li>
            <li>Generate insights, reports, and financial advice.</li>
            <li>Provide customer support when you request it.</li>
            <li>Improve product performance and reliability.</li>
          </ul>
          <p className="font-semibold mb-4">
            We do not sell, rent, or share your personal or financial data with third parties.
          </p>

          <h2 className="text-2xl font-semibold mb-3">3. Data Storage & Security</h2>
          <ul className="list-disc list-inside mb-4">
            <li>All uploaded files are encrypted in transit (TLS) and at rest (AES-256).</li>
            <li>Files are processed securely and stored only as long as necessary for your account.</li>
            <li>You may delete uploads or your account at any time, and all associated data will be permanently erased.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-3">4. Third-Party Services</h2>
          <p className="mb-4">
            Spendify may use trusted third-party services (such as hosting providers or analytics tools) to operate. These providers are contractually bound to protect your information and cannot use it for their own purposes.
          </p>

          <h2 className="text-2xl font-semibold mb-3">5. Cookies & Analytics</h2>
          <p className="mb-4">
            We may use cookies for login sessions and analytics. These are anonymous and never contain sensitive financial information.
          </p>

          <h2 className="text-2xl font-semibold mb-3">6. Your Rights</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Access and download your data.</li>
            <li>Request corrections or deletion.</li>
            <li>Withdraw consent and close your account at any time.</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-3">7. Children’s Privacy</h2>
          <p className="mb-4">
            Spendify is not intended for individuals under 18 years old. We do not knowingly collect data from children.
          </p>

          <h2 className="text-2xl font-semibold mb-3">8. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy to reflect improvements or legal requirements. When updates occur, we will notify users via email or dashboard notification.
          </p>

          <h2 className="text-2xl font-semibold mb-3">9. Contact Us</h2>
          <p>
            If you have questions or concerns about your privacy, please contact us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
