import axios from 'axios'
import type { GetRespositoryResponse, SearchRepositoriesResponse } from '@/types/github'

export const PER_PAGE = 10

export type ApiResult<T> = { data: T; headers: Record<string, string> }

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
})

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

export const getRepository = async (owner: string, repo: string): Promise<ApiResult<GetRespositoryResponse>> => {
  const res = await api.get<GetRespositoryResponse>(`/repos/${owner}/${repo}`)

  return {
    data: res.data,
    headers: res.headers as Record<string, string>,
  }
}
