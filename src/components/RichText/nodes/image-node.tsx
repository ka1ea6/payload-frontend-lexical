/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from '@payloadcms/richtext-lexical/lexical'

import {
  $applyNodeReplacement,
  createEditor,
  DecoratorNode,
} from '@payloadcms/richtext-lexical/lexical'
import { ArrowRightLeft, Cross, Plus, X } from 'lucide-react'
import * as React from 'react'
import { Suspense } from 'react'

// const InlineImageComponent = React.lazy(
//   // @ts-ignore
//   () => import('./InlineImageComponent'),
// )

export type Position = 'left' | 'right' | 'full' | undefined

export interface InlineImagePayload {
  altText: string
  caption?: LexicalEditor
  height?: number
  key?: NodeKey
  showCaption?: boolean
  src: string
  width?: number
  position?: Position
}

export interface UpdateInlineImagePayload {
  altText?: string
  showCaption?: boolean
  position?: Position
}

function convertInlineImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode
    const node = $createInlineImageNode({ altText, height, src, width })
    return { node }
  }
  return null
}

export type SerializedInlineImageNode = Spread<
  {
    altText: string
    caption: SerializedEditor
    height?: number
    showCaption: boolean
    src: string
    width?: number
    position?: Position
  },
  SerializedLexicalNode
>

export class InlineImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string
  __altText: string
  __width: 'inherit' | number
  __height: 'inherit' | number
  __showCaption: boolean
  __caption: LexicalEditor
  __position: Position

  static override getType(): string {
    return 'inline-image'
  }

  static override clone(node: InlineImageNode): InlineImageNode {
    return new InlineImageNode(
      node.__src,
      node.__altText,
      node.__position,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__key,
    )
  }

  static override importJSON(serializedNode: SerializedInlineImageNode): InlineImageNode {
    const { altText, height, width, caption, src, showCaption, position } = serializedNode
    const node = $createInlineImageNode({
      altText,
      height,
      showCaption,
      src,
      width,
      position,
    })
    const nestedEditor = node.__caption
    const editorState = nestedEditor.parseEditorState(caption.editorState)
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState)
    }
    return node
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertInlineImageElement,
        priority: 0,
      }),
    }
  }

  constructor(
    src: string,
    altText: string,
    position: Position,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    showCaption?: boolean,
    caption?: LexicalEditor,
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width || 'inherit'
    this.__height = height || 'inherit'
    this.__showCaption = showCaption || false
    this.__caption = caption || createEditor()
    this.__position = position
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement('img')
    element.setAttribute('src', this.__src)
    element.setAttribute('alt', this.__altText)
    element.setAttribute('width', this.__width.toString())
    element.setAttribute('height', this.__height.toString())
    return { element }
  }

  override exportJSON(): SerializedInlineImageNode {
    return {
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      type: 'inline-image',
      version: 1,
      width: this.__width === 'inherit' ? 0 : this.__width,
      position: this.__position,
    }
  }

  getSrc(): string {
    return this.__src
  }

  getAltText(): string {
    return this.__altText
  }

  setAltText(altText: string): void {
    const writable = this.getWritable()
    writable.__altText = altText
  }

  setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  getShowCaption(): boolean {
    return this.__showCaption
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable()
    writable.__showCaption = showCaption
  }

  getPosition(): Position {
    return this.__position
  }

  setPosition(position: Position): void {
    const writable = this.getWritable()
    writable.__position = position
  }

  update(payload: UpdateInlineImagePayload): void {
    const writable = this.getWritable()
    const { altText, showCaption, position } = payload
    if (altText !== undefined) {
      writable.__altText = altText
    }
    if (showCaption !== undefined) {
      writable.__showCaption = showCaption
    }
    if (position !== undefined) {
      writable.__position = position
    }
  }

  // View

  override createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    const theme = config.theme
    const className = `${theme.image} position-${this.__position}`
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  override updateDOM(prevNode: InlineImageNode, dom: HTMLElement, config: EditorConfig): false {
    const position = this.__position
    if (position !== prevNode.__position) {
      const className = `${config.theme.image} position-${position}`
      if (className !== undefined) {
        dom.className = className
      }
    }
    return false
  }

  override decorate(): React.JSX.Element {
    return (
      <Suspense fallback={null}>
        <div className="border flex flex-col max-w-[200px] rounded-xl overflow-hidden bg-[#222222]">
          <div className="flex justify-between items-center border border-slate-800">
            <img
              src={this.__src}
              alt={this.__altText}
              width={100}
              height={75}
              key={this.getKey()}
              className="object-contain bg-white w-[100px] h-[75px]"
              // showCaption={this.__showCaption}
            />
            {/* <div className="flex gap-2 border-l border-slate-500">
              <span className="font-bold">Media</span>
              <button className="px-2">
                <ArrowRightLeft />
              </button>
              <button className="px-2">
                <X />
              </button>
            </div> */}
          </div>
          <div className="py-4 flex items-center justify-center">
            <span>{this.__altText || 'No alt provided'}</span>
          </div>
        </div>
        {/* <InlineImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          nodeKey={this.getKey()}
          showCaption={this.__showCaption}
          caption={this.__caption}
          position={this.__position}
        /> */}
      </Suspense>
    )
  }
}

export function $createInlineImageNode({
  altText,
  position,
  height,
  src,
  width,
  showCaption,
  caption,
  key,
}: InlineImagePayload): InlineImageNode {
  return $applyNodeReplacement(
    new InlineImageNode(src, altText, position, width, height, showCaption, caption, key),
  )
}

export function $isInlineImageNode(node: LexicalNode | null | undefined): node is InlineImageNode {
  return node instanceof InlineImageNode
}
