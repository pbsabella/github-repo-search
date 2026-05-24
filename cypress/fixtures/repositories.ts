import type { GitHubRepo } from '@/types/github';
import type { SearchRepositoriesResponse } from '@/types/github'

export const mockRepositories: GitHubRepo[] = [
  {
    id: 1001,
    full_name: 'facebook/react',
    description: 'The library for web and native user interfaces.',
    archived: false,
    html_url: 'https://github.com/facebook/react',
    watchers_count: 2285000,
    stargazers_count: 228000,
    open_issues_count: 850,
    language: 'JavaScript',
    license: { spdx_id: 'MIT', name: 'MIT License' },
    created_at: '2013-05-24T16:15:54Z',
    updated_at: '2026-02-17T16:15:54Z',
    topics: ['html', 'css'],
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
      html_url: 'https://github.com/facebook',
    },
  },
  {
    id: 1002,
    full_name: 'vuejs/core',
    description: 'Vue.js is a progressive JavaScript framework.',
    html_url: 'https://github.com/vuejs/core',
    archived: false,
    watchers_count: 99999,
    stargazers_count: 48000,
    open_issues_count: 620,
    language: 'TypeScript',
    license: { spdx_id: 'MIT', name: 'MIT License' },
    created_at: '2021-07-26T17:26:55Z',
    updated_at: '2024-08-02T16:15:54Z',
    topics: [],
    owner: {
      login: 'vuejs',
      avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
      html_url: 'https://github.com/vuejs',
    },
  },
]

export const archivedRepo: GitHubRepo = {
  id: 1003,
  full_name: 'facebook/flux',
  description: 'Application Architecture for Building User Interfaces',
  archived: true,
  html_url: 'https://github.com/facebook/flux',
  watchers_count: 1200,
  stargazers_count: 17000,
  open_issues_count: 0,
  language: 'JavaScript',
  license: { spdx_id: 'BSD-3-Clause', name: 'BSD 3-Clause "New" or "Revised" License' },
  created_at: '2014-05-01T00:00:00Z',
  updated_at: '2023-06-01T00:00:00Z',
  topics: ['flux', 'architecture'],
  owner: {
    login: 'facebook',
    avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
    html_url: 'https://github.com/facebook',
  },
}

export const paginatedSearchResults: SearchRepositoriesResponse = {
  total_count: 25,
  items: [
    {
      id: 2001,
      full_name: 'org/repo-page-2',
      description: 'A page 2 result',
      archived: false,
      html_url: 'https://github.com/org/repo-page-2',
      watchers_count: 100,
      stargazers_count: 200,
      open_issues_count: 5,
      language: 'TypeScript',
      license: null,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      topics: [],
      owner: {
        login: 'org',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        html_url: 'https://github.com/org',
      },
    },
  ],
}

export const githubSearchResults: SearchRepositoriesResponse = {
  total_count: 2,
  items: [
    ...mockRepositories,
  ],
}
