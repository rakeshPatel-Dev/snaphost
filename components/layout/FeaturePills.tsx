'use client';

import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Upload } from 'lucide-react';

const features = [
  { icon: Zap, label: 'Anonymous uploads' },
  { icon: Shield, label: 'Username links' },
  { icon: Upload, label: 'Dashboard control' },
];

export default function FeaturePills({ className }: { className?: string }) {
  return (
    <ul className={className ?? 'flex flex-wrap gap-2'}>
      {features.map(({ icon: Icon, label }) => (
        <li key={label}>
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-normal text-muted-foreground"
          >
            <Icon className="h-3 w-3 text-primary" />
            {label}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
