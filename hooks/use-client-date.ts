import { useState, useEffect } from 'react'

/**
 * Custom hook to handle date initialization that prevents hydration mismatches
 * Returns the current date only after client-side hydration is complete
 */
export function useClientDate(defaultDate?: Date): Date | undefined {
  const [date, setDate] = useState<Date | undefined>(defaultDate)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (!defaultDate) {
      setDate(new Date())
    }
  }, [defaultDate])

  return isClient ? date : defaultDate
}

/**
 * Custom hook that returns a date immediately but ensures consistent formatting
 * Use this when you need a date value immediately but want to prevent hydration issues
 */
export function useStableDate(initialDate?: Date): Date {
  const [date] = useState(() => initialDate || new Date())
  return date
}
