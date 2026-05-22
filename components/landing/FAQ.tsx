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
    <section className="py-24 border-t border-border/20 relative">
      <div className="mx-auto max-w-4xl px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-2.5 py-0.5 text-xs font-semibold text-foreground mb-4">
            <HelpCircle className="h-3.5 w-3.5 text-accent" />
            Support Helpdesk
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            Everything you need to know about SnapHost. Can&apos;t find the answer you&apos;re looking for? Reach out to support.
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
