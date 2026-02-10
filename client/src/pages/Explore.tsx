import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Post } from '../types'
import { useAuthStore } from '../store/authStore'

export default function Explore() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<'latest' | 'popular'>('latest')
  const { user } = useAuthStore()

  useEffect(() => {
    fetchPosts()
  }, [type])

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts/explore', { params: { type } })
      setPosts(response.data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading posts...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl font-semibold">Explore</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setType('latest')}
              className={`px-4 py-2 rounded ${type === 'latest' ? 'bg-neon text-black' : 'bg-zinc-900 border border-zinc-800'}`}
            >
              Latest
            </button>
            <button
              onClick={() => setType('popular')}
              className={`px-4 py-2 rounded ${type === 'popular' ? 'bg-neon text-black' : 'bg-zinc-900 border border-zinc-800'}`}
            >
              Popular
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
              <div key={post.id} className="group relative aspect-square bg-zinc-900 rounded-lg overflow-hidden">
                <Link to={`/post/${post.id}`}>
                  <img src={post.image} alt={post.caption || 'Post'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                      <span className="text-white flex items-center gap-2">
                        <i data-lucide="heart" className="w-5 h-5"></i>
                        {post.likes.length}
                      </span>
                      <span className="text-white flex items-center gap-2">
                        <i data-lucide="message-circle" className="w-5 h-5"></i>
                        {post.comments.length}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
          ))}
        </div>
      </div>
    </div>
  )
}
