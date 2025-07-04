import * as React from "react"

// Switch to mobile when width < 1200px OR aspect ratio < 1.33 (narrower than 4:3)
// This prevents the lab background from being cut off
const WIDTH_BREAKPOINT = 1200
const ASPECT_RATIO_THRESHOLD = 1.33 // 4:3 ratio (1200/900)

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const aspectRatio = width / height
      
      // Switch to mobile if:
      // 1. Width is less than 1200px OR
      // 2. Aspect ratio is less than 4:3 (taller/narrower screens)
      const shouldBeMobile = width < WIDTH_BREAKPOINT || aspectRatio < ASPECT_RATIO_THRESHOLD
      setIsMobile(shouldBeMobile)
    }

    // Initial check
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return !!isMobile
}
