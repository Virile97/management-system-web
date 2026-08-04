"use client"

import { createContext, useContext, useState } from "react"

const defaultFields = [
  { key: "date", label: "Date", type: "date", width: "half", visible: true },
  { key: "receiptNo", label: "Receipt No.", type: "text", width: "half", visible: true },
  { key: "memberName", label: "Member Name", type: "text", width: "full", visible: true },
  { key: "offeringType", label: "Offering Type", type: "select", width: "full", visible: true },
  { key: "amount", label: "Amount (GHS)", type: "amount", width: "full", visible: true },
  { key: "amountInWords", label: "Amount in Words", type: "text", width: "full", visible: true },
  { key: "receivedBy", label: "Received By", type: "text", width: "half", visible: true },
  { key: "signature", label: "Signature", type: "signature", width: "half", visible: true },
]

const initialBranding = {
  churchName: "Lighthouse BBC",
  slipTitle: "Offering Receipt",
  subtitle: '"Bring the whole tithe into the storehouse" — Mal. 3:10',
  footerNote: "Thank you for your faithful giving. God bless you.",
  accent: "navy",
  showLogo: true,
}

const initialQr = {
  enabled: true,
  caption: "Scan to record offering",
  position: "Top Right",
  size: "Medium",
}

const SlipConfigContext = createContext(null)

function SlipConfigProvider({ children }) {
  const [branding, setBranding] = useState(initialBranding)
  const [qr, setQr] = useState(initialQr)
  const [fields, setFields] = useState(defaultFields)

  function updateBranding(key, value) {
    setBranding((prev) => ({ ...prev, [key]: value }))
  }

  function updateQr(key, value) {
    setQr((prev) => ({ ...prev, [key]: value }))
  }

  function toggleFieldVisibility(key) {
    setFields((prev) =>
      prev.map((field) => (field.key === key ? { ...field, visible: !field.visible } : field))
    )
  }

  function reset() {
    setBranding(initialBranding)
    setQr(initialQr)
    setFields(defaultFields)
  }

  return (
    <SlipConfigContext.Provider
      value={{ branding, qr, fields, updateBranding, updateQr, toggleFieldVisibility, reset }}
    >
      {children}
    </SlipConfigContext.Provider>
  )
}

function useSlipConfig() {
  const context = useContext(SlipConfigContext)
  if (!context) {
    throw new Error("useSlipConfig must be used within a SlipConfigProvider")
  }
  return context
}

export { SlipConfigProvider, useSlipConfig }
