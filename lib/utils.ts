export function formatPlayTime(min: number, max: number): string {
  if (min === max) {
    return `${min} min`
  }
  return `${min}–${max} min`
}

export function formatPlayerCount(min: number, max: number): string {
  if (min === max) {
    return `${min} player${min === 1 ? '' : 's'}`
  }
  return `${min}–${max} players`
}
