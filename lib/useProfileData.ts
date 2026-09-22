'use client'

import { useGetMeFilesQuery, useGetMeQuery } from '@/state/api'
import { useAuth } from '@/components/providers/auth-provider'
import type { AppFile, AppUser } from '@/types/app'

export function useProfileData() {
  const { isLoading, isSignedIn } = useAuth()
  const shouldSkip = isLoading || !isSignedIn

  const {
    data: userData,
    error: userError,
    isLoading: loadingUser,
  } = useGetMeQuery(undefined, {
    skip: shouldSkip,
  })
  const {
    data: filesData,
    error: filesError,
    isLoading: loadingFiles,
  } = useGetMeFilesQuery(undefined, {
    skip: shouldSkip,
  })

  const loadingProfile = isLoading || (isSignedIn && (loadingUser || loadingFiles))
  const error = userError || filesError
  const user: AppUser | null = userData?.user ?? null
  const files: AppFile[] = filesData?.files ?? []

  return {
    isLoading,
    isSignedIn,
    loadingProfile,
    error,
    user,
    files,
  }
}
