'use client'
import RichText from '@/components/RichText'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect, useState } from 'react'

const PageClient: React.FC = () => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()
  const [waysOfWorking, setWaysOfWorking] = useState<any>()

  // console.log('waysOfWorking', typeof waysOfWorking)

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])
  return (
    <>
      <RichText name={'something'} value={waysOfWorking} setValue={setWaysOfWorking} />
    </>
  )
}

export default PageClient
