import axios from 'axios'
import type { GetRepositoryResponse, LanguagesData, SearchRepositoriesResponse } from '@/types/github'
import { useRateLimitStore } from '@/stores/rateLimit'

export const PER_PAGE = 10

export type ApiResult<T> = { data: T; headers: Record<string, string> }

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
})

const interceptorId = api.interceptors.response.use(
  (res) => {
    if (res.headers['x-ratelimit-resource']) {
      useRateLimitStore().update(res.headers as Record<string, string>)
    }

    return res
  },
  (err) => {
    if (axios.isAxiosError(err) && err.response?.headers?.['x-ratelimit-resource']) {
      useRateLimitStore().update(err.response.headers as Record<string, string>)
    }

    return Promise.reject(err)
  },
)

// Prevent duplicate interceptors when hot-reloading during development
if (import.meta.hot) {
  import.meta.hot.dispose(() => api.interceptors.response.eject(interceptorId))
}

export const searchRepositories = async (query: string, page = 1): Promise<ApiResult<SearchRepositoriesResponse>> => {
  const res = await api.get<SearchRepositoriesResponse>('/search/repositories', {
    params: {
      q: query,
      per_page: PER_PAGE,
      page,
    },
  })

  return {
    data: res.data,
    headers: res.headers as Record<string, string>,
  }
}

export const getRepository = async (owner: string, repo: string): Promise<ApiResult<GetRepositoryResponse>> => {
  const res = await api.get<GetRepositoryResponse>(`/repos/${owner}/${repo}`)

  return {
    data: res.data,
    headers: res.headers as Record<string, string>,
  }
}

export const getLanguages = async (owner: string, repo: string): Promise<ApiResult<LanguagesData>> => {
  const res = await api.get<LanguagesData>(`/repos/${owner}/${repo}/languages`)

  return {
    data: res.data,
    headers: res.headers as Record<string, string>,
  }
}
