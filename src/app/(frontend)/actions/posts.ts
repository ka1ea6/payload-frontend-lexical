'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { z } from 'zod'

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

  const res = await payload.update({
    collection: 'posts',
    id: data.postId,
    data: {
      content: JSON.parse(data.content),
    },
  })
  return { status: 'success', data: { postId: data.postId } }
}
