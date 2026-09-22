import { UploadBox } from '@/features/upload'
import Container from '@/components/shared/Container'
import SectionHeading from '@/components/shared/SectionHeading'
import DashedGrid from '@/components/shared/DashedGrid'
import Reveal from '@/components/motion/Reveal'

export default function UploadPage() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex flex-col relative overflow-hidden">
      <DashedGrid absolute zIndex={-1} opacity={0.5} />

      <div className="flex-1 flex flex-col pt-20 sm:pt-24 pb-20 sm:pb-24 relative z-10">
        <Container>
          <SectionHeading
            title="Upload your files"
            description="Drag and drop or click to upload images and PDFs instantly."
          />

          <div className="mt-12 sm:mt-16">
            <Reveal>
              <UploadBox />
            </Reveal>
          </div>
        </Container>
      </div>
    </div>
  )
}
