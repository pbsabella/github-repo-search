const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
})

export const formatCompactCount = (count: number): string => {
  return compactFormatter.format(count)
}

export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString()
}

export const formatResetTime = (unixSeconds: number): string => {
  if (!unixSeconds) {
    return ''
  }

  return new Date(unixSeconds * 1000).toLocaleTimeString()
}

export const repoName = (fullName: string): string =>
  fullName.split('/')[1] ?? fullName
