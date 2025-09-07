"use client"

import type React from "react"
import { useEffect } from "react"

interface ToastProps {
  message: string
  show: boolean
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <p className="text-sm text-gray-800">{message}</p>
      </div>
    </div>
  )
}

export default Toast
