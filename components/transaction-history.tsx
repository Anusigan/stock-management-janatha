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
import { Search, Filter, X, TrendingUp, TrendingDown, Download, FileText, FileSpreadsheet } from "lucide-react"

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



  const getFilterSummary = () => {
    const activeFilters = []
    if (searchTerm) activeFilters.push(`Search: "${searchTerm}"`)
    if (selectedItem !== "all") activeFilters.push(`Item: ${selectedItem}`)
    if (selectedSize !== "all") activeFilters.push(`Size: ${selectedSize}`)
    if (selectedBrand !== "all") activeFilters.push(`Brand: ${selectedBrand}`)
    if (dateFrom) activeFilters.push(`From: ${dateFrom}`)
    if (dateTo) activeFilters.push(`To: ${dateTo}`)
    return activeFilters.length > 0 ? activeFilters.join(", ") : "No filters applied"
  }

  const exportToExcel = async (transactions: Transaction[], exportTitle: string) => {
    try {
      const XLSX = (await import('xlsx')).default

      // Create workbook
      const wb = XLSX.utils.book_new()

      // Header information
      const headerData = [
        ['FLUX STOCK MANAGEMENT SYSTEM'],
        ['Powered by TekvoLabs (https://tekvolabs.com/)'],
        [''],
        ['Report Title:', exportTitle],
        ['Export Date:', format(new Date(), "yyyy-MM-dd HH:mm:ss")],
        ['Total Records:', transactions.length.toString()],
        ['Applied Filters:', getFilterSummary()],
        [''],
        ['Date', 'Item', 'Size', 'Brand', 'Type', 'Quantity', 'Balance']
      ]

      // Transaction data
      const transactionData = transactions.map(transaction => {
        const isReceived = transaction.received_quantity > 0
        return [
          format(new Date(transaction.transaction_date), "yyyy-MM-dd"),
          transaction.items.name,
          transaction.sizes.name,
          transaction.brand,
          isReceived ? 'Received' : 'Issued',
          isReceived ? transaction.received_quantity : transaction.issued_quantity,
          transaction.balance
        ]
      })

      // Footer
      const footerData = [
        [''],
        ['--- End of Report ---'],
        ['Generated by Flux Stock Management System'],
        ['TekvoLabs - Building innovative solutions for modern businesses']
      ]

      // Combine all data
      const allData = [...headerData, ...transactionData, ...footerData]

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(allData)

      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, // Date
        { wch: 20 }, // Item
        { wch: 15 }, // Size
        { wch: 15 }, // Brand
        { wch: 10 }, // Type
        { wch: 10 }, // Quantity
        { wch: 10 }  // Balance
      ]

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

      // Generate file and download
      XLSX.writeFile(wb, `flux-${exportTitle.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.xlsx`)
      
    } catch (error) {
      console.error('Excel Export failed:', error)
      alert('Excel Export failed. Please try again.')
    }
  }

  const loadImageAsBase64 = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = src
    })
  }

  const exportToPDF = async (transactions: Transaction[], exportTitle: string) => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF()

      // Load and add actual logos
      let fluxLogoData: string | null = null
      let tekvoLogoData: string | null = null

      try {
        fluxLogoData = await loadImageAsBase64('/flux-logo.png')
      } catch (e) {
        console.log('Could not load Flux logo, using placeholder')
      }

      try {
        tekvoLogoData = await loadImageAsBase64('/tekvolabs-logo.png')
      } catch (e) {
        console.log('Could not load TekvoLabs logo, using placeholder')
      }

      // Add Flux logo or placeholder (left side) - larger and better positioned
      if (fluxLogoData) {
        doc.addImage(fluxLogoData, 'PNG', 15, 8, 25, 25)
      } else {
        // Enhanced Flux placeholder
        doc.setFillColor(70, 130, 180) // Steel blue color for Flux
        doc.roundedRect(15, 8, 25, 25, 4, 4, 'F')
        doc.setDrawColor(50, 110, 160)
        doc.roundedRect(15, 8, 25, 25, 4, 4, 'S')
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text('FLUX', 27.5, 22, { align: 'center' })
      }

      // Add TekvoLabs logo or placeholder (right side) - larger and better positioned
      if (tekvoLogoData) {
        doc.addImage(tekvoLogoData, 'PNG', 170, 8, 25, 25)
      } else {
        // Enhanced TekvoLabs placeholder
        doc.setFillColor(220, 53, 69) // Red color for TekvoLabs
        doc.roundedRect(170, 8, 25, 25, 4, 4, 'F')
        doc.setDrawColor(200, 33, 49)
        doc.roundedRect(170, 8, 25, 25, 4, 4, 'S')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text('TEKVO', 182.5, 18, { align: 'center' })
        doc.text('LABS', 182.5, 26, { align: 'center' })
      }

      // Enhanced header with proper spacing
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('FLUX STOCK MANAGEMENT', 105, 25, { align: 'center' })
      
      // Subtitle
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Modern Inventory Management System', 105, 33, { align: 'center' })
      
      // Company branding with clickable links
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 60)
      doc.text('Powered by TekvoLabs', 105, 42, { align: 'center' })
      
      // Website links with proper formatting
      doc.setFontSize(9)
      doc.setTextColor(0, 100, 200) // Blue color for links
      doc.text('Website: https://tekvolabs.com/', 105, 47, { align: 'center' })
      
      // Report title
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(exportTitle, 105, 58, { align: 'center' })

      // Report information section with enhanced formatting
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      
      // Info box background
      doc.setFillColor(245, 245, 245)
      doc.rect(15, 65, 180, 25, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.rect(15, 65, 180, 25, 'S')
      
      // Report details
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Report Information:', 20, 72)
      
      doc.setFont('helvetica', 'normal')
      doc.text(`Export Date: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`, 20, 78)
      doc.text(`Total Records: ${transactions.length}`, 20, 83)
      doc.text(`Applied Filters: ${getFilterSummary()}`, 20, 87)

      // Prepare table data
      const tableData = transactions.map(transaction => {
        const isReceived = transaction.received_quantity > 0
        return [
          format(new Date(transaction.transaction_date), "yyyy-MM-dd"),
          transaction.items.name,
          transaction.sizes.name,
          transaction.brand,
          isReceived ? 'Received' : 'Issued',
          isReceived ? transaction.received_quantity : transaction.issued_quantity,
          transaction.balance
        ]
      })

      // Calculate summary statistics
      const totalReceived = transactions.reduce((sum, t) => sum + t.received_quantity, 0)
      const totalIssued = transactions.reduce((sum, t) => sum + t.issued_quantity, 0)
      const currentBalance = transactions.length > 0 ? transactions[0].balance : 0

      // Create table with enhanced styling
      autoTable(doc, {
        head: [['Date', 'Item', 'Size', 'Brand', 'Type', 'Quantity', 'Balance']],
        body: tableData,
        startY: 95,
        styles: { 
          fontSize: 8,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: [64, 64, 64],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        alternateRowStyles: { 
          fillColor: [248, 249, 250] 
        },
        margin: { top: 95, left: 15, right: 15 },
        theme: 'striped'
      })

      // Add summary section after the table
      const finalY = (doc as any).lastAutoTable.finalY || 150
      
      if (finalY < doc.internal.pageSize.height - 60) {
        // Summary box
        doc.setFillColor(248, 249, 250)
        doc.rect(15, finalY + 10, 180, 35, 'F')
        doc.setDrawColor(200, 200, 200)
        doc.rect(15, finalY + 10, 180, 35, 'S')
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('Transaction Summary', 20, finalY + 20)
        
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Received: ${totalReceived}`, 20, finalY + 28)
        doc.text(`Total Issued: ${totalIssued}`, 70, finalY + 28)
        doc.text(`Net Balance: ${totalReceived - totalIssued}`, 120, finalY + 28)
        
        doc.setTextColor(100, 100, 100)
        doc.setFontSize(8)
        doc.text('This report reflects all transactions matching the applied filters.', 20, finalY + 38)
      }

      // Enhanced Footer for all pages
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        
        const pageHeight = doc.internal.pageSize.height
        
        // Footer background
        doc.setFillColor(250, 250, 250)
        doc.rect(0, pageHeight - 25, 210, 25, 'F')
        doc.setDrawColor(200, 200, 200)
        doc.line(15, pageHeight - 25, 195, pageHeight - 25)
        
        // Footer content
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(80, 80, 80)
        
        // Left side - System info
        doc.text('Generated by Flux Stock Management System', 20, pageHeight - 18)
        doc.setTextColor(0, 100, 200)
        doc.text('Website: https://tekvolabs.com/', 20, pageHeight - 13)
        
        // Center - Company tagline
        doc.setTextColor(60, 60, 60)
        doc.setFont('helvetica', 'italic')
        doc.text('TekvoLabs - Building innovative solutions for modern businesses', 105, pageHeight - 15, { align: 'center' })
        
        // Right side - Page info
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(`Page ${i} of ${pageCount}`, 190, pageHeight - 18, { align: 'right' })
        doc.text(format(new Date(), "yyyy-MM-dd"), 190, pageHeight - 13, { align: 'right' })
      }

      // Save the PDF
      doc.save(`flux-${exportTitle.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.pdf`)

    } catch (error) {
      console.error('PDF Export failed:', error)
      alert('PDF Export failed. Please try again.')
    }
  }

  const exportToCSV = (transactions: Transaction[], exportTitle: string) => {
    try {
      const csvData = [
        // Header Information
        '"FLUX STOCK MANAGEMENT SYSTEM"',
        '"Powered by TekvoLabs (https://tekvolabs.com/)"',
        '""',
        `"Report Title:","${exportTitle}"`,
        `"Export Date:","${format(new Date(), "yyyy-MM-dd HH:mm:ss")}"`,
        `"Total Records:","${transactions.length}"`,
        `"Applied Filters:","${getFilterSummary()}"`,
        '""',
        // Column Headers
        '"Date","Item","Size","Brand","Type","Quantity","Balance"',
        // Transaction Data
        ...transactions.map(transaction => {
          const isReceived = transaction.received_quantity > 0
          return [
            `"${format(new Date(transaction.transaction_date), "yyyy-MM-dd")}"`,
            `"${transaction.items.name}"`,
            `"${transaction.sizes.name}"`,
            `"${transaction.brand}"`,
            `"${isReceived ? 'Received' : 'Issued'}"`,
            `"${isReceived ? transaction.received_quantity : transaction.issued_quantity}"`,
            `"${transaction.balance}"`
          ].join(',')
        }),
        // Footer
        '""',
        '"--- End of Report ---"',
        '"Generated by Flux Stock Management System"',
        '"TekvoLabs - Building innovative solutions for modern businesses"'
      ].join('\n')

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flux-${exportTitle.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), "yyyy-MM-dd")}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('CSV Export failed:', error)
      alert('CSV Export failed. Please try again.')
    }
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-black text-xl">{title}</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </div>
          
          {/* Export Options */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => exportToExcel(filteredTransactions, title)}
              disabled={filteredTransactions.length === 0}
              size="sm"
              variant="outline"
              className="bg-white hover:bg-green-50 border-gray-300 text-gray-700 hover:border-green-300"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Excel
            </Button>
            <Button
              onClick={() => exportToPDF(filteredTransactions, title)}
              disabled={filteredTransactions.length === 0}
              size="sm"
              variant="outline"
              className="bg-white hover:bg-red-50 border-gray-300 text-gray-700 hover:border-red-300"
            >
              <FileText className="h-4 w-4 mr-2 text-red-600" />
              PDF
            </Button>
            <Button
              onClick={() => exportToCSV(filteredTransactions, title)}
              disabled={filteredTransactions.length === 0}
              size="sm"
              variant="outline"
              className="bg-white hover:bg-blue-50 border-gray-300 text-gray-700 hover:border-blue-300"
            >
              <Download className="h-4 w-4 mr-2 text-blue-600" />
              CSV
            </Button>
          </div>
        </div>
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
