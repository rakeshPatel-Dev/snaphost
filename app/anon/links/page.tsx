import { AnonLinks } from '@/features/upload';

export const metadata = {
  title: 'Anonymous links',
};

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="mb-4 text-2xl font-semibold">Your anonymous links</h1>
      <AnonLinks />
    </div>
  );
}
