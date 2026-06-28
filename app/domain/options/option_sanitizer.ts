export function parseOptions(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return []
  }

  return value.trim().split(/\s+/)
}

export function removeForbiddenOptions(options: string[], forbiddenOptions: string[]) {
  return options.filter((option) => {
    const sentOption = option.split('=')[0]
    return !forbiddenOptions.includes(sentOption)
  })
}
