import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { User, Post } from '../types'
import { useAuthStore } from '../store/authStore'

export default function Profile() {
  const { userId } = useParams()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchProfile()
    fetchFollows()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const [userResponse, postsResponse] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get('/posts/explore')
      ])
      setProfileUser(userResponse.data)
      setPosts(postsResponse.data.filter((post: Post) => post.user.id === userId))
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFollows = async () => {
    try {
      const response = await api.get(`/follows/${userId}`)
      setFollowers(response.data.followers)
      setFollowing(response.data.following)
      if (user) {
        setIsFollowing(response.data.followers.some((f: User) => f.id === user.id))
      }
    } catch (error) {
      console.error('Failed to fetch follows:', error)
    }
  }

  const handleFollow = async () => {
    if (!user) return
    try {
      const response = await api.put(`/follows/${userId}`)
      setIsFollowing(response.data.following)
      fetchFollows()
    } catch (error) {
      console.error('Failed to follow user:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading profile...</p>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-zinc-400">User not found</p>
      </div>
    )
  }

  const isOwnProfile = user && user.id === profileUser.id

  return (
    <div className="min-h-screen pt-24 px-6 pb-12 bg-black">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="border-b border-zinc-800 pb-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-zinc-800 overflow-hidden bg-zinc-900">
                <img
                  src={profileUser.avatar || '/placeholder-avatar.jpg'}
                  alt={profileUser.username}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tighter">
                  {profileUser.username}
                </h1>
                {!isOwnProfile && user && (
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                      isFollowing
                        ? 'bg-zinc-900 border border-zinc-800 text-white hover:border-zinc-700'
                        : 'bg-neon text-black hover:bg-white'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                {isOwnProfile && (
                  <Link
                    to="/profile/edit"
                    className="px-6 py-2 rounded-full font-semibold text-sm bg-zinc-900 border border-zinc-800 text-white hover:border-zinc-700 transition-colors"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{posts.length}</span>
                  <span className="text-zinc-400 text-sm">posts</span>
                </div>
                <Link 
                  to={`/profile/${userId}/followers`}
                  className="flex items-center gap-2 hover:text-neon transition-colors"
                >
                  <span className="font-semibold text-lg">{followers.length}</span>
                  <span className="text-zinc-400 text-sm">followers</span>
                </Link>
                <Link 
                  to={`/profile/${userId}/following`}
                  className="flex items-center gap-2 hover:text-neon transition-colors"
                >
                  <span className="font-semibold text-lg">{following.length}</span>
                  <span className="text-zinc-400 text-sm">following</span>
                </Link>
              </div>

              {/* Bio */}
              {profileUser.bio && (
                <div className="mt-4">
                  <p className="text-zinc-300 leading-relaxed">{profileUser.bio}</p>
                </div>
              )}
              {profileUser.firstName && (
                <div className="mt-2">
                  <p className="text-zinc-400 text-sm">
                    {profileUser.firstName} {profileUser.lastName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16 border-t border-zinc-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-zinc-800 flex items-center justify-center">
              <i data-lucide="image" className="w-8 h-8 text-zinc-600"></i>
            </div>
            <p className="text-zinc-400 text-lg font-medium mb-2">No posts yet</p>
            <p className="text-zinc-500 text-sm">
              {isOwnProfile ? 'Start sharing your style!' : 'This user hasn\'t posted anything yet'}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
              <i data-lucide="grid-3x3" className="w-5 h-5 text-zinc-400"></i>
              <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Posts</span>
            </div>
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {posts.map(post => (
                <Link 
                  key={post.id} 
                  to={`/post/${post.id}`} 
                  className="aspect-square bg-zinc-900 rounded-lg overflow-hidden group relative"
                >
                  <img 
                    src={post.image} 
                    alt={post.caption || 'Post'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
