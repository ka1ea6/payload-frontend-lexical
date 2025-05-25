'use client'

import { AutoFocusPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { ContentEditable } from '@payloadcms/richtext-lexical/lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@payloadcms/richtext-lexical/lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalRichTextPlugin'
import { ListPlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalListPlugin'
import { TablePlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalTablePlugin'
import { ListItemNode, ListNode } from '@payloadcms/richtext-lexical/lexical/list'
import { HeadingNode } from '@payloadcms/richtext-lexical/lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@payloadcms/richtext-lexical/lexical/table'

import { OnChangePlugin } from '@payloadcms/richtext-lexical/lexical/react/LexicalOnChangePlugin'
// import { INSERT_TABLE_COMMAND, TableCellNode, TableNode, TableRowNode } from '@payloadcms/richtext-lexical/lexical/table'
import { LexicalEditor } from '@payloadcms/richtext-lexical/lexical'
import React, { Dispatch, PropsWithChildren, SetStateAction, useEffect, useState } from 'react'

import ToolbarPlugin from './toolbar-plugin'

interface RichTextProps {
  value?: string
  setValue: Dispatch<SetStateAction<any>>
  name: string
}

// const $updateEditorState = (editor: LexicalEditor) => {
//   editor.dispatchCommand(INSERT_TABLE_COMMAND, {
//     columns: String(3),
//     includeHeaders: true,
//     rows: String(3),
//   })
// }

function InsertTable({
  showTable,
  setShowTable,
}: {
  showTable: boolean
  setShowTable: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    if (!showTable) {
      setShowTable(true)
    }
  }, [showTable, setShowTable])

  // useEffect(() => {
  //   if (showTable) {
  //     $updateEditorState(editor)
  //   }
  // }, [editor, showTable])
  return <></>
}

const RichTextContent: React.FC<RichTextProps> = ({ setValue, value, name }) => {
  const [editor, state] = useLexicalComposerContext()

  const handleEditorChange = (editorState: any) => {
    editorState.read(() => {
      const json = editorState.toJSON()
      setValue(() => {
        return json
      })
    })
  }

  return (
    <div className="w-full px-10">
      <div className="editor-container ">
        {/* <Wrapper> */}
        <ToolbarPlugin />
        <div className="editor-inner px-4 my-4  border-l-4  border-gray-800">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                name={name}
                className="editor-input focus:outline-none focus:ring-0 focus-visible:outline-none min-h-40"
              />
            }
            // placeholder={<div>Hello world</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <OnChangePlugin onChange={handleEditorChange} />

          {/* <TreeViewPlugin /> */}
          <TablePlugin />
        </div>
        {/* </Wrapper> */}
      </div>
    </div>
  )
}

const RichText: React.FC<RichTextProps> = ({ setValue, value, name }) => {
  const editorConfig = {
    namespace: 'Lexical editor',
    // nodes: [TableNode, TableCellNode, TableRowNode],
    nodes: [ListNode, ListItemNode, HeadingNode, TableNode, TableCellNode, TableRowNode],
    // Handling of errors during update
    onError(error: Error) {
      console.error('Lexical error:', error)
      throw error
    },
    // The editor theme
    theme: {
      code: 'editor-code',
      heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
        h3: 'editor-heading-h3',
        h4: 'editor-heading-h4',
        h5: 'editor-heading-h5',
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
      // table: 'ExampleEditorTheme__table',
      // tableCell: 'ExampleEditorTheme__tableCell',
      // tableCellActionButton: 'ExampleEditorTheme__tableCellActionButton',
      // tableCellActionButtonContainer: 'ExampleEditorTheme__tableCellActionButtonContainer',
      // tableCellHeader: 'ExampleEditorTheme__tableCellHeader',
      // tableCellResizer: 'ExampleEditorTheme__tableCellResizer',
      // tableCellSelected: 'ExampleEditorTheme__tableCellSelected',
      // tableSelected: 'ExampleEditorTheme__tableSelected',
      // tableSelection: 'ExampleEditorTheme__tableSelection',
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
