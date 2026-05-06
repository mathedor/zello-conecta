import { HeroSection } from '@/components/sections/hero';
import { WhyZelloSection } from '@/components/sections/why-zello';
import { CategoriesSection } from '@/components/sections/categories';
import { HowItWorksSection } from '@/components/sections/how-it-works';
import { ForProfessionalsSection } from '@/components/sections/for-professionals';
import { FaqSection } from '@/components/sections/faq';
import { CtaFinalSection } from '@/components/sections/cta-final';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <WhyZelloSection />
      <CategoriesSection />
      <HowItWorksSection />
      <ForProfessionalsSection />
      <FaqSection />
      <CtaFinalSection />
    </main>
  );
}
