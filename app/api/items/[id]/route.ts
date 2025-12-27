import { type NextRequest, NextResponse } from "next/server"
import { MENU_ITEMS } from "@/lib/menu-items"

// In-memory storage for additional items
const additionalItems = []

// GET - Fetch single item
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    let item = MENU_ITEMS.find((item) => item.id === params.id)
    if (!item) {
      item = additionalItems.find((item) => item.id === params.id)
    }

    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: item }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch item" }, { status: 500 })
  }
}

// PUT - Update item
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const itemIndex = additionalItems.findIndex((item) => item.id === params.id)

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Cannot update menu items. Create new items instead." },
        { status: 403 },
      )
    }

    const updatedItem = {
      ...additionalItems[itemIndex],
      ...body,
      id: params.id,
    }

    additionalItems[itemIndex] = updatedItem
    return NextResponse.json({ success: true, data: updatedItem }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update item" }, { status: 500 })
  }
}

// DELETE - Remove item
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const itemIndex = additionalItems.findIndex((item) => item.id === params.id)

    if (itemIndex === -1) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 })
    }

    const deletedItem = additionalItems.splice(itemIndex, 1)[0]
    return NextResponse.json({ success: true, data: deletedItem }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete item" }, { status: 500 })
  }
}
