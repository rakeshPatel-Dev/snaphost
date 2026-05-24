import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AppFile, FileMetadata, FilesPayload, ProfilePayload, UpdateFilePayload, UploadResponse } from '@/types/app';

export const snaphostApi = createApi({
  reducerPath: 'snaphostApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    credentials: 'include',
  }),
  tagTypes: ['Me', 'MeFiles', 'PublicFile'],
  endpoints: (builder) => ({
    getMe: builder.query<ProfilePayload, void>({
      query: () => '/api/me',
      providesTags: ['Me'],
    }),
    getMeFiles: builder.query<FilesPayload, void>({
      query: () => '/api/me/files',
      providesTags: ['MeFiles'],
    }),
    getFile: builder.query<FileMetadata, string>({
      query: (fileId) => `/api/files/${fileId}`,
      providesTags: (_result, _error, fileId) => [{ type: 'PublicFile', id: fileId }],
    }),
    uploadFile: builder.mutation<UploadResponse, FormData>({
      query: (body) => ({
        url: '/api/upload',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me', 'MeFiles'],
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
  }),
});

export const {
  useGetMeQuery,
  useGetMeFilesQuery,
  useGetFileQuery,
  useUploadFileMutation,
  useUpdateFileMutation,
  useDeleteFileMutation,
  useDeleteAccountMutation,
} = snaphostApi;
