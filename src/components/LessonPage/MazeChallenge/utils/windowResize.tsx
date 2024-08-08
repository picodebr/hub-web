import { useState, useEffect } from 'react'

export interface WindowSize {
  width: number
  height: number
  isLandscape: boolean
}

function getWindowSize(): WindowSize {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, isLandscape: false }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isLandscape: window.innerWidth > window.innerHeight
  }
}

export default function useWindowResize(): WindowSize {
  const [size, setSize] = useState(getWindowSize())

  useEffect(() => {
    function handleResize() {
      setSize(getWindowSize())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}
