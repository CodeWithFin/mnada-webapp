import { useState } from 'react'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'

interface CreatePostProps {
  onPostCreated?: () => void
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [image, setImage] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const { user } = useAuthStore()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image) return

    setLoading(true)
    try {
      // Upload image
      const formData = new FormData()
      formData.append('image', image)
      const uploadResponse = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Create post
      await api.post('/posts', {
        image: uploadResponse.data.url,
        caption
      })

      setImage(null)
      setCaption('')
      setPreview(null)
      if (onPostCreated) onPostCreated()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="border border-zinc-800 bg-zinc-900/20 p-6 rounded-lg mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Image</label>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded" />
              <button
                type="button"
                onClick={() => {
                  setImage(null)
                  setPreview(null)
                }}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded"
              >
                <i data-lucide="x" className="w-4 h-4"></i>
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded focus:outline-none focus:border-neon resize-none"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !image}
          className="w-full bg-neon text-black font-semibold py-3 rounded hover:bg-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  )
}

