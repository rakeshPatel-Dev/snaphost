'use client';

import { Button } from '@/components/ui/button';
import { BsGithub, BsTwitter } from 'react-icons/bs';
import React from 'react';

const socials = [
  { icon: BsGithub, href: 'https://github.com/snaphost', label: 'GitHub' },
  { icon: BsTwitter, href: 'https://twitter.com/snaphost', label: 'Twitter' },
];

export default function SocialButtons({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1 mt-1">
        {socials.map(({ icon: Icon, href, label }) => (
          <Button key={label} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
              <Icon className="h-4 w-4" />
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
