'use client'
import type { SerializedDecoratorBlockNode } from '@payloadcms/richtext-lexical/lexical/react/LexicalDecoratorBlockNode'
import type {
  DOMConversionMap,
  DOMConversionOutput,
  LexicalNode,
  Spread,
} from '@payloadcms/richtext-lexical/lexical'
import type { JSX } from 'react'

import ObjectID from 'bson-objectid'
import { $applyNodeReplacement } from '@payloadcms/richtext-lexical/lexical'
import * as React from 'react'
import {
  isGoogleDocCheckboxImg,
  UploadData,
  UploadServerNode,
} from 'node_modules/@payloadcms/richtext-lexical/dist/features/upload/server/nodes/UploadNode'
import RawUploadComponent from '../components/RawUploadComponent'

function $convertUploadElement(domNode: HTMLImageElement): DOMConversionOutput | null {
  if (
    domNode.hasAttribute('data-lexical-upload-relation-to') &&
    domNode.hasAttribute('data-lexical-upload-id')
  ) {
    const id = domNode.getAttribute('data-lexical-upload-id')
    const relationTo = domNode.getAttribute('data-lexical-upload-relation-to')

    if (id != null && relationTo != null) {
      const node = $createUploadNode({
        data: {
          fields: {},
          relationTo: 'media',
          value: id,
        },
      })
      return { node }
    }
  }
  const img = domNode
  if (img.src.startsWith('file:///') || isGoogleDocCheckboxImg(img)) {
    return null
  }
  // TODO: Auto-upload functionality here!
  //}
  return null
}

export type SerializedUploadNode = {
  children?: never // required so that our typed editor state doesn't automatically add children
  type: 'upload'
} & Spread<UploadData, SerializedDecoratorBlockNode>

export class UploadNode extends UploadServerNode {
  static override clone(node: UploadServerNode): UploadServerNode {
    return super.clone(node)
  }

  static override getType(): string {
    return super.getType()
  }

  static override importDOM(): DOMConversionMap<HTMLImageElement> {
    return {
      img: (node) => ({
        conversion: $convertUploadElement,
        priority: 0,
      }),
    }
  }

  static override importJSON(serializedNode: SerializedUploadNode): UploadNode {
    if (serializedNode.version === 1 && (serializedNode?.value as unknown as { id: string })?.id) {
      serializedNode.value = (serializedNode.value as unknown as { id: string }).id
    }
    if (serializedNode.version === 2 && !serializedNode?.id) {
      serializedNode.id = new ObjectID().toHexString()
      serializedNode.version = 3
    }

    const importedData: UploadData = {
      id: serializedNode.id,
      fields: serializedNode.fields,
      relationTo: 'media',
      value: serializedNode.value,
    }

    const node = $createUploadNode({ data: importedData })
    node.setFormat(serializedNode.format)

    return node
  }

  override decorate(): JSX.Element {
    return <RawUploadComponent data={this.__data} nodeKey={this.getKey()} />
  }

  override exportJSON(): SerializedUploadNode {
    return super.exportJSON()
  }
}

export function $createUploadNode({
  data,
}: {
  data: Omit<UploadData, 'id'> & Partial<Pick<UploadData, 'id'>>
}): UploadNode {
  if (!data?.id) {
    data.id = new ObjectID().toHexString()
    // data.id = 'asdfa12e1'
  }
  return $applyNodeReplacement(new UploadNode({ data: data as UploadData }))
}

export function $isUploadNode(node: LexicalNode | null | undefined): node is UploadNode {
  return node instanceof UploadNode
}
