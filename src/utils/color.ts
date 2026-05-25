export const langColor = (name: string): string => {
  let hash = 0

  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff
  }

  return `hsl(${Math.abs(hash) % 360}, 65%, 45%)`
}
