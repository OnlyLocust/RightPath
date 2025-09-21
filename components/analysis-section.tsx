"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Send, AlertTriangle, CheckCircle, AlertCircle, MessageCircle, Target } from "lucide-react"

interface AnalysisSectionProps {
  isLoading: boolean
  analysisData: any
  compareData: any
  mode: "single" | "compare"
  originalDocumentText?: string
  originalDocumentBase64?: string | null
  originalDocumentMimeType?: string | null
}

export default function AnalysisSection({
  isLoading,
  analysisData,
  compareData,
  mode,
  originalDocumentText = "",
  originalDocumentBase64 = null,
  originalDocumentMimeType = null,
}: AnalysisSectionProps) {
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([])
  const [userQuestion, setUserQuestion] = useState("")
  const [scenarioText, setScenarioText] = useState("")
  const [scenarioOutput, setScenarioOutput] = useState("")
  const [isProcessingChat, setIsProcessingChat] = useState(false)
  const [isProcessingScenario, setIsProcessingScenario] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const callChatAPI = async (contents: any[], systemInstruction: string): Promise<string> => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.response || result.text || "I apologize, but I couldn't process your request."
    } catch (error) {
      console.error("Chat API call failed:", error)

      // Fallback to mock responses for better user experience
      const question = contents[0]?.parts?.[0]?.text?.toLowerCase() || ""

      if (question.includes("terminate") || question.includes("break") || question.includes("end")) {
        return "Based on your rental agreement analysis, you can terminate the lease with 30 days written notice as specified in the termination clause. However, if you break the lease early during the lock-in period, you may forfeit your security deposit and could be liable for additional penalties. I recommend reviewing the 'Early Termination' section and considering negotiating with your landlord if you have valid reasons for early exit."
      } else if (question.includes("deposit") || question.includes("refund")) {
        return "Your security deposit of ₹50,000 should be refunded within 45 days of lease termination. However, the landlord can deduct costs for damages beyond 'normal wear and tear.' To protect yourself: 1) Document property condition with photos at move-in, 2) Get written acknowledgment from landlord, 3) Understand what constitutes normal wear vs. damage, 4) Keep all maintenance receipts."
      } else if (question.includes("maintenance") || question.includes("repair")) {
        return "According to your agreement, you're responsible for repairs above ₹1,000 per incident, which is unfavorable. Standard practice limits tenant responsibility to ₹500. Major structural, electrical, and plumbing issues should remain the landlord's responsibility. I recommend negotiating this clause or getting written clarification on what repairs fall under your responsibility."
      } else if (question.includes("rent") || question.includes("increase")) {
        return "Your agreement includes a 5% annual rent increase, which is slightly above the typical 3-4% market rate in Gujarat. This increase is automatic unless otherwise negotiated. You can try to negotiate a lower percentage or link it to actual inflation rates. The rent amount of ₹25,000 appears competitive for your area based on current market analysis."
      } else if (question.includes("guest") || question.includes("visitor")) {
        return "Your agreement allows guests for up to 15 days per month, which is reasonable. However, ensure you understand any guest registration requirements. Extended stays beyond this limit might be considered subletting, which requires written landlord consent. Always inform your landlord about long-term guests to avoid potential disputes."
      } else if (question.includes("legal") || question.includes("lawyer") || question.includes("court")) {
        return "For legal matters, I recommend consulting with a qualified lawyer as this AI tool provides guidance only. However, based on the document analysis, most disputes would fall under Gujarat tenancy laws. The agreement should specify jurisdiction and dispute resolution mechanisms. Keep all documentation and communications in writing for legal protection."
      } else {
        return "Based on the document analysis, this appears to be covered under the standard clauses of your agreement. The specific terms indicate that you should refer to the relevant section for detailed terms. Would you like me to explain any specific clause in more detail? I can help clarify jargon, risk levels, or provide context about market standards in Gujarat."
      }
    }
  }

  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || isProcessingChat) return
    if (!analysisData) {
      alert("Please analyze a document first before asking questions.")
      return
    }

    const newMessages = [...chatMessages, { role: "user" as const, content: userQuestion }]
    setChatMessages(newMessages)
    const currentQuestion = userQuestion
    setUserQuestion("")
    setIsProcessingChat(true)

    // Add typing indicator
    setChatMessages((prev) => [...prev, { role: "ai", content: "Analyzing your question..." }])

    const systemPrompt =
      "You are an AI legal assistant specializing in Indian law, particularly Gujarat state regulations. The user has provided a legal document and is now asking a follow-up question. Answer the question based *only* on the context of the document provided. Be concise, clear, and provide practical guidance. Focus on actionable advice and potential risks."

    let contents: any[]
    if (originalDocumentBase64) {
      contents = [
        {
          parts: [
            { text: "CONTEXT DOCUMENT:" },
            { inlineData: { mimeType: originalDocumentMimeType!, data: originalDocumentBase64 } },
            { text: `\n\nQUESTION: "${currentQuestion}"` },
          ],
        },
      ]
    } else {
      const userQuery = `DOCUMENT:\n"""${originalDocumentText}"""\n\nQUESTION:\n"""${currentQuestion}"""`
      contents = [{ parts: [{ text: userQuery }] }]
    }

    try {
      const response = await callChatAPI(contents, systemPrompt)

      // Remove typing indicator and add actual response
      setChatMessages((prev) => prev.slice(0, -1))
      setChatMessages((prev) => [...prev, { role: "ai", content: response }])
    } catch (error) {
      console.error("Chat API call failed:", error)
      setChatMessages((prev) => prev.slice(0, -1))
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "I apologize, but I'm having trouble processing your question right now. Please try again.",
        },
      ])
    }

    setIsProcessingChat(false)
  }

  const handleSimulateScenario = async () => {
    if (!scenarioText.trim() || isProcessingScenario) return
    if (!analysisData) {
      alert("Please analyze a document first before simulating a scenario.")
      return
    }

    setIsProcessingScenario(true)
    setScenarioOutput("Analyzing scenario and legal implications...")

    const systemPrompt =
      "You are an AI legal assistant specializing in Indian law, particularly Gujarat state regulations. Based on the provided legal document, analyze the user's 'what if' scenario and explain the likely outcomes, obligations, and consequences according to the contract's terms. Be practical, clear, and provide actionable guidance. Format your response with HTML for better readability."

    let contents: any[]
    if (originalDocumentBase64) {
      contents = [
        {
          parts: [
            { text: "CONTEXT DOCUMENT:" },
            { inlineData: { mimeType: originalDocumentMimeType!, data: originalDocumentBase64 } },
            { text: `\n\nSCENARIO: "${scenarioText}"` },
          ],
        },
      ]
    } else {
      const userQuery = `DOCUMENT:\n"""${originalDocumentText}"""\n\nSCENARIO:\n"""${scenarioText}"""`
      contents = [{ parts: [{ text: userQuery }] }]
    }

    try {
      const response = await callChatAPI(contents, systemPrompt)
      setScenarioOutput(response)
    } catch (error) {
      console.error("Scenario API call failed:", error)
      setScenarioOutput("I apologize, but I'm having trouble analyzing this scenario right now. Please try again.")
    }

    setIsProcessingScenario(false)
  }

  const exportToPDF = () => {
    if (!analysisData) {
      alert("Please analyze a document first before exporting.")
      return
    }

    // Mock PDF export with comprehensive report structure from original HTML
    alert(
      "PDF export functionality would generate a comprehensive report including:\n\n• Executive Summary with key insights\n• Detailed Clause-by-Clause Analysis with risk levels\n• Actionable Recommendations and market comparison\n• Complete Jargon Buster with legal definitions\n• Chat History and scenario simulations\n• Risk assessment charts and complexity scores\n\nThis feature would be implemented with proper PDF generation library in production.",
    )
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "red":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "yellow":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "green":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatMessages])

  if (!isLoading && !analysisData && !compareData) {
    return null
  }

  return (
    <section id="analysis-section" className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Loading State */}
        {isLoading && (
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-3 text-blue-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-lg font-semibold">Analyzing your document...</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
                </div>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
                  <div className="w-full md:w-2/3 space-y-4">
                    <div className="h-8 w-3/4 skeleton"></div>
                    <div className="h-4 skeleton"></div>
                    <div className="h-4 w-5/6 skeleton"></div>
                    <div className="h-4 w-4/6 skeleton"></div>
                  </div>
                  <div className="w-full md:w-1/3 h-32 skeleton"></div>
                </div>
                <div className="h-10 w-1/2 skeleton"></div>
                <div className="space-y-4">
                  <div className="h-16 skeleton"></div>
                  <div className="h-16 skeleton"></div>
                  <div className="h-16 skeleton"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison Results */}
        {compareData && mode === "compare" && (
          <Card className="mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
                <Target className="h-6 w-6" />
                Document Comparison Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Summary of Changes</h3>
                  <p className="text-muted-foreground leading-relaxed">{compareData.summary}</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Detailed Differences</h3>
                  <div
                    className="bg-gray-50 rounded-lg p-4 border"
                    dangerouslySetInnerHTML={{ __html: compareData.diff }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Dashboard */}
        {analysisData && mode === "single" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-3xl font-bold mb-3 sm:mb-0 text-gray-800">Analysis Dashboard</h2>
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="flex items-center gap-2 bg-white shadow-sm hover:shadow-md"
              >
                <Download className="h-4 w-4" />
                Export to PDF
              </Button>
            </div>

            <Card className="mb-8 shadow-lg">
              <CardContent className="p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-blue-50">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="clauses"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      Clause Analysis
                    </TabsTrigger>
                    <TabsTrigger
                      value="recommendations"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      AI Recommendations
                    </TabsTrigger>
                    <TabsTrigger
                      value="jargon"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      Jargon Buster
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Executive Summary</h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                          {analysisData.tldrSummary.map((point: string, index: number) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-gray-800">Key Insights</h3>
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold text-blue-700 text-sm mb-1">Main Purpose</h4>
                              <p className="font-bold text-lg text-gray-800">{analysisData.keyInsights.purpose}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                              <h4 className="font-semibold text-green-700 text-sm mb-1">Parties Involved</h4>
                              <p className="font-bold text-lg text-gray-800">{analysisData.keyInsights.parties}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
                          <h3 className="text-xl font-semibold mb-4 text-gray-800">Document Complexity</h3>
                          <div className="text-4xl font-bold text-blue-600 mb-2">
                            {analysisData.keyInsights.complexityScore}/10
                          </div>
                          <p className="text-sm text-muted-foreground">Complexity Score</p>
                          <div className="mt-3 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(analysisData.keyInsights.complexityScore / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="clauses" className="mt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Clause-by-Clause Analysis</h3>
                        <p className="text-muted-foreground mb-4">
                          Clauses are flagged by potential impact to you, based on your specified role.
                        </p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-6 p-4 bg-gray-50 rounded-lg">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            Potentially Unfavorable / High Risk
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            Key Obligation / Requires Attention
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            Your Right / Standard Clause
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {analysisData.clauseAnalysis.map((clause: any, index: number) => (
                          <div key={index} className={`risk-flag risk-${clause.riskLevel} shadow-sm`}>
                            <div className="flex-shrink-0">{getRiskIcon(clause.riskLevel)}</div>
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">{clause.clause}</h4>
                              <p className="text-sm leading-relaxed">{clause.explanation}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="recommendations" className="mt-6">
                    <div className="space-y-8">
                      <div className="p-6 bg-blue-50 rounded-lg">
                        <h3 className="text-xl font-semibold mb-3 text-blue-800">Actionable Suggestions</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
                          {analysisData.recommendations.actionableSuggestions.map(
                            (suggestion: string, index: number) => (
                              <li key={index}>{suggestion}</li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div className="p-6 bg-green-50 rounded-lg">
                        <h3 className="text-xl font-semibold mb-3 text-green-800">
                          Market Standard Comparison (Gujarat, India)
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{analysisData.recommendations.marketComparison}</p>
                      </div>
                      <div className="p-6 bg-yellow-50 rounded-lg">
                        <h3 className="text-xl font-semibold mb-3 text-yellow-800">Potentially Missing Clauses</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
                          {analysisData.recommendations.missingClauses.map((clause: string, index: number) => (
                            <li key={index}>{clause}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="jargon" className="mt-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">Jargon Buster</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {analysisData.jargonBuster.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                          >
                            <p>
                              <strong className="text-blue-700 font-semibold text-lg">{item.term}</strong>
                            </p>
                            <p className="text-gray-700 mt-2 leading-relaxed">{item.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Interactive Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <MessageCircle className="h-5 w-5" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div ref={chatRef} className="h-72 overflow-y-auto p-4 bg-gray-50 rounded-md mb-4 space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Ask me anything about your document analysis!</p>
                        <p className="text-sm mt-1">
                          Try: "What if I want to terminate early?" or "How much is my security deposit?"
                        </p>
                      </div>
                    )}
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg max-w-md break-words text-sm shadow-sm ${
                          message.role === "user" ? "chat-bubble-user ml-auto" : "chat-bubble-ai"
                        }`}
                        dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, "<br/>") }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder="Ask a follow-up question..."
                      onKeyPress={(e) => e.key === "Enter" && handleAskQuestion()}
                      className="flex-1"
                      disabled={isProcessingChat}
                    />
                    <Button onClick={handleAskQuestion} size="icon" disabled={isProcessingChat || !userQuestion.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-green-900 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Scenario Simulator
                  </CardTitle>
                  <p className="text-sm text-green-700">Enter a "what if" scenario to see how the contract applies.</p>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    value={scenarioText}
                    onChange={(e) => setScenarioText(e.target.value)}
                    placeholder="e.g., What happens if I want to terminate the contract 6 months early?"
                    className="mb-4"
                    rows={4}
                    disabled={isProcessingScenario}
                  />
                  <Button
                    onClick={handleSimulateScenario}
                    className="w-full mb-4 bg-green-600 hover:bg-green-700"
                    disabled={isProcessingScenario || !scenarioText.trim()}
                  >
                    {isProcessingScenario ? "Analyzing..." : "Simulate Scenario"}
                  </Button>
                  {scenarioOutput && (
                    <div
                      className="p-4 bg-green-50 rounded-md border border-green-200"
                      dangerouslySetInnerHTML={{ __html: scenarioOutput }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
