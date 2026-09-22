export function isKeyNull(key: string | null | undefined) {
  return (
    key === null || key === undefined || key.trim() === '' || key === 'null' || key === 'undefined'
  )
}
