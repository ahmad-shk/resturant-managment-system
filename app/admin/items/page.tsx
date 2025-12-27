"use client"
import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Edit2, Trash2, X, UtensilsCrossed } from "lucide-react"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
}

const CATEGORIES = ["Appetizers", "Main Course", "Desserts", "Beverages"]
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    image: "",
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)

  /* ================= FETCH ITEMS ================= */
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get(`${API_BASE_URL}/all`)
      const list = Array.isArray(res.data)
        ? res.data
        : res.data.data || []

      const formatted = list.map((item: any) => ({
        ...item,
        id: item._id,
      }))
// console.log("log:::",list)
      setItems(formatted)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load menu items")
    } finally {
      setIsLoading(false)
    }
  }

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price) {
      toast.error("Name & price are required")
      return
    }

    try {
      setSubmitLoading(true)

      const payload = {
        ...formData,
        price: Number(formData.price),
      }

      if (editingId) {
        await axios.put(`${API_BASE_URL}/update/${editingId}`, payload)
        toast.success("Item updated")
      } else {
        await axios.post(`${API_BASE_URL}/add`, payload)
        toast.success("Item added")
      }

      handleCloseModal()
      fetchItems()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong")
    } finally {
      setSubmitLoading(false)
    }
  }

  /* ================= DELETE ================= */
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    try {
      setDeleteLoading(itemToDelete.id)
      await axios.delete(`${API_BASE_URL}/delete/${itemToDelete.id}`)
      toast.success("Item deleted")
      fetchItems()
      setDeleteDialogOpen(false)
    } catch {
      toast.error("Delete failed")
    } finally {
      setDeleteLoading(null)
    }
  }

  /* ================= IMAGE ================= */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
      setFormData({ ...formData, image: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteImage = () => {
    setImagePreview(null)
    setFormData({ ...formData, image: "" })
  }

  /* ================= EDIT ================= */
  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image || "",
    })
    setImagePreview(item.image || null)
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Main Course",
      image: "",
    })
    setImagePreview(null)
  }

  const handleOpenDeleteDialog = (item: MenuItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    )
  }
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Menu Items</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Manage restaurant menu items</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto text-sm"
        >
          <Plus size={18} />
          Add Item
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-slate-800 border-slate-700 my-4 sm:my-8">
            <CardHeader className="px-4 sm:px-6 py-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base sm:text-lg md:text-xl">
                  {editingId ? "Edit Menu Item" : "Add New Menu Item"}
                </CardTitle>
                <Button
                  onClick={handleCloseModal}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white hover:bg-slate-700 -mr-2"
                >
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Item Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Biryani"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 h-10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Price (Rs)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g., 500"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 h-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Item description..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 h-10 bg-slate-700 border border-slate-600 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Item Image (Optional)</label>
                  {imagePreview ? (
                    <div className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden bg-slate-900 border border-slate-600">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition shadow-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full p-8 border-2 border-dashed border-slate-600 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-slate-700/30 transition">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto bg-slate-700 rounded-lg flex items-center justify-center">
                          <Plus size={24} className="text-slate-400" />
                        </div>
                        <p className="text-slate-400 text-sm">Click to upload or drag and drop</p>
                        <p className="text-slate-500 text-xs">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 border-t border-slate-700">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-slate-700 hover:bg-slate-600 text-white w-full sm:w-auto h-10"
                    disabled={submitLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 w-full sm:w-auto h-10"
                    disabled={submitLoading}
                  >
                    {submitLoading && <Loader2 size={16} className="animate-spin" />}
                    {submitLoading ? "Saving..." : editingId ? "Update Item" : "Add Item"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12 sm:py-16">
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <UtensilsCrossed size={32} className="text-slate-600" />
            </div>
            <p className="text-slate-400 text-base sm:text-lg mb-2">No menu items found</p>
            <p className="text-slate-500 text-sm">Add your first item to get started!</p>
          </div>
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition-all hover:shadow-lg hover:shadow-blue-500/10"
            >
              {item.image && (
                <div className="w-full aspect-video overflow-hidden bg-slate-900">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-3 sm:p-4 space-y-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-blue-400 font-medium">{item.category}</p>
                </div>
                {item.description && (
                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">{item.description}</p>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                  <span className="text-lg sm:text-xl font-bold text-green-400">₨{item.price}</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(item)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 h-8 w-8"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      onClick={() => handleOpenDeleteDialog(item)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white p-2 h-8 w-8"
                      disabled={deleteLoading === item.id}
                    >
                      {deleteLoading === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Menu Item"
        description="This action cannot be undone."
        itemName={itemToDelete?.name}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading !== null}
      />
    </div>
  )
}
