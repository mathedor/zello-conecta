import { auth } from '@/lib/auth';
import { SearchHero } from '@/components/sections/search-hero';
import { CategoriesSection } from '@/components/sections/categories';
import { WhyZelloSection } from '@/components/sections/why-zello';
import { HowItWorksSection } from '@/components/sections/how-it-works';
import { ForProfessionalsSection } from '@/components/sections/for-professionals';
import { FaqSection } from '@/components/sections/faq';
import { CtaFinalSection } from '@/components/sections/cta-final';

export default async function HomePage() {
  const session = await auth();
  const isLogged = !!session?.user;

  if (isLogged) {
    return (
      <main>
        <SearchHero />
      </main>
    );
  }

  return (
    <main>
      <SearchHero />
      <CategoriesSection />
      <WhyZelloSection />
      <HowItWorksSection />
      <ForProfessionalsSection />
      <FaqSection />
      <CtaFinalSection />
    </main>
  );
}
