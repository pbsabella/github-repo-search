export type Owner = {
  login: string       // username
  avatar_url: string
  html_url: string
}

export type GitHubRepo = {
  id: number,
  full_name: string
  description: string | null
  archived: boolean
  html_url: string
  watchers_count: number
  stargazers_count: number
  open_issues_count: number
  language: string | null
  license: { spdx_id: string; name: string } | null
  created_at: string
  updated_at: string
  pushed_at: string | null
  forks_count: number
  homepage: string | null
  clone_url: string
  ssh_url: string
  is_template: boolean
  has_pages: boolean
  has_discussions: boolean
  has_wiki: boolean
  topics: string[]
  owner: Owner
}

export type SearchRepositoriesResponse = {
  total_count: number
  incomplete_results: boolean
  items: GitHubRepo[]
}

export type GetRepositoryResponse = GitHubRepo

export type LanguagesData = Record<string, number>
