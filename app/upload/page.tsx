import UploadBox from "@/components/UploadBox";
import { Sparkles, Lock, Zap, Smartphone } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-muted/10 border border-border/10 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Upload & Share</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
              Upload Your Files
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Drag and drop or click to upload images and PDFs instantly
            </p>
          </div>

          {/* Upload Box */}
          <UploadBox />

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-border/40">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/10 mx-auto mb-2">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Secure</p>
              <p className="text-xs text-muted-foreground mt-1">SSL encrypted</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/10 mx-auto mb-2">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Fast</p>
              <p className="text-xs text-muted-foreground mt-1">Global CDN</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/10 mx-auto mb-2">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Responsive</p>
              <p className="text-xs text-muted-foreground mt-1">All devices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
