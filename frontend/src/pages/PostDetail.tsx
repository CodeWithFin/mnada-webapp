import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { Post } from '../types'
import { useAuthStore } from '../store/authStore'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const { user } = useAuthStore()

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`)
      setPost(response.data)
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user || !post) return
    try {
      const response = await api.put(`/posts/${post.id}/like`)
      const isLiked = post.likes.some(like => like.userId === user.id)
      setPost({
        ...post,
        likes: response.data.liked
          ? [...post.likes, { id: '', postId: post.id, userId: user.id, createdAt: new Date().toISOString() }]
          : post.likes.filter(like => like.userId !== user.id)
      })
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !post || !comment.trim()) return

    try {
      const response = await api.post(`/posts/${post.id}/comment`, { content: comment })
      setPost({
        ...post,
        comments: [response.data, ...post.comments]
      })
      setComment('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-zinc-400">Post not found</p>
      </div>
    )
  }

  const isLiked = user && post.likes.some(like => like.userId === user.id)

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden">
            <img src={post.image} alt={post.caption || 'Post'} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
              <Link to={`/profile/${post.user.id}`}>
                <img
                  src={post.user.avatar || '/placeholder-avatar.jpg'}
                  alt={post.user.username}
                  className="w-10 h-10 rounded-full"
                />
              </Link>
              <Link to={`/profile/${post.user.id}`} className="font-semibold hover:text-neon transition-colors">
                {post.user.username}
              </Link>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {post.caption && (
                <div>
                  <Link to={`/profile/${post.user.id}`} className="font-semibold hover:text-neon transition-colors">
                    {post.user.username}
                  </Link>{' '}
                  <span>{post.caption}</span>
                </div>
              )}

              <div className="space-y-4">
                {post.comments.map(comment => (
                  <div key={comment.id}>
                    <Link to={`/profile/${comment.user.id}`} className="font-semibold hover:text-neon transition-colors">
                      {comment.user.username}
                    </Link>{' '}
                    <span>{comment.content}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 space-y-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={!user}
                  className={`${isLiked ? 'text-red-500' : 'text-zinc-400'} hover:text-red-500 transition-colors disabled:opacity-50`}
                >
                  <i data-lucide="heart" className="w-6 h-6 fill-current"></i>
                </button>
                <span className="text-sm text-zinc-400">{post.likes.length} likes</span>
              </div>

              {user && (
                <form onSubmit={handleComment} className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neon text-black font-semibold rounded hover:bg-white transition-colors"
                  >
                    Post
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
