"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

type Item = {
  id: string
  name: string
}

type Size = {
  id: string
  name: string
}

type AddStockFormProps = {
  items: Item[]
  sizes: Size[]
}

export function AddStockForm({ items, sizes }: AddStockFormProps) {
  const { user } = useAuth()
  const [date, setDate] = useState<Date>(new Date())
  const [itemId, setItemId] = useState("")
  const [sizeId, setSizeId] = useState("")
  const [brand, setBrand] = useState("")
  const [quantity, setQuantity] = useState("")
  const [transactionType, setTransactionType] = useState("Received")
  const [grnNumber, setGrnNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemId || !sizeId || !brand.trim() || !quantity) {
      alert("Please fill in all required fields")
      return
    }

    if (transactionType !== "Balance Forward" && !grnNumber.trim()) {
      alert("GRN Number is required for Received transactions")
      return
    }

    const qty = Number.parseInt(quantity)
    if (qty <= 0) {
      alert("Quantity must be greater than 0")
      return
    }

    setIsSubmitting(true)

    try {
      // Get the latest balance for this item/size/brand combination
      const { data: latestTransaction } = await supabase
        .from("stock_transactions")
        .select("balance")
        .eq("item_id", itemId)
        .eq("size_id", sizeId)
        .eq("brand", brand.trim())
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)

      // Calculate new balance: previous balance + received quantity
      const previousBalance = latestTransaction?.[0]?.balance || 0
      const newBalance = previousBalance + qty

      const { error } = await supabase.from("stock_transactions").insert({
        transaction_date: format(date, "yyyy-MM-dd"),
        item_id: itemId,
        size_id: sizeId,
        brand: brand.trim(),
        received_quantity: qty,
        issued_quantity: 0,
        balance: newBalance,
        transaction_type: transactionType,
        grn_number: transactionType !== "Balance Forward" ? grnNumber.trim() : null,
        // Shared workspace mode - no user_id needed
      })

      if (error) throw error

      // Reset form on success
      setDate(new Date())
      setItemId("")
      setSizeId("")
      setBrand("")
      setQuantity("")
      setGrnNumber("")
      setTransactionType("Received")
      alert("Stock added successfully!")
      router.refresh()

    } catch (error: any) {
      alert("Error adding stock: " + (error?.message || "Unknown error"))
    }

    setIsSubmitting(false)
  }

  return (
    <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow bg-green-50/30">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-200">
        <div className="flex items-center gap-2">
          <div className="bg-green-500 p-2 rounded-lg">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-black">Add Stock</CardTitle>
            <CardDescription className="text-green-700">Record new stock received</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="add-date" className="text-gray-700">
                Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="add-date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white border-gray-300"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-type" className="text-gray-700">
                Transaction Type *
              </Label>
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger id="transaction-type" className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Balance Forward">Balance Forward</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-item" className="text-gray-700">
                Item *
              </Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger id="add-item" className="border-gray-300">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-size" className="text-gray-700">
                Size *
              </Label>
              <Select value={sizeId} onValueChange={setSizeId}>
                <SelectTrigger id="add-size" className="border-gray-300">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-brand" className="text-gray-700">
                Brand *
              </Label>
              <Input
                id="add-brand"
                placeholder="Enter brand name"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="border-gray-300"
              />
            </div>

            {transactionType !== "Balance Forward" && (
              <div className="space-y-2">
                <Label htmlFor="grn-number" className="text-gray-700">
                  GRN Number *
                </Label>
                <Input
                  id="grn-number"
                  placeholder="Enter GRN number"
                  value={grnNumber}
                  onChange={(e) => setGrnNumber(e.target.value)}
                  className="border-gray-300"
                />
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="add-quantity" className="text-gray-700">
                Received Quantity *
              </Label>
              <Input
                id="add-quantity"
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
