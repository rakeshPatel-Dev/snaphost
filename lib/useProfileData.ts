'use client'

import { useGetMeBundlesQuery, useGetMeFilesQuery, useGetMeQuery } from '@/state/api'
import { useAuth } from '@/components/providers/auth-provider'
import type { AppBundle, AppFile, AppUser } from '@/types/app'

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
  const {
    data: bundlesData,
    error: bundlesError,
    isLoading: loadingBundles,
  } = useGetMeBundlesQuery(undefined, { skip: shouldSkip })

  const loadingProfile =
    isLoading || (isSignedIn && (loadingUser || loadingFiles || loadingBundles))
  const error = userError || filesError || bundlesError
  const user: AppUser | null = userData?.user ?? null
  const files: AppFile[] = filesData?.files ?? []
  const bundles: AppBundle[] = bundlesData?.bundles ?? []

  return {
    isLoading,
    isSignedIn,
    loadingProfile,
    error,
    user,
    files,
    bundles,
  }
}
