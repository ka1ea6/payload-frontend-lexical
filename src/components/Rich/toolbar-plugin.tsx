import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { mergeRegister } from '@payloadcms/richtext-lexical/lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from '@payloadcms/richtext-lexical/lexical'

import { $setBlocksType } from '@payloadcms/richtext-lexical/lexical/selection'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@payloadcms/richtext-lexical/lexical/list'

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  EllipsisVertical,
  FlipHorizontal,
  ImageUp,
  Italic,
  List,
  ListOrdered,
  RotateCcw,
  RotateCw,
  Strikethrough,
  Underline,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { $createHeadingNode, HeadingTagType } from '@payloadcms/richtext-lexical/lexical/rich-text'
import { InsertInlineImageDialog } from './plugins/ImagePlugin'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

const LowPriority = 1

function Divider() {
  return <div className="divider" />
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const toolbarRef = useRef(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  const onHeadingSelect = (value: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        // if (blockType === 'paragraph') {
        // $setBlocksType(selection, () => $createParagraphNode());
        // } else {
        $setBlocksType(selection, () => $createHeadingNode(value))
        // }
      }
    })
  }

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar()
          return false
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        LowPriority,
      ),
    )
  }, [editor, $updateToolbar])

  return (
    <div className="flex gap-2 toolbar" ref={toolbarRef}>
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined)
        }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <RotateCcw />
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined)
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <RotateCw />
      </button>
      <span className="border border-slate-800"></span>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        }}
        className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
        aria-label="Format Bold"
      >
        <Bold />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
        }}
        className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
        aria-label="Format Italics"
      >
        <Italic />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
        }}
        className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
        aria-label="Format Underline"
      >
        <Underline />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }}
        className={'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')}
        aria-label="Format Strikethrough"
      >
        <Strikethrough />
      </button>
      <span className="border border-slate-800"></span>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
        }}
        className="toolbar-item spaced"
        aria-label="Left Align"
      >
        <AlignLeft />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
        }}
        className="toolbar-item spaced"
        aria-label="Center Align"
      >
        <AlignCenter />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
        }}
        className="toolbar-item spaced"
        aria-label="Right Align"
      >
        <AlignRight />
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
        }}
        className="toolbar-item"
        aria-label="Justify Align"
      >
        <AlignJustify />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }}
      >
        <List />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }}
      >
        <ListOrdered />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger>Heading Level</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onHeadingSelect('h1')}>H1</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onHeadingSelect('h2')}>H2</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onHeadingSelect('h3')}>H3</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onHeadingSelect('h4')}>H4</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onHeadingSelect('h5')}>H5</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onHeadingSelect('h6')}>H6</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* <button
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              // if (blockType === 'paragraph') {
              // $setBlocksType(selection, () => $createParagraphNode());
              // } else {
              $setBlocksType(selection, () => $createHeadingNode('h1'))
              // }
            }
          })
        }}
      >
        H1
      </button>
      <button
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              // if (blockType === 'paragraph') {
              // $setBlocksType(selection, () => $createParagraphNode());
              // } else {
              $setBlocksType(selection, () => $createHeadingNode('h2'))
              // }
            }
          })
        }}
      >
        H2
      </button> */}
      <button
        onClick={() => {
          setImageDialogOpen(true)
          // editor.update(() => {
          //   const selection = $getSelection()
          //   if ($isRangeSelection(selection)) {
          //     // if (blockType === 'paragraph') {
          //     // $setBlocksType(selection, () => $createParagraphNode());
          //     // } else {
          //     $setBlocksType(selection, () => $createHeadingNode('h2'))
          //     // }
          //   }
          // })
        }}
      >
        <ImageUp />
      </button>
      {imageDialogOpen && (
        <InsertInlineImageDialog
          activeEditor={editor}
          onClose={() => {
            console.log('Dialog closed')
          }}
          isOpen={imageDialogOpen} // This should be controlled by state
        />
      )}
    </div>
  )
}
