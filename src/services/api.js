async function fetchJson(url, options) {
  const res = await fetch(url, options)
  const body = await res.json()

  if (!res.ok || !body.success) {
    throw new Error(body.message || "Something went wrong. Please try again.")
  }

  return body.data
}

export { fetchJson }
