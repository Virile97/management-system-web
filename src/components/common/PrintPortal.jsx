"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

function getPrintPortalRoot() {
  let root = document.getElementById("print-portal-root")
  if (!root) {
    root = document.createElement("div")
    root.id = "print-portal-root"
    document.body.appendChild(root)
  }
  return root
}

function PrintPortal({ children }) {
  const [root, setRoot] = useState(null)

  useEffect(() => {
    setRoot(getPrintPortalRoot())
  }, [])

  if (!root) return null

  return createPortal(children, root)
}

export { PrintPortal }
export default PrintPortal
