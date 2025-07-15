import Header from './Header';
import Hero from './Hero';
import FeaturesSection from './FeaturesSection';
import UseCasesSection from './UseCasesSection';
import CodeSnippetSection from './CodeSnippetSection';
import TestimonialsSection from './TestimonialsSection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <FeaturesSection />
      <UseCasesSection />
      <CodeSnippetSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
