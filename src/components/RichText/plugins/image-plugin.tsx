import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { mergeRegister } from '@payloadcms/richtext-lexical/lexical/utils'
import {
  $createRangeSelection,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
} from '@payloadcms/richtext-lexical/lexical'
import React, { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DialogDescription } from '@radix-ui/react-dialog'
import { $createUploadNode, $isUploadNode, UploadNode } from '@payloadcms/richtext-lexical/client'
import { UploadData } from '@payloadcms/richtext-lexical'

export type InsertUploadPayload = Readonly<Omit<UploadData, 'id'> & Partial<Pick<UploadData, 'id'>>>

const CAN_USE_DOM: boolean =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null

export const INSERT_UPLOAD_WITH_DRAWER_COMMAND: LexicalCommand<{
  replace: { nodeKey: string } | false
}> = createCommand('INSERT_UPLOAD_WITH_DRAWER_COMMAND')

export const INSERT_UPLOAD_COMMAND: LexicalCommand<InsertUploadPayload> =
  createCommand('INSERT_UPLOAD_COMMAND')

export function InsertInlineImageDialog({
  activeEditor,
  onClose,
  isOpen = false,
}: {
  activeEditor: LexicalEditor
  onClose: () => void
  isOpen: boolean
}) {
  const hasModifier = useRef(false)

  const [open, setOpen] = useState(true)
  const [src, setSrc] = useState('')
  const [altText, setAltText] = useState('')
  const [showCaption, setShowCaption] = useState(false)
  const [position, setPosition] = useState<any>('left')

  const isDisabled = src === ''

  const handleShowCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowCaption(e.target.checked)
  }

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPosition(e.target.value as any)
  }

  const loadImage = (files: FileList | null) => {
    const reader = new FileReader()
    reader.onload = function () {
      if (typeof reader.result === 'string') {
        setSrc(reader.result)
      }
      return ''
    }
    if (files !== null && files[0]) {
      reader.readAsDataURL(files[0])
    }
  }

  useEffect(() => {
    hasModifier.current = false
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [activeEditor])

  useEffect(() => {
    if (!open) {
      onClose()
    }
  }, [open])

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const insertUpload = ({
    editor,
    relationTo,
    replaceNodeKey,
    value,
  }: {
    editor: LexicalEditor
    relationTo: string
    replaceNodeKey: null | string
    value: number | string
  }) => {
    if (!replaceNodeKey) {
      const res = editor.dispatchCommand(INSERT_UPLOAD_COMMAND, {
        // @ts-expect-error - TODO: fix this
        fields: null,
        relationTo: 'media',
        value,
      })
    } else {
      editor.update(() => {
        const node = $getNodeByKey(replaceNodeKey)
        if (node) {
          node.replace(
            $createUploadNode({
              data: {
                // @ts-expect-error - TODO: fix this
                fields: null,
                relationTo: 'media',
                value,
              },
            }),
          )
        }
      })
    }
  }

  const handleOnClick = () => {
    const payload = { altText, src, showCaption, position }

    insertUpload({
      editor: activeEditor,
      relationTo: 'media',
      replaceNodeKey: null,
      value: payload.src,
    })

    setOpen(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        <div className="">
          <div style={{ marginBottom: '1em' }}>
            <Input
              // label="Image Upload"
              type={'file'}
              onChange={(e) => loadImage(e.target.files)}
              accept="image/*"
              data-test-id="image-modal-file-upload"
            />
          </div>
          <div style={{ marginBottom: '1em' }}>
            <Input
              aria-label="Alt Text"
              placeholder="Descriptive alternative text"
              onChange={(e) => setAltText(e.currentTarget.value)}
              value={altText}
              data-test-id="image-modal-alt-text-input"
            />
          </div>
          {/* <DialogActions> */}
          <Button
            data-test-id="image-modal-file-upload-btn"
            disabled={isDisabled}
            onClick={() => handleOnClick()}
          >
            Confirm
          </Button>
          {/* </DialogActions> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InlineImagePlugin({
  captionsEnabled,
}: {
  captionsEnabled?: boolean
}): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([UploadNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor')
    }

    return mergeRegister(
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return onDragStart(event)
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event)
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return onDrop(event, editor)
        },
        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [captionsEnabled, editor])

  return null
}

function onDragStart(event: DragEvent): boolean {
  const node = getImageNodeInSelection()
  if (!node) {
    return false
  }
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) {
    return false
  }
  dataTransfer.setData('text/plain', '_')
  return true
}

function onDragover(event: DragEvent): boolean {
  const node = getImageNodeInSelection()
  if (!node) {
    return false
  }
  if (!canDropImage(event)) {
    event.preventDefault()
  }
  return true
}

function onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = getImageNodeInSelection()
  if (!node) {
    return false
  }
  event.preventDefault()
  if (canDropImage(event)) {
    const range = getDragSelection(event)
    node.remove()
    const rangeSelection = $createRangeSelection()
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range)
    }
    $setSelection(rangeSelection)
  }
  return true
}

function getImageNodeInSelection(): UploadNode | null {
  const selection = $getSelection()
  if (!$isNodeSelection(selection)) {
    return null
  }
  const nodes = selection.getNodes()
  const node = nodes[0]
  return $isUploadNode(node) ? node : null
}

declare global {
  interface DragEvent {
    rangeOffset?: number
    rangeParent?: Node
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest('code, span.editor-image') &&
    target.parentElement &&
    target.parentElement.closest('div.ContentEditable__root')
  )
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range
  const target = event.target as null | Element | Document
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
        ? (target as Document).defaultView
        : (target as Element).ownerDocument.defaultView
  const domSelection = getDOMSelection(targetWindow)
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY)
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0)
    range = domSelection.getRangeAt(0)
  } else {
    throw Error('Cannot get the selection when dragging')
  }

  return range
}
