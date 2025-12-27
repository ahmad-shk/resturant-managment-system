import { type NextRequest, NextResponse } from "next/server"
import { MENU_ITEMS } from "@/lib/menu-items"

// In-memory storage for additional items created via API
const additionalItems = []

// GET - Fetch all items
export async function GET(request: NextRequest) {
  try {
    const allItems = [
      ...MENU_ITEMS.map((item) => ({
        ...item,
        image: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(item.name)}`,
        availability: true,
        createdAt: new Date(),
      })),
      ...additionalItems,
    ]
    return NextResponse.json({ success: true, data: allItems }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch items" }, { status: 500 })
  }
}

// POST - Create new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, category, image } = body

    if (!name || !price || !category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, price, category" },
        { status: 400 },
      )
    }

    const newItem = {
      id: Date.now().toString(),
      name,
      description: description || "",
      price,
      category,
      image: image || "/placeholder.svg",
      availability: true,
      createdAt: new Date(),
    }

    additionalItems.push(newItem)
    return NextResponse.json({ success: true, data: newItem }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create item" }, { status: 500 })
  }
}
