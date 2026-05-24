export type Owner = {
  login: string       // username
  avatar_url: string
  html_url: string
}

export type GitHubRepo = {
  id: number,
  full_name: string
  description: string
  archived: boolean
  html_url: string
  watchers_count: number
  stargazers_count: number
  open_issues_count: number
  language: string
  license: { spdx_id: string; name: string } | null
  created_at: string
  updated_at: string
  topics: string[]
  owner: Owner
}

export type SearchRepositoriesResponse = {
  total_count: number
  items: GitHubRepo[]
}

export type GetRespositoryResponse = GitHubRepo
