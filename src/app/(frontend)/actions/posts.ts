'use server'

import { CollectionSlug, getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

async function uploadBase64File(
  payload: Payload,
  base64String: string,
  fileName: string,
  collectionSlug: CollectionSlug,
) {
  try {
    // Remove the data URI prefix (e.g., "data:image/jpeg;base64,")
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string')
    }

    const mimeType = matches[1] // e.g., "image/jpeg"
    const data = matches[2] // Base64 data

    // Determine file extension based on MIME type
    const extension = mimeType?.split('/')[1] || 'bin' // Fallback to .bin if unknown
    const tempFileName = `${Math.floor(Math.random() * 10000000000)}.${extension}`
    const tempFilePath = path.resolve(__dirname, 'temp', tempFileName)

    // Ensure the temp directory exists
    fs.mkdirSync(path.dirname(tempFilePath), { recursive: true })

    // Decode base64 and write to a temporary file
    const buffer = Buffer.from(data, 'base64')
    fs.writeFileSync(tempFilePath, buffer)

    // Upload using Payload's Local API
    const result = await payload.create({
      collection: collectionSlug, // e.g., 'media'
      data: {
        alt: fileName || 'Uploaded file', // Additional fields as per your collection
      },
      filePath: tempFilePath,
    })

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath)

    return result
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

const addPostContentSchema = z.object({
  content: z.string(),
  postId: z.string(),
})

export async function getPostContentAction(postId: string) {
  const payload = await getPayload({ config })
  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 0,
  })

  if (!post) {
    return {
      error: 'Post not found',
    }
  }
  return {
    status: 'success',
    data: {
      content: post.content,
      postId: post.id,
    },
  }
}

export async function addPostContentAction(prevState: any, formData: FormData) {
  const formEntry = Object.fromEntries(formData)
  const { success, data, error } = addPostContentSchema.safeParse(formEntry)

  if (!success) {
    return {
      error: 'Invalid input',
      details: error.errors,
    }
  }

  const payload = await getPayload({ config })
  const parsedContent = JSON.parse(data.content)

  const mappedChildren = await Promise.all(
    parsedContent.root.children.map(async (el: any) => {
      if (el.id && el.value.length > 24) {
        const res = await uploadBase64File(payload, el.value, 'something', 'media')

        return { ...el, value: res.id }
      }
      return el
    }),
  )

  const mappedData = {
    root: {
      ...parsedContent.root,
      children: [...mappedChildren],
    },
  }

  try {
    const res = await payload.update({
      collection: 'posts',
      id: data.postId,
      data: {
        content: mappedData,
      },
      overrideLock: false,
    })
    return { status: 'success', data: { postId: data.postId } }
  } catch (err) {
    console.log('err', err)
    return {
      status: 'error',
      message:
        err.status === 423
          ? 'Document is locked for editing'
          : 'An error occurred while updating the post content.',
    }
  }
}
