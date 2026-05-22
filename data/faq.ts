type FAQItem = {
  q: string;
  a: string;
};
  
export const faqs: FAQItem[] = [
  { 
    q: 'Do I need an account to upload files?', 
    a: 'No, you can upload and share files anonymously right away. Anonymous uploads have a file size limit of 10MB and are automatically deleted after 7 days. Creating a free account lets you manage your files, track views, set passwords, and customize expiration times.' 
  },
  { 
    q: 'What is the upload size limit for files?', 
    a: 'Anonymous users can upload images up to 10MB and PDFs up to 25MB. Free account users get 25MB for images and 50MB for PDFs. Developer and Enterprise tiers support up to 500MB per file with customizable block-storage limits.' 
  },
  { 
    q: 'Can I hotlink images directly in my apps?', 
    a: 'Absolutely. Every uploaded image is optimized (converted to WebP/AVIF if supported by the browser) and cached on our global Edge CDN. You can use the generated link directly inside `<img>` tags, markdown files, or website builders for instant loading.' 
  },
  { 
    q: 'How does S3-compatible storage work?', 
    a: 'SnapHost provides an S3-compatible API. This means you can keep using your existing AWS SDKs, client libraries, or integrations (like carrierwave, shrine, or django-storages) by simply swapping the endpoint URL and adding your SnapHost credentials.' 
  },
  { 
    q: 'Can files be deleted automatically after download?', 
    a: 'Yes, SnapHost supports one-time viewing links. When configuring an upload, you can set the expiration to "Delete on first download". Once the recipient opens the link, the file is securely wiped from our storage and CDN nodes.' 
  },
  { 
    q: 'Do you offer a self-hosted option?', 
    a: 'SnapHost is primarily a managed cloud platform. However, we support data residency compliance, allowing you to back up your uploads automatically to your own S3 bucket, Google Cloud Storage, or Azure Blob Storage.' 
  },
];