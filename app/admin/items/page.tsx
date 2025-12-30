"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Edit2, Trash2, X, UtensilsCrossed, ImageIcon } from "lucide-react"
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
const CLOUD_NAME = "do3hn35qi"
const UPLOAD_PRESET = "menu_items"

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    image: "",
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get(`${API_BASE_URL}/all`)
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      setItems(list.map((item: any) => ({ ...item, id: item._id || item.id })))
    } catch (err: any) {
      toast.error("Load failed: " + (err.response?.data?.message || err.message))
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed")

    setImagePreview(URL.createObjectURL(file))
    setSubmitLoading(true)

    const formDataCloud = new FormData()
    formDataCloud.append("file", file)
    formDataCloud.append("upload_preset", UPLOAD_PRESET)

    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formDataCloud)
      setFormData((prev) => ({ ...prev, image: res.data.secure_url }))
      toast.success("Image uploaded")
    } catch {
      toast.error("Upload failed")
      setImagePreview(null)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      const payload = { ...formData, price: Number(formData.price), isAvailable: true }
      if (editingId) {
        await axios.put(`${API_BASE_URL}/update/${editingId}`, payload)
        toast.success("Updated")
      } else {
        await axios.post(`${API_BASE_URL}/add`, payload)
        toast.success("Added")
      }
      handleCloseModal()
      fetchItems()
    } catch {
      toast.error("Save failed")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    try {
      setDeleteLoading(itemToDelete.id)
      await axios.delete(`${API_BASE_URL}/delete/${itemToDelete.id}`)
      toast.success("Deleted")
      fetchItems()
      setDeleteDialogOpen(false)
    } catch {
      toast.error("Delete failed")
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleEdit = (item: MenuItem) => {
    setFormData({ name: item.name, description: item.description, price: item.price.toString(), category: item.category, image: item.image || "" })
    setImagePreview(item.image || null)
    setEditingId(item.id)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ name: "", description: "", price: "", category: "Main Course", image: "" })
    setImagePreview(null)
  }

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-orange-500" /></div>

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Menu Items</h1>
          <p className="text-slate-400 text-sm">Add or edit your restaurant dishes</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto gap-2">
          <Plus size={18} /> Add Item
        </Button>
      </div>

      {/* MODAL POPUP FIX */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto pt-10">
          <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 rounded-t-3xl sm:rounded-xl shadow-2xl relative">
            <Button onClick={handleCloseModal} variant="ghost" className="absolute right-4 top-4 text-slate-400 hover:text-white z-10">
              <X size={24} />
            </Button>

            <CardHeader className="border-b border-slate-800">
              <CardTitle className="text-white">{editingId ? "Edit Item" : "New Item"}</CardTitle>
            </CardHeader>

            <CardContent className="p-5 sm:p-8 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Name</label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-slate-800 border-slate-700 h-11 text-white" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Euro</label>
                    <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="bg-slate-800 border-slate-700 h-11 text-white" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-800 border-slate-700 rounded-md p-3 text-white min-h-[100px]" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-800 border-slate-700 h-11 rounded-md px-3 text-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Image</label>
                  {imagePreview ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700">
                      <img src={imagePreview} className="w-full h-full object-cover" />
                      <Button type="button" onClick={() => {setImagePreview(null); setFormData({...formData, image: ""})}} className="absolute top-2 right-2 bg-red-600 h-8 w-8 p-0 rounded-full"><X size={16}/></Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800/50">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <ImageIcon className="text-slate-500 mb-2" />
                      <span className="text-sm text-slate-400">Click to upload</span>
                    </label>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <Button type="button" onClick={handleCloseModal} variant="outline" className="w-full sm:flex-1 border-slate-700 text-black">Cancel</Button>
                  <Button type="submit" disabled={submitLoading} className="w-full sm:flex-1 bg-orange-600 hover:bg-orange-700">
                    {submitLoading ? <Loader2 className="animate-spin mr-2" size={18}/> : null} Save Item
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ITEMS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:shadow-xl transition-all">
            <div className="aspect-video bg-slate-900">
              {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-600"><UtensilsCrossed size={40}/></div>}
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-lg truncate">{item.name}</h3>
                <span className="text-orange-500 font-bold">€ {item.price}</span>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2">{item.description}</p>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => handleEdit(item)} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700"><Edit2 size={14}/></Button>
                <Button onClick={() => {setItemToDelete(item); setDeleteDialogOpen(true)}} size="sm" className="bg-red-600 hover:bg-red-700"><Trash2 size={14}/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Item" description={`Are you sure you want to delete ${itemToDelete?.name}?`} onConfirm={handleDeleteConfirm} isLoading={deleteLoading !== null} />
    </div>
  )
}