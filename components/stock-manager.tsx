"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

type Transaction = {
  id: string
  transaction_date: string
  item_id: string
  size_id: string
  brand: string
  received_quantity: number
  issued_quantity: number
  balance: number
  items: { name: string }
  sizes: { name: string }
}

type StockManagerProps = {
  initialItems: Item[]
  initialSizes: Size[]
  initialTransactions: Transaction[]
}

export function StockManager({ initialItems, initialSizes, initialTransactions }: StockManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [date, setDate] = useState<Date>(new Date())
  const [itemId, setItemId] = useState("")
  const [sizeId, setSizeId] = useState("")
  const [brand, setBrand] = useState("")
  const [receivedQty, setReceivedQty] = useState("")
  const [issuedQty, setIssuedQty] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemId || !sizeId || !brand.trim()) {
      alert("Please fill in all required fields")
      return
    }

    const received = Number.parseInt(receivedQty) || 0
    const issued = Number.parseInt(issuedQty) || 0
    const balance = received - issued

    setIsSubmitting(true)

    const { data, error } = await supabase
      .from("stock_transactions")
      .insert({
        transaction_date: format(date, "yyyy-MM-dd"),
        item_id: itemId,
        size_id: sizeId,
        brand: brand.trim(),
        received_quantity: received,
        issued_quantity: issued,
        balance: balance,
      })
      .select(
        `
        *,
        items (name),
        sizes (name)
      `,
      )
      .single()

    if (error) {
      alert("Error adding transaction: " + error.message)
    } else if (data) {
      setTransactions([data, ...transactions])
      // Reset form
      setDate(new Date())
      setItemId("")
      setSizeId("")
      setBrand("")
      setReceivedQty("")
      setIssuedQty("")
      router.refresh()
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Stock Transaction</CardTitle>
          <CardDescription>Record received and issued quantities</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-transparent"
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
                <Label htmlFor="item">Item</Label>
                <Select value={itemId} onValueChange={setItemId}>
                  <SelectTrigger id="item">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {initialItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select value={sizeId} onValueChange={setSizeId}>
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {initialSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="Enter brand name"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="received">Received Quantity</Label>
                <Input
                  id="received"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issued">Issued Quantity</Label>
                <Input
                  id="issued"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={issuedQty}
                  onChange={(e) => setIssuedQty(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Balance:{" "}
                  <span className="font-semibold text-foreground">
                    {(Number.parseInt(receivedQty) || 0) - (Number.parseInt(issuedQty) || 0)}
                  </span>
                </p>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all stock transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No transactions yet. Add your first transaction above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Issued</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.transaction_date), "PP")}</TableCell>
                      <TableCell className="font-medium">{transaction.items.name}</TableCell>
                      <TableCell>{transaction.sizes.name}</TableCell>
                      <TableCell>{transaction.brand}</TableCell>
                      <TableCell className="text-right">{transaction.received_quantity}</TableCell>
                      <TableCell className="text-right">{transaction.issued_quantity}</TableCell>
                      <TableCell className="text-right font-semibold">{transaction.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
