"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface InlineGradeInputProps {
  value: number | null
  onChange: (grade: number | null) => void
  onNext?: () => void
  onCancel?: () => void
  autoFocus?: boolean
  "data-student-index"?: number
}

function getInputStyle(grade: number | null) {
  if (grade === null) return "border-gray-300 bg-white"
  if (grade >= 5) return "border-green-300 bg-green-50 text-green-800"
  if (grade >= 3) return "border-amber-300 bg-amber-50 text-amber-800"
  return "border-red-300 bg-red-50 text-red-800"
}

export function InlineGradeInput({
  value,
  onChange,
  onNext,
  onCancel,
  autoFocus = false,
  "data-student-index": studentIndex,
}: InlineGradeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(value !== null ? String(value) : "")

  useEffect(() => {
    setLocalValue(value !== null ? String(value) : "")
  }, [value])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [autoFocus])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      commitValue()
      onNext?.()
    } else if (e.key === "Escape") {
      e.preventDefault()
      setLocalValue(value !== null ? String(value) : "")
      onCancel?.()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === "") {
      setLocalValue("")
      onChange(null)
      return
    }
    const num = parseInt(raw)
    if (num >= 1 && num <= 6) {
      setLocalValue(String(num))
      onChange(num)
    }
  }

  const commitValue = () => {
    if (localValue === "") {
      onChange(null)
    } else {
      const num = parseInt(localValue)
      if (num >= 1 && num <= 6) {
        onChange(num)
      }
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={commitValue}
      placeholder="–"
      data-student-index={studentIndex}
      className={cn(
        "w-12 h-10 text-center font-mono text-lg font-medium border rounded-lg",
        "focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all",
        getInputStyle(value)
      )}
    />
  )
}
