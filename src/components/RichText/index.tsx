'use client'

import { AutoFocusPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposer'
import { ContentEditable } from '@payloadcms/richtext-lexical/lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@payloadcms/richtext-lexical/lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalRichTextPlugin'
import { ListPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalListPlugin'
import { ListItemNode, ListNode } from '@payloadcms/richtext-lexical/lexical/list'
import { HeadingNode } from '@payloadcms/richtext-lexical/lexical/rich-text'

import { OnChangePlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalOnChangePlugin'
import React, { Dispatch, SetStateAction, useEffect } from 'react'

import ToolbarPlugin from './plugins/toolbar-plugin'
import { UploadNode } from './nodes/image-node'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import InlineImagePlugin from './plugins/image-plugin'
// import { UploadNode } from '@payloadcms/richtext-lexical/client'

interface RichTextProps {
  value?: string
  setValue: Dispatch<SetStateAction<any>>
  name: string
}
const RichTextContent: React.FC<RichTextProps> = ({ setValue, value, name }) => {
  const [editor] = useLexicalComposerContext()

  const handleEditorChange = (editorState: any) => {
    editorState.read(() => {
      const json = editorState.toJSON()
      setValue(() => {
        return json
      })
    })
  }

  useEffect(() => {
    if (value) {
      editor.update(() => {
        editor.setEditorState(editor.parseEditorState(value as any))
      })
    }
    // editor?.setEditorState(value)
  }, [])

  return (
    <div className="w-full px-10">
      <div className=" ">
        <ToolbarPlugin />
        <div className="px-4 my-4  border-l  border-[#222222]">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                name={name}
                className="focus:outline-none focus:ring-0 focus-visible:outline-none min-h-40"
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <OnChangePlugin onChange={handleEditorChange} />
          {/* <UploadPlugin clientProps={{ collections: {} }} /> */}
          <InlineImagePlugin />
        </div>
      </div>
    </div>
  )
}

const RichText: React.FC<RichTextProps> = ({ setValue, value, name }) => {
  const editorConfig = {
    namespace: 'Lexical editor',
    // nodes: [TableNode, TableCellNode, TableRowNode],
    nodes: [ListNode, ListItemNode, HeadingNode, UploadNode],
    // Handling of errors during update
    onError(error: Error) {
      console.error('Lexical error:', error)
      throw error
    },
    // The editor theme
    theme: {
      code: 'editor-code',
      heading: {
        h1: 'text-4xl',
        h2: 'text-3xl',
        h3: 'text-2xl',
        h4: 'text-lg',
        h5: 'text-sm',
      },
      image: 'editor-image',
      link: 'editor-link',
      list: {
        listitem: 'editor-listitem',
        nested: {
          listitem: 'editor-nested-listitem',
        },
        ol: 'list-decimal',
        ul: 'list-disc',
      },
      ltr: 'ltr',
      paragraph: 'editor-paragraph',
      placeholder: 'editor-placeholder',
      quote: 'editor-quote',
      rtl: 'rtl',
      text: {
        bold: 'editor-text-bold font-bold',
        code: 'editor-text-code',
        hashtag: 'editor-text-hashtag',
        italic: 'editor-text-italic italic',
        overflowed: 'editor-text-overflowed',
        strikethrough: 'editor-text-strikethrough line-through',
        underline: 'editor-text-underline underline',
        underlineStrikethrough: 'underline line-through',
      },
    },
  }

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <RichTextContent value={value} setValue={setValue} name={name} />
    </LexicalComposer>
  )
}

export default RichText
