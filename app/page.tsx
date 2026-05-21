import UploadBox from '@/components/UploadBox';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          SnapHost
        </h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Instant file hosting and sharing. No sign up required.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Upload an image or PDF and get a clean, shareable link in seconds.
        </p>
      </div>

      <UploadBox />

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>🔒 Secure • 🚀 Fast • 📱 Works on all devices</p>
      </div>
    </main>
  );
}
