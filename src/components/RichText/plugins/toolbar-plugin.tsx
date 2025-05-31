import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot, mergeRegister } from '@payloadcms/richtext-lexical/lexical/utils'
import {
  $createParagraphNode,
  $getPreviousSelection,
  $getRoot,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
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
  ChevronDown,
  ImageUp,
  List,
  ListOrdered,
  Plus,
  RotateCcw,
  RotateCw,
  Save,
} from 'lucide-react'
import { Fragment, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
} from '@payloadcms/richtext-lexical/lexical/rich-text'
import { INSERT_UPLOAD_COMMAND, InsertInlineImageDialog, InsertUploadPayload } from './image-plugin'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip'
import { cn } from '@/utilities/ui'
import Bold from '../../Icons/Bold'
import Italic from '../../Icons/Italic'
import Underline from '../../Icons/Underline'
import Strikethrough from '../../Icons/StrikeThrough'
import Subscript from '../../Icons/Subscript'
import Superscript from '../../Icons/Superscript'
import { H1, H2, H3, H4, TextIcon } from '../../Icons/Headings'
import { $createUploadNode } from '../nodes/image-node'
// import { $createUploadNode } from '@payloadcms/richtext-lexical/client'

const LowPriority = 1

function Divider() {
  return <span className="border border-[#222222]"></span>
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
  const [isSubscript, setIsSubscript] = useState(false)
  const [isSuperscript, setIsSuperscript] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  const [alignment, setAlignment] = useState<ElementFormatType>('left')
  const [blockType, setBlockType] = useState<HeadingTagType | 'p'>('p')

  const onHeadingSelect = (value: HeadingTagType | 'p') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (value === 'p') {
          $setBlocksType(selection, () => $createParagraphNode())
        } else {
          $setBlocksType(selection, () => $createHeadingNode(value))
        }
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
      setIsSubscript(selection.hasFormat('subscript'))
      setIsSuperscript(selection.hasFormat('superscript'))

      const anchorNode = selection.anchor.getNode()

      // Traverse up to find the nearest block node (e.g., ParagraphNode)
      let blockNode = anchorNode
      while (blockNode && !$isParagraphNode(blockNode) && blockNode !== $getRoot()) {
        const curr = blockNode.getParent()
        if (!curr) continue
        blockNode = curr
      }

      if (blockNode) {
        // Get the format of the block node, which includes alignment
        const format = blockNode.getFormatType()

        setAlignment(format || 'left') // Default to 'left' if no format is found

        // Check alignment based on format
      }

      const tag = (anchorNode.getTopLevelElement() as any)?.__tag

      setBlockType(tag || 'p')
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
      mergeRegister(
        editor.registerCommand<InsertUploadPayload>(
          INSERT_UPLOAD_COMMAND,
          (payload: InsertUploadPayload) => {
            editor.update(() => {
              const selection = $getSelection() || $getPreviousSelection()

              if ($isRangeSelection(selection)) {
                const uploadNode = $createUploadNode({
                  data: {
                    id: payload.id,
                    fields: payload.fields,
                    relationTo: payload.relationTo,
                    value: payload.value,
                  },
                })

                // we need to get the focus node before inserting the block node, as $insertNodeToNearestRoot can change the focus node
                const { focus } = selection
                const focusNode = focus.getNode()
                // Insert upload node BEFORE potentially removing focusNode, as $insertNodeToNearestRoot errors if the focusNode doesn't exist
                $insertNodeToNearestRoot(uploadNode)

                // Delete the node it it's an empty paragraph
                if ($isParagraphNode(focusNode) && !focusNode.__first) {
                  focusNode.remove()
                }
              }
            })

            return true
          },
          COMMAND_PRIORITY_EDITOR,
        ),
      ),
    )
  }, [editor, $updateToolbar])

  const toolbarActions: {
    label: string
    icon: ReactElement
    onClick: () => void
    disabled?: boolean
    value?: string
    active?: boolean
  }[][] = [
    [
      {
        label: 'Undo',
        icon: <RotateCcw width={15} height={15} />,
        onClick: () => {
          editor.dispatchCommand(UNDO_COMMAND, undefined)
        },
        disabled: !canUndo,
      },
      {
        label: 'Redo',
        icon: <RotateCw width={15} height={15} />,
        onClick: () => {
          editor.dispatchCommand(UNDO_COMMAND, undefined)
        },
        disabled: !canRedo,
      },
    ],
    [
      {
        label: 'Bold',
        icon: <Bold />,
        onClick: () => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        },
        value: 'bold',
        active: isBold,
      },
      {
        label: 'Italic',
        icon: <Italic />,
        onClick: () => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
        },
        value: 'italic',
        active: isItalic,
      },
      {
        label: 'Underline',
        icon: <Underline />,
        onClick: () => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
        },
        value: 'underline',
        active: isUnderline,
      },
      {
        label: 'Strikethrough',
        icon: <Strikethrough />,
        onClick: () => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        },
        value: 'strikethrough',
        active: isStrikethrough,
      },
      {
        label: 'Subscript',
        icon: <Subscript />,
        onClick: () => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')
        },
        value: 'subscript',
        active: isSubscript,
      },
      {
        label: 'Superscript',
        icon: <Superscript />,
        onClick: () => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')
        },
        value: 'superscript',
        active: isSuperscript,
      },
    ],
  ]

  const alignmentActions = [
    {
      label: 'Left Align',
      direction: 'left',
      icon: <AlignLeft width={15} height={15} />,
      onClick: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
      },
    },
    {
      label: 'Center Align',
      direction: 'center',
      icon: <AlignCenter width={15} height={15} />,
      onClick: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
      },
    },
    {
      label: 'Right Align',
      direction: 'right',
      icon: <AlignRight width={15} height={15} />,
      onClick: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
      },
    },
    {
      label: 'Justify Align',
      direction: 'justify',
      icon: <AlignJustify width={15} height={15} />,
      onClick: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
      },
    },
  ]

  const listActions = [
    {
      label: 'Unordered List',
      value: 'ul',
      icon: <List width={15} height={15} />,
      onClick: () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      },
    },
    {
      label: 'Ordered List',
      value: 'ol',
      icon: <ListOrdered width={15} height={15} />,
      onClick: () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      },
    },
  ]

  const headingOptions = [
    {
      label: 'Normal Text',
      value: 'p',
      icon: <TextIcon />,
      onClick: () => onHeadingSelect('p'),
    },
    {
      label: 'Heading 1',
      value: 'h1',
      icon: <H1 />,
      onClick: () => onHeadingSelect('h1'),
    },
    {
      label: 'Heading 2',
      value: 'h2',
      icon: <H2 />,
      onClick: () => onHeadingSelect('h2'),
    },
    {
      label: 'Heading 3',
      value: 'h3',
      icon: <H3 />,
      onClick: () => onHeadingSelect('h3'),
    },
    {
      label: 'Heading 4',
      value: 'h4',
      icon: <H4 />,
      onClick: () => onHeadingSelect('h4'),
    },
    ...listActions,
    // {
    //   label: 'Heading 5',
    //   value: 'h5',
    //   icon: <CaseUpperIcon width={15} height={15} />,
    //   onClick: () => onHeadingSelect('h5'),
    // },
    // {
    //   label: 'Heading 6',
    //   value: 'h6',
    //   icon: <CaseUpperIcon width={15} height={15} />,
    //   onClick: () => onHeadingSelect('h6'),
    // },
  ]

  const insertActions = [
    {
      label: 'Insert Image',
      icon: <ImageUp width={15} height={15} />,
      onClick: () => {
        setImageDialogOpen(true)
      },
      disabled: false,
    },
  ]

  return (
    <div className="flex justify-between border border-[#222222] py-2 px-2">
      <div className="flex gap-2 " ref={toolbarRef}>
        {toolbarActions.map((group, index) => (
          <Fragment key={`toolbar-option-${group.length}-${index}`}>
            <div className="flex items-center gap-2">
              {group.map((action, actionIndex) => (
                <div
                  role="button"
                  key={actionIndex}
                  // type="button"
                  aria-disabled={action.disabled || false}
                  onClick={action.onClick}
                  className={cn(
                    'p-1 transition-all flex items-center justify-center rounded hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#3a3a3a] focus:ring-[#3c3c3c]',
                    action.active && 'bg-[#3c3c3c]',
                  )}
                  aria-label={action.label}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-[#b5b5b5]">{action.icon}</TooltipTrigger>
                      <TooltipContent>
                        <p>{action.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
            <Divider />
          </Fragment>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center gap-2 px-2 py-1 rounded hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#3a3a3a] focus:ring-[#3c3c3c] text-[#b5b5b5] text-xs">
            {alignmentActions.find((el) => el.direction === alignment)?.icon}
            {alignmentActions.find((el) => el.direction === alignment)?.label}
            <ChevronDown width={15} height={15} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black hover:bg-black">
            {alignmentActions.map((action, index) => (
              <DropdownMenuItem
                key={`${action.label}-${index}`}
                onClick={action.onClick}
                className="flex items-center gap-2 text-xs text-[#b5b5b5] hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#3a3a3a] focus:ring-[#3c3c3c]"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center gap-2 px-2 py-1 rounded hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#3a3a3a] focus:ring-[#3c3c3c] text-[#b5b5b5] text-xs">
            {headingOptions.find((el) => el.value === blockType)?.icon}
            {headingOptions.find((el) => el.value === blockType)?.label}
            <ChevronDown width={15} height={15} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black hover:bg-black">
            {headingOptions.map((option, index) => (
              <DropdownMenuItem
                key={`heading-option-${option.label}-${index}`}
                onClick={option.onClick}
                className="flex items-center gap-2 text-xs text-[#b5b5b5] hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#3a3a3a] focus:ring-[#3c3c3c]"
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center gap-2 px-2 py-1 rounded hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#3a3a3a] focus:ring-[#3c3c3c] text-[#b5b5b5] text-xs">
            <Plus width={15} height={15} />
            <ChevronDown width={15} height={15} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black hover:bg-black">
            {insertActions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className="flex items-center gap-2 text-xs text-[#b5b5b5] hover:bg-[#3c3c3c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#3a3a3a] focus:ring-[#3c3c3c]"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {imageDialogOpen && (
          <InsertInlineImageDialog
            activeEditor={editor}
            onClose={() => {
              setImageDialogOpen(false)
            }}
            isOpen={imageDialogOpen} // This should be controlled by state
          />
        )}
      </div>
    </div>
  )
}
