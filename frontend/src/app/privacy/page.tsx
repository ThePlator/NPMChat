import React from "react"
import Footer from "../../components/Home/Footer"

export const metadata = {
  title: "Privacy Policy - NPMChat",
  description: "Privacy policy for NPMChat application",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg border-2 border-black dark:border-zinc-700">
          <h1 className="text-4xl font-bold mb-6 text-center text-black dark:text-white">
            Privacy Policy
          </h1>
          <p className="mb-4 text-black dark:text-zinc-200">
            Last updated: August 1, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              1. Information We Collect
            </h2>
            <p className="mb-4 text-black dark:text-zinc-200">
              We collect information that you provide directly to us, such as
              when you create an account, update your profile, or communicate
              with us. This may include your name, email address, and any other
              information you choose to provide.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              2. How We Use Your Information
            </h2>
            <p className="mb-4 text-black dark:text-zinc-200">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-black dark:text-zinc-200">
              <li>Provide, maintain, and improve our services</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              3. Information Sharing
            </h2>
            <p className="mb-4 text-black dark:text-zinc-200">
              We do not share your personal information with third parties
              except as described in this Privacy Policy or with your consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              4. Security
            </h2>
            <p className="mb-4 text-black dark:text-zinc-200">
              We take reasonable measures to help protect your personal
              information from loss, theft, misuse, and unauthorized access,
              disclosure, alteration, and destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
              5. Changes to This Policy
            </h2>
            <p className="text-black dark:text-zinc-200">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
