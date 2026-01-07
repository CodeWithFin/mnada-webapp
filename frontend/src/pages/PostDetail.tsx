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
  const showCaption = post.caption && post.caption.trim().toLowerCase() !== post.user.username.trim().toLowerCase()

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="border border-zinc-800 bg-zinc-950/60 rounded-2xl overflow-hidden shadow-lg">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-zinc-800 bg-black/40">
            <Link to={`/profile/${post.user.id}`} className="flex items-center gap-3">
              <img
                src={post.user.avatar || '/placeholder-avatar.jpg'}
                alt={post.user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-semibold text-lg leading-tight hover:text-neon transition-colors">
                {post.user.username}
              </span>
            </Link>
          </div>

          {/* Media */}
          <div className="bg-black">
            <div className="relative w-full">
              <img src={post.image} alt={post.caption || 'Post'} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-5 space-y-5">
            {showCaption && (
              <p className="text-zinc-100 text-base leading-relaxed">{post.caption}</p>
            )}

            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <button
                onClick={handleLike}
                disabled={!user}
                className={`${isLiked ? 'text-red-500' : 'text-zinc-400'} hover:text-red-500 transition-colors disabled:opacity-50 flex items-center gap-2`}
              >
                <i data-lucide="heart" className="w-6 h-6 fill-current"></i>
                <span>{post.likes.length} likes</span>
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-2 text-sm">
                  <Link to={`/profile/${comment.user.id}`} className="font-semibold hover:text-neon transition-colors">
                    {comment.user.username}
                  </Link>
                  <span className="text-zinc-200 leading-relaxed">{comment.content}</span>
                </div>
              ))}
            </div>

            {user && (
              <form onSubmit={handleComment} className="flex gap-3 pt-1">
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
  )
}
