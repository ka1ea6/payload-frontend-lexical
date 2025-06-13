'use client'

import { File } from '@payloadcms/ui'
import React, { useCallback, useEffect, useState } from 'react'
import { UploadData } from '@payloadcms/richtext-lexical'
import { getMediaById } from '@/app/(frontend)/actions/media'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $getNodeByKey } from '@payloadcms/richtext-lexical/lexical'
import { X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type ElementProps = {
  data: UploadData
  nodeKey: string
}

const Component: React.FC<ElementProps> = (props) => {
  const {
    data: { relationTo, value },
    nodeKey,
  } = props
  const [editor] = useLexicalComposerContext()
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

  const removeUpload = useCallback(() => {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove()
    })
  }, [editor, nodeKey])

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
      <div className="border border-slate-800 rounded-xl overflow-clip w-60 flex flex-col gap-2 bg-[#222222]">
        <div className="flex gap-2 border-b border-b-slate-100/10">
          <div className="flex-1">
            {props.data.value ? (
              <img
                // alt={props.data.}
                className="object-cover w-[65px] h-[54px]"
                data-lexical-upload-id={value}
                data-lexical-upload-relation-to={relationTo}
                src={thumbnailUrl}
              />
            ) : (
              <File />
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex-1 flex justify-center items-center text-[#b5b5b5]">
                <span className="font-medium text-sm">Media</span>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    removeUpload()
                  }}
                  className="flex-1 flex justify-center items-center"
                >
                  <X width={24} height={24} strokeWidth={1} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Remove image</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center justify-center gap-4 py-3 flex-1 text-xs font-bold">
          <span className="">{fileType?.toLocaleUpperCase()}</span>
          <span>{filesize.toFixed(2)} KB</span>
        </div>
      </div>
    </div>
  )
}

export default Component
