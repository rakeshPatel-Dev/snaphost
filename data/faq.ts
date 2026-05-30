type FAQItem = {
  q: string;
  a: string;
};
  
export const faqs: FAQItem[] = [
  { 
    q: 'Do I need an account to upload files?', 
    a: 'No. You can upload and share files anonymously right away. Anonymous uploads expire after 24 hours, while signed-in users can manage uploads from a dashboard and control expiration on a per-file basis.' 
  },
  { 
    q: 'What is the upload size limit for files?', 
    a: 'Both images and PDFs can be uploaded up to 10MB each. Supported image formats are PNG, JPG, and WEBP, and PDF uploads are enabled out of the box.' 
  },
  { 
    q: 'What do the share links look like?', 
    a: 'Signed-in uploads use direct links in the form baseurl/username/filename. Anonymous uploads use a short anon path so you can share them immediately without creating an account.' 
  },
  { 
    q: 'Can I change a file name or slug after upload?', 
    a: 'Yes. Signed-in users can open the profile dashboard to rename files, update slugs, and adjust expiration times without re-uploading.' 
  },
  { 
    q: 'What happens if I delete my account?', 
    a: 'Your user record, uploaded files, and related public links are removed from the app. The account deletion flow cleans up storage and app data before removing the authentication account.' 
  },
  { 
    q: 'Where can I manage my uploads?', 
    a: 'Signed-in users can manage uploads from the profile page, where filenames, slugs, expiration settings, and delete actions are available in one place.' 
  },
];