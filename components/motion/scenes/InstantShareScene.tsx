'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { inWindow } from '@/components/motion/usePlayback';
import UploadForm from '@/components/UploadForm';
import FileDetailsCard from '@/components/FileDetailsCard';
import ShareLinkInput from '@/components/ShareLinkInput';
import { noop } from './sample';
import { SITE_URL } from '@/data/emails';

const DEMO = {
  filename: 'mockup.png',
  fileSize: 2_457_600,
  url: `${SITE_URL}/jane/8xK3pQ`,
};

const fade = {
  initial: { opacity: 0, y: 12, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
};

export default function InstantShareScene({ t }: { t: number }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const phase: 'upload' | 'uploading' | 'done' =
    t < 0.28 ? 'upload' : t < 0.4 ? 'uploading' : 'done';

  const copied = inWindow(t, 0.62, 0.95);

  return (
    <div className="relative flex h-80 w-full items-center">
      <AnimatePresence mode="wait" initial={false}>
        {phase !== 'done' && (
          <motion.div key="upload" {...fade} className="w-full">
            <UploadForm
              isDragging={false}
              isUploading={phase === 'uploading'}
              onDragOver={noop}
              onDragLeave={noop}
              onDrop={noop}
              onFileInputClick={noop}
              fileInputRef={fileInputRef}
              onFileSelect={noop}
            />
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" {...fade} className="w-full">
            <div className="relative rounded-4xl border border-border/60 bg-card/80 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex justify-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
                  <Check className="h-5 w-5 text-accent" />
                </div>
              </div>
              <h3 className="mt-2.5 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                File uploaded
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Your file is ready to share
              </p>

              <div className="mt-4 space-y-3">
                <FileDetailsCard filename={DEMO.filename} fileSize={DEMO.fileSize} />
                <ShareLinkInput fileUrl={DEMO.url} />
              </div>

              <AnimatePresence>
                {copied && (
                  <motion.div
                    key="copied-toast"
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute -top-3 right-4 flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600"
                  >
                    <Check className="h-3 w-3" />
                    Link copied
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}