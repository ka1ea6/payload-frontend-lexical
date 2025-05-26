'use client'
import Rich from '@/components/Rich'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useState } from 'react'

const PageClient: React.FC = () => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()
  const [waysOfWorking, setWaysOfWorking] = useState<any>()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])
  return (
    <>
      <Rich name={'something'} value={waysOfWorking} setValue={setWaysOfWorking} />
    </>
  )
}

export default PageClient
