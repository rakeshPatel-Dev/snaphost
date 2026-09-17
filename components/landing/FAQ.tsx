'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqs } from '@/data/faq';

export default function FAQ() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleIndex = (index: number) => {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };

  return (
    <section id="faq" className="py-24 border-t border-border/20 relative scroll-mt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        
        <div className="text-left max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3.5 py-1 text-xs font-medium text-foreground mb-5">
            <HelpCircle className="h-3.5 w-3.5 text-accent" />
            <span>Common questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Everything you need to know about SnapHost&apos;s new upload flow, link formats, and account tools.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <div 
                key={index} 
                className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold text-sm md:text-base text-foreground hover:bg-muted/30 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-foreground' : ''}`} 
                  />
                </button>
                
                {/* Accordion Content with smooth height transition simulation */}
                <div 
                  className={`grid transition-all duration-250 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 border-t border-border/50' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="p-5 text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
