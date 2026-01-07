import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Post } from '../types'
import { useAuthStore } from '../store/authStore'
import CreatePost from '../components/CreatePost'

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showComposer, setShowComposer] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      const response = await api.get('/posts/feed')
      setPosts(response.data)
    } catch (error) {
      console.error('Failed to fetch feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await api.put(`/posts/${postId}/like`)
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likes.some(like => like.userId === user?.id)
          return {
            ...post,
            likes: response.data.liked
              ? [...post.likes, { id: '', postId, userId: user!.id, createdAt: new Date().toISOString() }]
              : post.likes.filter(like => like.userId !== user?.id)
          }
        }
        return post
      }))
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading feed...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="font-display text-3xl font-semibold">Your Feed</h1>
          {user && (
            <button
              onClick={() => setShowComposer(prev => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon text-black font-semibold hover:bg-white transition-colors"
            >
              {showComposer ? 'Close Composer' : 'Create Post'}
            </button>
          )}
        </div>

        {showComposer && (
          <CreatePost onPostCreated={() => { setShowComposer(false); fetchFeed() }} />
        )}

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">No posts in your feed yet</p>
            <Link to="/explore" className="inline-block bg-neon text-black font-semibold px-6 py-3 rounded hover:bg-white transition-colors">
              Explore Posts
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map(post => {
              const isLiked = post.likes.some(like => like.userId === user?.id)
              const showCaption = post.caption && post.caption.trim().toLowerCase() !== post.user.username.trim().toLowerCase()
              return (
                <div key={post.id} className="border border-zinc-800 bg-zinc-900/20 rounded-lg overflow-hidden">
                  <div className="p-4 flex items-center gap-3 border-b border-zinc-800">
                    <Link to={`/profile/${post.user.id}`} className="flex items-center gap-3">
                      <img
                        src={post.user.avatar || '/placeholder-avatar.jpg'}
                        alt={post.user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-semibold hover:text-neon transition-colors">{post.user.username}</span>
                    </Link>
                  </div>
                  <Link to={`/post/${post.id}`}>
                    <div className="aspect-square bg-zinc-900 relative">
                      <img src={post.image} alt={post.caption || 'Post'} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-2">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`${isLiked ? 'text-red-500' : 'text-zinc-400'} hover:text-red-500 transition-colors`}
                      >
                        <i data-lucide={isLiked ? 'heart' : 'heart'} className="w-6 h-6 fill-current"></i>
                      </button>
                      <span className="text-sm text-zinc-400">{post.likes.length} likes</span>
                    </div>
                    {showCaption && (
                      <p className="text-sm mb-2 text-zinc-200 leading-relaxed">
                        {post.caption}
                      </p>
                    )}
                    {post.comments.length > 0 && (
                      <Link to={`/post/${post.id}`} className="text-sm text-zinc-400 hover:text-neon transition-colors">
                        View all {post.comments.length} comments
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
