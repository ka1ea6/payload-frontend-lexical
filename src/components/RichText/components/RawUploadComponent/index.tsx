'use client'

import { File } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'
import { UploadData } from '@payloadcms/richtext-lexical'
import { getMediaById } from '@/app/(frontend)/actions/media'

export type ElementProps = {
  data: UploadData
  nodeKey: string
}

const Component: React.FC<ElementProps> = (props) => {
  const {
    data: { relationTo, value },
  } = props

  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [fileType, setFileType] = useState('')
  const [filesize, setFileSize] = useState(0)

  if (typeof value === 'object') {
    throw new Error(
      'Upload value should be a string or number. The Lexical Upload component should not receive the populated value object.',
    )
  }

  const fetchMedia = async (id: string) => {
    const res = await getMediaById(id)
    if (res && res.status === 'success') {
      setThumbnailUrl(res.data.url || res.data.thumbnailURL || '')
      setFileSize((res.data.filesize || 0) / 1000)
      setFileType(res.data.mimeType?.split('/')[1] || '')
    }
  }

  useEffect(() => {
    if (typeof props.data.value === 'string') {
      if (props.data.value.length === 24) fetchMedia(props.data.value)
      else {
        setThumbnailUrl(props.data.value || '')
        setFileSize(getFileSize())
        setFileType(getFileExtension() || '')
      }
    }
  }, [])

  const getFileExtension = () => {
    const currVal = props.data.value
    if (typeof currVal === 'string') {
      return currVal.split(';base64')[0]?.split('image/')[1]
    }
    return ''
  }
  const getFileSize = () => {
    const currVal = props.data.value
    if (typeof currVal === 'string') {
      const stringLength = currVal.split(',')[1]?.length || 0

      const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812
      const sizeInKb = sizeInBytes / 1000
      return sizeInKb
    }
    return 0
  }

  return (
    <div className="my-2" contentEditable={false}>
      <div className="border border-slate-800 rounded-xl overflow-clip w-60 flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1">
            {props.data.value ? (
              <img
                // alt={props.data.}
                className="object-cover h-24 w-full"
                data-lexical-upload-id={value}
                data-lexical-upload-relation-to={relationTo}
                src={thumbnailUrl}
              />
            ) : (
              <File />
            )}
          </div>
          <div className="flex flex-col items-center justify-center flex-1 text-xs font-bold">
            <span className="">{fileType?.toLocaleUpperCase()}</span>
            <span>{filesize.toFixed(2)} KB</span>
          </div>
        </div>
        {/* <div className="px-4 py-2 text-sm text-white underline">
          <strong></strong>
        </div> */}
      </div>
    </div>
  )
}

export default Component
