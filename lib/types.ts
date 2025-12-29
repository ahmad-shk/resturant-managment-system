export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  available: boolean
}

export interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  specialInstructions?: string
}

export interface Order {
  id: string
  tableNumber: number
  items: OrderItem[]
  status: "pending" | "preparing" | "ready" | "serving" | "completed"
  totalAmount: number
  createdAt: number
  updatedAt: number
}

export interface Table {
  id: string
  tableNumber: number
  capacity: number
  status: "available" | "occupied" | "reserved"
}

export interface Restaurant {
  id: string
  name: string
  logo?: string
  menu: MenuItem[]
  tables: Table[]
}
