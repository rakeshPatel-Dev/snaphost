import UploadBox from '@/components/UploadBox';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          SnapHost
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-md">
          Instant file hosting and sharing. No sign up required.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Upload an image or PDF and get a clean, shareable link in seconds.
        </p>
      </div>

      <UploadBox />

      <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>🔒 Secure • 🚀 Fast • 📱 Works on all devices</p>
      </div>
    </main>
  );
}
