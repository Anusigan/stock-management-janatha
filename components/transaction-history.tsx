"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Search, Filter, X, TrendingUp, TrendingDown } from "lucide-react"

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

type TransactionHistoryProps = {
  transactions: Transaction[]
  title?: string
  type?: "received" | "issued" | "all"
}

export function TransactionHistory({
  transactions,
  title = "Transaction History",
  type = "all",
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState<string>("all")
  const [selectedSize, setSelectedSize] = useState<string>("all")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const uniqueItems = useMemo(() => {
    const items = Array.from(new Set(transactions.map((t) => t.items.name))).sort()
    return items
  }, [transactions])

  const uniqueSizes = useMemo(() => {
    const sizes = Array.from(new Set(transactions.map((t) => t.sizes.name))).sort()
    return sizes
  }, [transactions])

  const uniqueBrands = useMemo(() => {
    const brands = Array.from(new Set(transactions.map((t) => t.brand))).sort()
    return brands
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        transaction.items.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.sizes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.brand.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesItem = selectedItem === "all" || transaction.items.name === selectedItem
      const matchesSize = selectedSize === "all" || transaction.sizes.name === selectedSize
      const matchesBrand = selectedBrand === "all" || transaction.brand === selectedBrand

      const transactionDate = new Date(transaction.transaction_date)
      const matchesDateFrom = dateFrom === "" || transactionDate >= new Date(dateFrom)
      const matchesDateTo = dateTo === "" || transactionDate <= new Date(dateTo)

      return matchesSearch && matchesItem && matchesSize && matchesBrand && matchesDateFrom && matchesDateTo
    })
  }, [transactions, searchTerm, selectedItem, selectedSize, selectedBrand, dateFrom, dateTo])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedItem("all")
    setSelectedSize("all")
    setSelectedBrand("all")
    setDateFrom("")
    setDateTo("")
  }

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedItem !== "all" ||
    selectedSize !== "all" ||
    selectedBrand !== "all" ||
    dateFrom !== "" ||
    dateTo !== ""

  return (
    <Card className="border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-shadow">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <CardTitle className="text-black text-xl">{title}</CardTitle>
        <CardDescription className="text-gray-600 font-medium">
          {filteredTransactions.length} of {transactions.length} transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-gray-700">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search item, size, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-filter" className="text-gray-700">
                Item
              </Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger id="item-filter" className="border-gray-300">
                  <SelectValue placeholder="All items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All items</SelectItem>
                  {uniqueItems.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size-filter" className="text-gray-700">
                Size
              </Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger id="size-filter" className="border-gray-300">
                  <SelectValue placeholder="All sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sizes</SelectItem>
                  {uniqueSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-filter" className="text-gray-700">
                Brand
              </Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand-filter" className="border-gray-300">
                  <SelectValue placeholder="All brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All brands</SelectItem>
                  {uniqueBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from" className="text-gray-700">
                Date From
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to" className="text-gray-700">
                Date To
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-gray-300"
              />
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-2 font-semibold text-lg">No transactions found</p>
            <p className="text-sm text-gray-500">
              {hasActiveFilters ? "Try adjusting your filters" : "Start by adding or issuing stock"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-900 to-black hover:from-gray-900 hover:to-black">
                  <TableHead className="font-bold text-white">Date</TableHead>
                  <TableHead className="font-bold text-white">Item</TableHead>
                  <TableHead className="font-bold text-white">Size</TableHead>
                  <TableHead className="font-bold text-white">Brand</TableHead>
                  {type === "all" && <TableHead className="font-bold text-white">Type</TableHead>}
                  <TableHead className="text-right font-bold text-white">Quantity</TableHead>
                  <TableHead className="text-right font-bold text-white">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const isReceived = transaction.received_quantity > 0
                  return (
                    <TableRow key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-semibold text-gray-900">
                        {format(new Date(transaction.transaction_date), "PP")}
                      </TableCell>
                      <TableCell className="font-medium">{transaction.items.name}</TableCell>
                      <TableCell className="font-medium">{transaction.sizes.name}</TableCell>
                      <TableCell className="font-medium">{transaction.brand}</TableCell>
                      {type === "all" && (
                        <TableCell>
                          {isReceived ? (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-md font-semibold">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Received
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-md font-semibold">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Issued
                            </Badge>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right font-bold">
                        {isReceived ? (
                          <span className="text-green-600">+{transaction.received_quantity}</span>
                        ) : (
                          <span className="text-red-600">-{transaction.issued_quantity}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-black text-lg">{transaction.balance}</span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
