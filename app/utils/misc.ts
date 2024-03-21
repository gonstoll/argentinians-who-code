/**
 * Does its best to get a string error message from an unknown error.
 */
export function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  console.error('Unable to get error message for error', error)
  return 'Unknown Error'
}

export function classNames(
  ...classes: Array<string | Record<string, boolean>>
) {
  const mappedClasses = classes.map(cl => {
    if (typeof cl === 'string') {
      return cl
    } else {
      return Object.keys(cl)
        .filter(key => cl[key])
        .join(' ')
    }
  })
  return mappedClasses.join(' ')
}
