'use client'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { startTransition, useActionState, useEffect, useState } from 'react'
import { addPostContentAction, getPostContentAction } from '../../actions/posts'
import { useRouter } from 'next/router'
import { Post } from '@/payload-types'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface PageClientProps {
  post: Post
}

const PageClient: React.FC<PageClientProps> = ({ post }) => {
  /* Force the header to be dark mode while we have an image behind it */
  const { setHeaderTheme } = useHeaderTheme()
  const [postContent, setPostContent] = useState<any>()
  const [state, formAction] = useActionState(addPostContentAction, {} as any)

  useEffect(() => {
    getPostContent(post?.id)
  }, [post])

  const getPostContent = async (postId: string) => {
    const response = await getPostContentAction(postId)
    if (response.error) {
      console.error('Error fetching post content:', response.error)
      return
    }
    const content = response.data?.content
    setPostContent(content)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('content', JSON.stringify(postContent))
    formData.append('postId', post.id)

    startTransition(() => {
      formAction(formData)
    })
  }

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  useEffect(() => {
    if (state && state.status === 'success') {
      toast.success('Post content saved successfully!')
    } else if (state && state.status === 'error') {
      toast.error(`Error saving post content: ${state.message || 'An error occurred'}`)
    }
  }, [state])

  return (
    <form onSubmit={handleSubmit}>
      {postContent ? (
        <RichText name={'content'} value={postContent} setValue={setPostContent} />
      ) : (
        <div className="flex flex-col gap-2 mx-10">
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-32" />
        </div>
      )}
      <div className="flex justify-end mt-4 mr-10">
        <Button>Save</Button>
      </div>
    </form>
  )
}

export default PageClient
