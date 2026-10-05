import BrandLoader from '@/components/shared/BrandLoader'

export default function Loading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-16" aria-busy="true">
      <BrandLoader size="lg" label="Loading Snaphost" />
    </main>
  )
}
