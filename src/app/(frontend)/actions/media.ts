'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'

export async function getMediaById(mediaId: string) {
  const payload = await getPayload({ config })
  const media = await payload.findByID({
    collection: 'media',
    id: mediaId,
    depth: 0,
  })

  return {
    status: 'success',
    data: media,
  }
}
