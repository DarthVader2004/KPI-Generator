"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Loader2, BarChart3, Target, Zap, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface KPIResult {
  name: string
  description: string
  tier: string
  sql: string
  pandas: string
  dax: string
}

export default function KPIGenerator() {
  const [domain, setDomain] = useState("")
  const [columns, setColumns] = useState("")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [results, setResults] = useState<KPIResult[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const tiers = [
    {
      value: "all",
      label: "All Tiers",
      icon: BarChart3,
      description: "Generate KPIs across all organizational levels",
    },
    { value: "strategic", label: "Strategic", icon: Target, description: "Long-term company goals and vision" },
    { value: "tactical", label: "Tactical", icon: TrendingUp, description: "Department-level performance metrics" },
    {
      value: "operational",
      label: "Operational",
      icon: Zap,
      description: "Day-to-day tasks and individual contributions",
    },
    {
      value: "analytical",
      label: "Analytical",
      icon: BarChart3,
      description: "Deep data analysis and trend identification",
    },
  ]

  const generateKPIs = async () => {
    if (!domain.trim() || !columns.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both domain description and column headings.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/generate-kpis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, columns, tier: selectedTier }),
      })

      if (!response.ok) throw new Error("Failed to generate KPIs")

      const data = await response.json()
      setResults(data.kpis)

      toast({
        title: "KPIs Generated Successfully",
        description: `Generated ${data.kpis.length} relevant KPIs for your dataset.`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate KPIs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} code copied to clipboard.`,
    })
  }

  const downloadPDF = () => {
    // Simple PDF generation - in production, you'd use a proper PDF library
    const content = results
      .map(
        (kpi) =>
          `${kpi.name} (${kpi.tier})\n${kpi.description}\n\nSQL:\n${kpi.sql}\n\nPandas:\n${kpi.pandas}\n\nDAX:\n${kpi.dax}\n\n---\n\n`,
      )
      .join("")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "kpi-suggestions.txt"
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Download Started",
      description: "Your KPI suggestions are being downloaded.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">KPI Generator</h1>
              <p className="text-gray-600">Generate relevant KPIs with SQL, Pandas, and DAX queries</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Dataset Information
            </CardTitle>
            <CardDescription>
              Describe your data domain and provide column headings to get personalized KPI suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Data Domain & Description</label>
              <Textarea
                placeholder="e.g., E-commerce retail platform with customer transactions, product catalog, and user behavior data. We track sales, inventory, customer engagement, and marketing campaigns..."
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dataset Column Headings</label>
              <Textarea
                placeholder="e.g., customer_id, order_date, product_id, quantity, price, category, customer_age, region, payment_method, discount_applied, shipping_cost..."
                value={columns}
                onChange={(e) => setColumns(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">KPI Tier Focus</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tiers.map((tier) => {
                  const Icon = tier.icon
                  return (
                    <Card
                      key={tier.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTier === tier.value ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedTier(tier.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon
                            className={`w-5 h-5 mt-0.5 ${
                              selectedTier === tier.value ? "text-blue-600" : "text-gray-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm">{tier.label}</h3>
                            <p className="text-xs text-gray-600 mt-1">{tier.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <Button
              onClick={generateKPIs}
              disabled={loading || !domain.trim() || !columns.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating KPIs...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate KPI Suggestions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Generated KPIs ({results.length})</h2>
              <Button onClick={downloadPDF} variant="outline" className="gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Download Results
              </Button>
            </div>

            <div className="grid gap-6 ">
              {results.map((kpi, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/70 backdrop-blur-sm max-w-4xl mx-auto">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{kpi.name}</CardTitle>
                        <CardDescription className="mt-2">{kpi.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {kpi.tier}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* SQL Query */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-gray-700">SQL Query</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(kpi.sql, "SQL")}
                          className="h-8 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="w-full max-w-full overflow-x-auto">
                        <pre className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre min-w-0">
                          <code>{kpi.sql}</code>
                        </pre>
                      </div>
                    </div>

                    {/* Pandas Query */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-gray-700">Pandas Code</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(kpi.pandas, "Pandas")}
                          className="h-8 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="w-full max-w-full overflow-x-auto">
                        <pre className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre min-w-0">
                          <code>{kpi.pandas}</code>
                        </pre>
                      </div>
                    </div>

                    {/* DAX Query */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-gray-700">DAX Query</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(kpi.dax, "DAX")}
                          className="h-8 px-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="w-full max-w-full overflow-x-auto">
                        <pre className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre min-w-0">
                          <code>{kpi.dax}</code>
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && (
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate KPIs</h3>
              <p className="text-gray-600">
                Fill in your dataset information above to get personalized KPI suggestions with SQL, Pandas, and DAX
                queries.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
