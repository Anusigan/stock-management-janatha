"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Minus } from "lucide-react"
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

type Customer = {
  id: string
  name: string
}

type IssueStockFormProps = {
  items: Item[]
  sizes: Size[]
}

export function IssueStockForm({ items, sizes }: IssueStockFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [itemId, setItemId] = useState("")
  const [sizeId, setSizeId] = useState("")
  const [brand, setBrand] = useState("")
  const [quantity, setQuantity] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [deliveryOrderNumber, setDeliveryOrderNumber] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase.from("customers").select("*").order("name")
      if (data) setCustomers(data)
    }
    fetchCustomers()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemId || !sizeId || !brand.trim() || !quantity || !customerId || !deliveryOrderNumber.trim()) {
      alert("Please fill in all required fields")
      return
    }

    const qty = Number.parseInt(quantity)
    if (qty <= 0) {
      alert("Quantity must be greater than 0")
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.from("stock_transactions").insert({
      transaction_date: format(date, "yyyy-MM-dd"),
      item_id: itemId,
      size_id: sizeId,
      brand: brand.trim(),
      received_quantity: 0,
      issued_quantity: qty,
      balance: -qty,
      transaction_type: "Issued",
      customer_id: customerId,
      delivery_order_number: deliveryOrderNumber.trim(),
    })

    if (error) {
      alert("Error issuing stock: " + error.message)
    } else {
      // Reset form
      setDate(new Date())
      setItemId("")
      setSizeId("")
      setBrand("")
      setQuantity("")
      setCustomerId("")
      setDeliveryOrderNumber("")
      alert("Stock issued successfully!")
      router.refresh()
    }

    setIsSubmitting(false)
  }

  return (
    <Card className="border-2 border-red-200 shadow-lg hover:shadow-xl transition-shadow bg-red-50/30">
      <CardHeader className="bg-gradient-to-r from-red-50 to-red-100/50 border-b border-red-200">
        <div className="flex items-center gap-2">
          <div className="bg-red-500 p-2 rounded-lg">
            <Minus className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-black">Issue Stock</CardTitle>
            <CardDescription className="text-red-700">Record stock issued/dispatched</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issue-date" className="text-gray-700">
                Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="issue-date"
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
              <Label htmlFor="customer" className="text-gray-700">
                Customer *
              </Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger id="customer" className="border-gray-300">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-item" className="text-gray-700">
                Item *
              </Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger id="issue-item" className="border-gray-300">
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
              <Label htmlFor="issue-size" className="text-gray-700">
                Size *
              </Label>
              <Select value={sizeId} onValueChange={setSizeId}>
                <SelectTrigger id="issue-size" className="border-gray-300">
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
              <Label htmlFor="issue-brand" className="text-gray-700">
                Brand *
              </Label>
              <Input
                id="issue-brand"
                placeholder="Enter brand name"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery-order" className="text-gray-700">
                Delivery Order Number *
              </Label>
              <Input
                id="delivery-order"
                placeholder="Enter delivery order number"
                value={deliveryOrderNumber}
                onChange={(e) => setDeliveryOrderNumber(e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="issue-quantity" className="text-gray-700">
                Issued Quantity *
              </Label>
              <Input
                id="issue-quantity"
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
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              <Minus className="h-4 w-4 mr-2" />
              Issue Stock
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
