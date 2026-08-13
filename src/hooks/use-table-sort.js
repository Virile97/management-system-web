import { useMemo, useRef, useState } from "react"

function compareValues(left, right, type = "string") {
  if (left == null || left === "") return right == null || right === "" ? 0 : 1
  if (right == null || right === "") return -1

  if (type === "number") {
    return Number(left) - Number(right)
  }

  if (type === "date") {
    return new Date(left).getTime() - new Date(right).getTime()
  }

  return String(left).localeCompare(String(right), undefined, {
    sensitivity: "base",
    numeric: true,
  })
}

/**
 * Client-side column sorting for the currently loaded rows.
 * For server-paginated lists this sorts the active page only.
 *
 * @param {Array} rows
 * @param {Record<string, { get: (row) => unknown, type?: 'string'|'number'|'date' }>} columns
 * @param {{ initialKey?: string|null, initialDirection?: 'asc'|'desc' }} [options]
 */
function useTableSort(
  rows,
  columns,
  { initialKey = null, initialDirection = "asc" } = {}
) {
  const [sortKey, setSortKey] = useState(initialKey)
  const [sortDirection, setSortDirection] = useState(initialDirection)
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  function toggleSort(key) {
    const column = columnsRef.current[key]
    if (!column) return

    if (sortKey === key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"))
      return
    }

    const defaultDirection =
      column.type === "date" || column.type === "number" ? "desc" : "asc"
    setSortKey(key)
    setSortDirection(defaultDirection)
  }

  const sortedRows = useMemo(() => {
    const column = sortKey ? columnsRef.current[sortKey] : null
    if (!column) return rows

    const { get, type = "string" } = column
    const direction = sortDirection === "asc" ? 1 : -1

    return [...rows].sort((a, b) => {
      const result = compareValues(get(a), get(b), type)
      return result === 0 ? 0 : result * direction
    })
  }, [rows, sortKey, sortDirection])

  return {
    sortedRows,
    sortKey,
    sortDirection,
    toggleSort,
  }
}

export { useTableSort, compareValues }
export default useTableSort
