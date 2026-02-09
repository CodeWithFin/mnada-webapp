export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
  isAdmin?: boolean
  createdAt?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  inStock: boolean
  stockCount: number
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  product: Product
  createdAt?: string
}

export interface Order {
  id: string
  userId: string
  totalAmount: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: string
  paymentIntent?: string
  shippingAddress: any
  orderItems: OrderItem[]
  user?: {
    id: string
    username: string
    email: string
  }
  createdAt?: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  product: Product
}

export interface Post {
  id: string
  userId: string
  image: string
  caption?: string
  createdAt: string
  updatedAt?: string
  user: User
  likes: Like[]
  comments: Comment[]
}

export interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  createdAt: string
  user: User
}

export interface Like {
  id: string
  postId: string
  userId: string
  createdAt: string
  user?: User
}



