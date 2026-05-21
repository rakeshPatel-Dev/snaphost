'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              About
            </h3>
            <p className="text-sm text-muted-foreground">
              SnapHost makes it simple to upload and share files instantly. No sign up required.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Features
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Instant upload</li>
              <li>✓ No sign up needed</li>
              <li>✓ Secure links</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@snaphost.cloud"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} SnapHost. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
