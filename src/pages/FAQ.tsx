import React from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: "What is Spendify Guru?",
    answer: "Spendify Guru is a powerful financial management tool designed to help you analyze, understand, and optimize your spending habits. It uses advanced AI and machine learning to provide personalized insights into your financial data."
  },
  {
    question: "How does Spendify Guru analyze my financial data?",
    answer: "Our AI-powered system automatically categorizes your transactions, identifies spending patterns, and provides actionable insights. You can upload your financial statements, and our system will process them securely and efficiently."
  },
  {
    question: "Is my financial data secure?",
    answer: "Absolutely! We take security very seriously. Your data is encrypted both in transit and at rest. We follow industry best practices for data protection and never share your information without your explicit consent."
  },
  {
    question: "What types of financial statements can I upload?",
    answer: "You can upload various types of financial statements including bank statements, credit card statements, and investment account statements. We support multiple formats including PDF, CSV, and Excel files."
  },
  {
    question: "How often should I upload my financial statements?",
    answer: "For the best results, we recommend uploading your statements monthly. However, you can upload them as frequently as you like. Our system will automatically process and analyze your data."
  },
  {
    question: "What kind of insights will I get from Spendify Guru?",
    answer: "You'll receive detailed insights about your spending patterns, budget adherence, savings opportunities, and investment performance. Our AI will help you identify areas where you can optimize your finances."
  },
  {
    question: "Can I set financial goals in Spendify Guru?",
    answer: "Yes! Our financial goals feature allows you to set and track your personal financial objectives. Whether it's saving for a house, paying off debt, or building an emergency fund, we'll help you stay on track."
  },
  {
    question: "What is the AI Financial Advisor feature?",
    answer: "Our AI Financial Advisor provides personalized financial advice based on your specific situation. It analyzes your spending patterns and suggests ways to improve your financial health."
  },
  {
    question: "How do I create a budget with Spendify Guru?",
    answer: "Our budgeting tool lets you create custom budgets for different categories. You can set monthly limits and track your progress in real-time. Our system will alert you if you're approaching your limits."
  },
  {
    question: "Can I share my financial insights with others?",
    answer: "Yes, you can share specific insights and reports with trusted individuals. This is particularly useful for couples or business partners who want to manage finances together."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription at any time through your account settings. Simply go to the subscription management page and follow the cancellation process."
  },
  {
    question: "What happens to my data if I cancel my subscription?",
    answer: "Your data remains safe and accessible for 30 days after cancellation. After that period, your data will be securely deleted from our servers unless you choose to download it first."
  },
  {
    question: "How do I contact support if I have questions?",
    answer: "You can reach our support team through the contact form on our website or by emailing support@spendifyguru.com. We're here to help you with any questions about the app."
  },
  {
    question: "What devices can I use Spendify Guru on?",
    answer: "Spendify Guru is a web application that works on any device with a modern web browser. Whether you're using a desktop computer, laptop, tablet, or smartphone, you can access all features."
  },
  {
    question: "How do I update my payment information?",
    answer: "You can update your payment information through your account settings page. Simply navigate to the payment section and follow the prompts to add or update your payment method."
  },
  {
    question: "What happens if I exceed my storage limit?",
    answer: "If you exceed your storage limit, you'll need to either upgrade to a higher subscription plan or delete some older financial data. We'll notify you well in advance if you're approaching your limit."
  },
  {
    question: "Is Spendify Guru suitable for businesses?",
    answer: "Absolutely! While our app is great for personal finance management, it's also well-suited for small businesses. Our features can help you manage business expenses, track revenue, and optimize cash flow."
  }
];

export default function FAQ() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-4">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:underline mb-4 -mt-8">
        ← Back to Home
      </Link>

      <h1 className="text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-indigo-500 via-pink-500 to-emerald-500 bg-clip-text text-transparent">
        Frequently Asked Questions
      </h1>

      <div className="space-y-8">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">{faq.question}</h2>
            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
