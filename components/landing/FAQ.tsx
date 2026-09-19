'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqs, type FAQItem } from '@/data/faq';
import Container from '@/components/shared/Container';
import SectionHeading from '@/components/shared/SectionHeading';
import Reveal from '@/components/motion/Reveal';

export default function FAQ({
  items = faqs,
  title = 'Frequently asked questions',
  description = 'Everything you need to know about uploading, link formats, and account tools.',
}: {
  items?: FAQItem[];
  title?: string;
  description?: string;
}) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleIndex = (index: number) => {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };

  return (
    <section id="faq" className="py-20 sm:py-24 border-t border-border/50 relative scroll-mt-16">
      <Container>
        <div className="mb-14">
          <SectionHeading title={title} description={description} />
        </div>

        <div className="space-y-3">
          {items.map((faq, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <Reveal key={index} delay={index * 0.04}>
                <div
                  className="overflow-hidden rounded-4xl border border-border/60 bg-card/95 px-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] transition-all duration-200 sm:bg-card/80 sm:backdrop-blur-xl"
                >
                  <button
                    onClick={() => toggleIndex(index)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left font-semibold text-sm md:text-base text-foreground transition-colors focus:outline-none cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-foreground' : ''}`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-250 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 border-t border-border/50' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="py-5 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

      </Container>
    </section>
  );
}
