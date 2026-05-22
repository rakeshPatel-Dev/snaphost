'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

type FAQItem = {
  q: string;
  a: string;
};

const faqs: FAQItem[] = [
  { 
    q: 'Do I need an account to upload files?', 
    a: 'No, you can upload and share files anonymously right away. Anonymous uploads have a file size limit of 10MB and are automatically deleted after 7 days. Creating a free account lets you manage your files, track views, set passwords, and customize expiration times.' 
  },
  { 
    q: 'What is the upload size limit for files?', 
    a: 'Anonymous users can upload images up to 10MB and PDFs up to 25MB. Free account users get 25MB for images and 50MB for PDFs. Developer and Enterprise tiers support up to 500MB per file with customizable block-storage limits.' 
  },
  { 
    q: 'Can I hotlink images directly in my apps?', 
    a: 'Absolutely. Every uploaded image is optimized (converted to WebP/AVIF if supported by the browser) and cached on our global Edge CDN. You can use the generated link directly inside `<img>` tags, markdown files, or website builders for instant loading.' 
  },
  { 
    q: 'How does S3-compatible storage work?', 
    a: 'SnapHost provides an S3-compatible API. This means you can keep using your existing AWS SDKs, client libraries, or integrations (like carrierwave, shrine, or django-storages) by simply swapping the endpoint URL and adding your SnapHost credentials.' 
  },
  { 
    q: 'Can files be deleted automatically after download?', 
    a: 'Yes, SnapHost supports one-time viewing links. When configuring an upload, you can set the expiration to "Delete on first download". Once the recipient opens the link, the file is securely wiped from our storage and CDN nodes.' 
  },
  { 
    q: 'Do you offer a self-hosted option?', 
    a: 'SnapHost is primarily a managed cloud platform. However, we support data residency compliance, allowing you to back up your uploads automatically to your own S3 bucket, Google Cloud Storage, or Azure Blob Storage.' 
  },
];

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
            Everything you need to know about SnapHost. Can't find the answer you're looking for? Reach out to support.
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
