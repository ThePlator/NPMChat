import React from 'react';
import Footer from '../../components/Home/Footer';

export const metadata = {
  title: 'License - NPMChat',
  description: 'License information for NPMChat application',
};

export default function LicensePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-black">
          <h1 className="text-4xl font-bold mb-6 text-center">MIT License</h1>
          
          <div className="mb-8">
            <p className="mb-4">
              Copyright (c) 2025 NPMChat
            </p>
            <p className="mb-4">
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the "Software"), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>
            <p className="mb-4">
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
            </p>
            <p className="mb-4">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
              SOFTWARE.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Attribution</h2>
            <p className="mb-4">
              This project uses the following open source software and resources:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <a 
                  href="https://nextjs.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Next.js
                </a> - The React Framework for the Web
              </li>
              <li>
                <a 
                  href="https://tailwindcss.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Tailwind CSS
                </a> - A utility-first CSS framework
              </li>
              <li>
                <a 
                  href="https://lucide.dev/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Lucide Icons
                </a> - Beautiful & consistent icon toolkit
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
