import * as React from "react"

// A simple, standard breakpoint for mobile devices.
// Anything <= 768px is considered a phone.
// Anything > 768px is considered a tablet or desktop.
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    const checkIsPhone = () => {
      const width = window.innerWidth
      setIsMobile(width <= MOBILE_BREAKPOINT)
    }

    // Initial check
    checkIsPhone()

    // Listen for resize events
    window.addEventListener('resize', checkIsPhone)
    return () => window.removeEventListener('resize', checkIsPhone)
  }, [])

  return isMobile
}
