import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type {
  AppFile,
  AnonymousLink,
  FileMetadata,
  FilesPayload,
  ProfilePayload,
  UpdateFilePayload,
  UploadQuotaPayload,
  UploadResponse,
  UsernameAvailabilityPayload,
} from '@/types/app'
import { formatFileSize } from '@/shared/utils/file-format'
import { supabase } from '@/lib/supabase'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/',
  credentials: 'include',
})

type AuthFetchArgs = FetchArgs & { skipAuth?: boolean }

const baseQueryWithAuth: BaseQueryFn<string | AuthFetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const { data } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token

  let skipAuth = false
  let request: FetchArgs
  if (typeof args === 'string') {
    request = { url: args }
  } else {
    const { skipAuth: skip, ...rest } = args
    skipAuth = Boolean(skip)
    request = rest
  }

  if (accessToken && !skipAuth) {
    const headers = new Headers()

    if (request.headers instanceof Headers) {
      request.headers.forEach((value, key) => headers.set(key, value))
    } else if (Array.isArray(request.headers)) {
      request.headers.forEach(([key, value]) => {
        if (typeof key === 'string' && typeof value === 'string') {
          headers.set(key, value)
        }
      })
    } else if (request.headers) {
      Object.entries(request.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers.set(key, value)
        }
      })
    }

    headers.set('authorization', `Bearer ${accessToken}`)
    request = { ...request, headers }
  }

  return rawBaseQuery(request, api, extraOptions)
}

export const snaphostApi = createApi({
  reducerPath: 'snaphostApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Me', 'MeFiles', 'PublicFile', 'UsernameAvailability', 'AnonLinks', 'MeUploadQuota'],
  endpoints: (builder) => ({
    getMe: builder.query<ProfilePayload, void>({
      query: () => '/api/me',
      providesTags: ['Me'],
      keepUnusedDataFor: 60,
    }),
    getMeFiles: builder.query<FilesPayload, void>({
      query: () => '/api/me/files',
      providesTags: ['MeFiles'],
      keepUnusedDataFor: 60,
    }),
    getMeUploadQuota: builder.query<UploadQuotaPayload, void>({
      query: () => '/api/me/upload-quota',
      providesTags: ['MeUploadQuota'],
      keepUnusedDataFor: 60,
    }),
    getFile: builder.query<FileMetadata, { fileId: string; username?: string }>({
      query: ({ fileId, username }) => ({
        url: `/api/files/${fileId}`,
        params: username ? { username } : undefined,
      }),
      providesTags: (_result, _error, arg) => [{ type: 'PublicFile', id: arg.fileId }],
      keepUnusedDataFor: 300,
    }),
    getUsernameAvailability: builder.query<UsernameAvailabilityPayload, string>({
      query: (username) => ({
        url: '/api/username/availability',
        params: { username },
      }),
      providesTags: (_result, _error, username) => [{ type: 'UsernameAvailability', id: username }],
      keepUnusedDataFor: 300,
    }),
    getAnonymousLinks: builder.query<AnonymousLink[], void>({
      query: () => ({
        url: '/api/anon/files',
        skipAuth: true,
      }),
      transformResponse: (response: { files?: AnonymousLink[] }) => response.files ?? [],
      providesTags: (result) =>
        result
          ? [
              { type: 'AnonLinks' as const, id: 'LIST' },
              ...result.map((file) => ({ type: 'AnonLinks' as const, id: file.id })),
            ]
          : [{ type: 'AnonLinks' as const, id: 'LIST' }],
      keepUnusedDataFor: 60,
    }),
    uploadFile: builder.mutation<UploadResponse, FormData>({
      query: (body) => ({
        url: '/api/upload',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me', 'MeFiles', 'MeUploadQuota'],
    }),
    updateFile: builder.mutation<{ file: AppFile }, UpdateFilePayload>({
      query: ({ fileId, ...body }) => ({
        url: `/api/me/files/${fileId}`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      invalidatesTags: ['MeFiles'],
    }),
    deleteFile: builder.mutation<{ success: true }, { fileId: string }>({
      query: ({ fileId }) => ({
        url: `/api/me/files/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MeFiles'],
    }),
    deleteAccount: builder.mutation<{ success: true }, void>({
      query: () => ({
        url: '/api/me/account',
        method: 'DELETE',
      }),
      invalidatesTags: ['Me', 'MeFiles'],
    }),
    updateMeUsername: builder.mutation<{ user: ProfilePayload['user'] }, { username: string }>({
      query: ({ username }) => ({
        url: '/api/me',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: { username },
      }),
      invalidatesTags: ['Me', 'MeFiles'],
    }),
    uploadAnonymousFile: builder.mutation<AnonymousLink, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('mode', 'anonymous')

        return {
          url: '/api/upload',
          method: 'POST',
          body: formData,
          skipAuth: true,
        }
      },
      transformResponse: (response: UploadResponse, meta, file) => ({
        id: response.fileId,
        filename: file.name,
        fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
        fileSize: formatFileSize(file.size),
        url:
          response.url ||
          (typeof window !== 'undefined'
            ? `${window.location.origin}/anon/${response.fileId}`
            : `/anon/${response.fileId}`),
        createdAt: new Date().toISOString(),
        expiresAt: response.expiresAt || new Date().toISOString(),
      }),
      invalidatesTags: [{ type: 'AnonLinks', id: 'LIST' }],
    }),
    deleteAnonymousLink: builder.mutation<{ success: true; id: string }, string>({
      query: (fileId) => ({
        url: `/api/anon/files/${fileId}`,
        method: 'DELETE',
        skipAuth: true,
      }),
      invalidatesTags: [{ type: 'AnonLinks', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetMeQuery,
  useGetMeFilesQuery,
  useGetMeUploadQuotaQuery,
  useGetFileQuery,
  useGetUsernameAvailabilityQuery,
  useGetAnonymousLinksQuery,
  useUploadFileMutation,
  useUpdateFileMutation,
  useDeleteFileMutation,
  useDeleteAccountMutation,
  useUpdateMeUsernameMutation,
  useUploadAnonymousFileMutation,
  useDeleteAnonymousLinkMutation,
} = snaphostApi
