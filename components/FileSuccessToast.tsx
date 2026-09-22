'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function FileSuccessToast({ fileId }: { fileId: string }) {
  const router = useRouter()

  useEffect(() => {
    toast.success('File uploaded! Share this link with others.')
    router.replace(`/f/${fileId}`)
  }, [fileId, router])

  return null
}
