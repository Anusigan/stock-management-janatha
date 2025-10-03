"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Plus, Package, Ruler, Users } from "lucide-react"
import { useRouter } from "next/navigation"

type Item = {
  id: string
  name: string
}

type Size = {
  id: string
  name: string
}

type Customer = {
  id: string
  name: string
}

type MasterDataManagerProps = {
  initialItems: Item[]
  initialSizes: Size[]
  initialCustomers: Customer[]
}

export function MasterDataManager({ initialItems, initialSizes, initialCustomers }: MasterDataManagerProps) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [sizes, setSizes] = useState<Size[]>(initialSizes)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [newItem, setNewItem] = useState("")
  const [newSize, setNewSize] = useState("")
  const [newCustomer, setNewCustomer] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isAddingSize, setIsAddingSize] = useState(false)
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false)
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim()) return

    setIsAddingItem(true)
    const { data, error } = await supabase.from("items").insert({ name: newItem.trim() }).select().single()

    if (error) {
      alert("Error adding item: " + error.message)
    } else if (data) {
      setItems([...items, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewItem("")
      setItemDialogOpen(false)
      router.refresh()
    }
    setIsAddingItem(false)
  }

  const handleAddSize = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSize.trim()) return

    setIsAddingSize(true)
    const { data, error } = await supabase.from("sizes").insert({ name: newSize.trim() }).select().single()

    if (error) {
      alert("Error adding size: " + error.message)
    } else if (data) {
      setSizes([...sizes, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewSize("")
      setSizeDialogOpen(false)
      router.refresh()
    }
    setIsAddingSize(false)
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    const { error } = await supabase.from("items").delete().eq("id", id)

    if (error) {
      alert("Error deleting item: " + error.message)
    } else {
      setItems(items.filter((item) => item.id !== id))
      router.refresh()
    }
  }

  const handleDeleteSize = async (id: string) => {
    if (!confirm("Are you sure you want to delete this size?")) return

    const { error } = await supabase.from("sizes").delete().eq("id", id)

    if (error) {
      alert("Error deleting size: " + error.message)
    } else {
      setSizes(sizes.filter((size) => size.id !== id))
      router.refresh()
    }
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomer.trim()) return

    setIsAddingCustomer(true)
    const { data, error } = await supabase.from("customers").insert({ name: newCustomer.trim() }).select().single()

    if (error) {
      alert("Error adding customer: " + error.message)
    } else if (data) {
      setCustomers([...customers, data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewCustomer("")
      setCustomerDialogOpen(false)
      router.refresh()
    }
    setIsAddingCustomer(false)
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    const { error } = await supabase.from("customers").delete().eq("id", id)

    if (error) {
      alert("Error deleting customer: " + error.message)
    } else {
      setCustomers(customers.filter((customer) => customer.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="border-2 border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-black" />
              <CardTitle className="text-black">Items</CardTitle>
            </div>
            <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddItem}>
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                    <DialogDescription>Enter the name of the new inventory item</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="new-item" className="text-gray-700">
                      Item Name
                    </Label>
                    <Input
                      id="new-item"
                      placeholder="e.g., T-Shirt, Jeans, Shoes"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      className="mt-2 border-gray-300"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isAddingItem} className="bg-black hover:bg-gray-800">
                      {isAddingItem ? "Adding..." : "Add Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Manage your inventory items</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No items yet</p>
                <p className="text-sm text-gray-400">Click "Add Item" to get started</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-black">{item.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteItem(item.id)}
                    className="hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600 hover:text-black" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-black" />
              <CardTitle className="text-black">Sizes</CardTitle>
            </div>
            <Dialog open={sizeDialogOpen} onOpenChange={setSizeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Size
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddSize}>
                  <DialogHeader>
                    <DialogTitle>Add New Size</DialogTitle>
                    <DialogDescription>Enter the name of the new size option</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="new-size" className="text-gray-700">
                      Size Name
                    </Label>
                    <Input
                      id="new-size"
                      placeholder="e.g., Small, Medium, Large, XL"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="mt-2 border-gray-300"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isAddingSize} className="bg-black hover:bg-gray-800">
                      {isAddingSize ? "Adding..." : "Add Size"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Manage available sizes</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {sizes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No sizes yet</p>
                <p className="text-sm text-gray-400">Click "Add Size" to get started</p>
              </div>
            ) : (
              sizes.map((size) => (
                <div
                  key={size.id}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-black">{size.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSize(size.id)}
                    className="hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600 hover:text-black" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-black" />
              <CardTitle className="text-black">Customers</CardTitle>
            </div>
            <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddCustomer}>
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>Enter the name of the new customer</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="new-customer" className="text-gray-700">
                      Customer Name
                    </Label>
                    <Input
                      id="new-customer"
                      placeholder="e.g., ABC Company, John Doe"
                      value={newCustomer}
                      onChange={(e) => setNewCustomer(e.target.value)}
                      className="mt-2 border-gray-300"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isAddingCustomer} className="bg-black hover:bg-gray-800">
                      {isAddingCustomer ? "Adding..." : "Add Customer"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Manage your customers</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {customers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No customers yet</p>
                <p className="text-sm text-gray-400">Click "Add Customer" to get started</p>
              </div>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-black">{customer.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600 hover:text-black" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
