"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"

interface HeroSectionProps {
  mode: "single" | "compare"
  setMode: (mode: "single" | "compare") => void
  onAnalysisStart: () => void
  onAnalysisComplete: (data: any, isComparison?: boolean) => void
  onDocumentContext: (text: string, base64: string | null, mimeType: string | null, role: string) => void
}

export default function HeroSection({
  mode,
  setMode,
  onAnalysisStart,
  onAnalysisComplete,
  onDocumentContext,
}: HeroSectionProps) {
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    single: null,
    v1: null,
    v2: null,
  })
  const [userRole, setUserRole] = useState("")
  const [dragOver, setDragOver] = useState<string | null>(null)

  const fileInputRefs = {
    single: useRef<HTMLInputElement>(null),
    v1: useRef<HTMLInputElement>(null),
    v2: useRef<HTMLInputElement>(null),
  }

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
      reader.readAsText(file)
    })
  }

  const callAnalysisAPI = async (contents: any[], systemInstruction: string, isComparison = false): Promise<any> => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction,
          isComparison,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Analysis API call failed:", error)
      throw error
    }
  }

  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault()
    setDragOver(type)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(null)
  }

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault()
    setDragOver(null)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles[0]) {
      setFiles((prev) => ({ ...prev, [type]: droppedFiles[0] }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFiles((prev) => ({ ...prev, [type]: selectedFile }))
    }
  }

  const performAnalysis = async () => {
    if (mode === "single" && !files.single) {
      alert("Please upload a document.")
      return
    }

    if (mode === "compare" && (!files.v1 || !files.v2)) {
      alert("Please upload both document versions.")
      return
    }

    onAnalysisStart()

    try {
      if (mode === "single") {
        const file = files.single!
        const role = userRole || "a user"

        let contents: any[]
        let documentText = ""
        let documentBase64: string | null = null
        let documentMimeType: string | null = null

        const systemPrompt = `You are an expert legal analyst AI specializing in Indian law, particularly Gujarat state regulations. Your task is to analyze the provided legal document for a user whose role is "${role}". Provide a comprehensive, point-wise analysis that includes risk assessment, market comparison, and actionable recommendations. Focus on practical implications and potential issues the user should be aware of. Respond with a single JSON object with this exact structure: {"tldrSummary": ["string"], "keyInsights": {"purpose": "string", "parties": "string", "complexityScore": integer(1-10)}, "clauseAnalysis": [{"clause": "string", "explanation": "string (detailed point-wise explanation)", "riskLevel": "string(red, yellow, or green)"}], "recommendations": {"actionableSuggestions": ["string (detailed, point-wise)"], "marketComparison": "string (detailed)", "missingClauses": ["string (point-wise)"]}, "jargonBuster": [{"term": "string", "definition": "string"}]}`

        if (file.type === "application/pdf") {
          const base64Data = await readFileAsBase64(file)
          const base64Content = base64Data.split(",")[1]
          documentBase64 = base64Content
          documentMimeType = file.type
          contents = [{ parts: [{ inlineData: { mimeType: file.type, data: base64Content } }] }]
        } else {
          const fileText = await readFileAsText(file)
          documentText = fileText
          contents = [{ parts: [{ text: fileText }] }]
        }

        onDocumentContext(documentText, documentBase64, documentMimeType, role)

        const analysisData = await callAnalysisAPI(contents, systemPrompt)
        onAnalysisComplete(analysisData)
      } else {
        const file1 = files.v1!
        const file2 = files.v2!

        if (file1.type.includes("pdf") || file2.type.includes("pdf")) {
          alert("PDF comparison is not supported yet. Please use .txt files for version comparison.")
          return
        }

        const text1 = await readFileAsText(file1)
        const text2 = await readFileAsText(file2)

        const systemPrompt = `You are an AI that compares two versions of a legal document. Identify additions, removals, and modifications with focus on how these changes impact the user's rights and obligations. Provide a high-level summary and a detailed diff showing the practical implications of each change. For the diff, use specific formatting: wrap added text in <add></add> tags and removed text in <del></del> tags. Respond with a single JSON object with this exact structure: {"summary": "string", "diff": "string"}`
        const userPrompt = `DOCUMENT V1:\n"""${text1}"""\n\nDOCUMENT V2:\n"""${text2}"""`
        const contents = [{ parts: [{ text: userPrompt }] }]

        const compareData = await callAnalysisAPI(contents, systemPrompt, true)

        compareData.diff = compareData.diff
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/&lt;add&gt;/g, '<span class="diff-add">')
          .replace(/&lt;\/add&gt;/g, "</span>")
          .replace(/&lt;del&gt;/g, '<span class="diff-remove">')
          .replace(/&lt;\/del&gt;/g, "</span>")

        onAnalysisComplete(compareData, true)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      alert("Analysis failed. Please try again.")
    }
  }

  return (
    <section id="app" className="hero-gradient pt-32 pb-20 text-white">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 text-balance">
          Demystify Legal Documents with AI
        </h1>
        <p className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto mb-8 text-pretty">
          From rental agreements to complex contracts, get clear, simple, and actionable guidance. Your private and
          secure legal assistant, grounded in Indian law.
        </p>

        <Card className="bg-white/20 backdrop-blur-sm border-white/30 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <div className="bg-black/20 rounded-lg p-1.5 max-w-sm mx-auto shadow-md">
                <Button
                  variant={mode === "single" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode("single")}
                  className={
                    mode === "single" ? "bg-white text-blue-800 font-semibold" : "text-blue-200 hover:text-white"
                  }
                >
                  Single Document Analysis
                </Button>
                <Button
                  variant={mode === "compare" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode("compare")}
                  className={
                    mode === "compare" ? "bg-white text-blue-800 font-semibold" : "text-blue-200 hover:text-white"
                  }
                >
                  Version Comparison
                </Button>
              </div>
            </div>

            {mode === "single" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div
                    className={`file-upload-area border-dashed rounded-lg p-6 text-center cursor-pointer h-full flex flex-col justify-center transition-all ${
                      dragOver === "single" ? "dragover" : ""
                    }`}
                    onDragOver={(e) => handleDragOver(e, "single")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "single")}
                    onClick={() => fileInputRefs.single.current?.click()}
                  >
                    <input
                      ref={fileInputRefs.single}
                      type="file"
                      className="hidden"
                      accept=".txt,.pdf"
                      onChange={(e) => handleFileChange(e, "single")}
                    />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-white" />
                    <p className="font-semibold text-white">Upload Document</p>
                    {files.single && <p className="mt-1 text-sm font-medium text-blue-200">{files.single.name}</p>}
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="block text-md font-medium text-white">What is your role?</label>
                    <Input
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder-blue-200 focus:ring-2 focus:ring-white"
                      placeholder="e.g., Tenant, Employee, Buyer"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={performAnalysis}
                    className="bg-white text-blue-800 hover:bg-blue-100 font-semibold py-3 px-8 shadow-lg"
                  >
                    Analyze Document
                  </Button>
                </div>
              </div>
            )}

            {mode === "compare" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`file-upload-area border-dashed rounded-lg p-6 text-center cursor-pointer h-full flex flex-col justify-center transition-all ${
                      dragOver === "v1" ? "dragover" : ""
                    }`}
                    onDragOver={(e) => handleDragOver(e, "v1")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "v1")}
                    onClick={() => fileInputRefs.v1.current?.click()}
                  >
                    <input
                      ref={fileInputRefs.v1}
                      type="file"
                      className="hidden"
                      accept=".txt,.pdf"
                      onChange={(e) => handleFileChange(e, "v1")}
                    />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-white" />
                    <p className="font-semibold text-white">Original Document (V1)</p>
                    {files.v1 && <p className="mt-1 text-sm font-medium text-blue-200">{files.v1.name}</p>}
                  </div>

                  <div
                    className={`file-upload-area border-dashed rounded-lg p-6 text-center cursor-pointer h-full flex flex-col justify-center transition-all ${
                      dragOver === "v2" ? "dragover" : ""
                    }`}
                    onDragOver={(e) => handleDragOver(e, "v2")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "v2")}
                    onClick={() => fileInputRefs.v2.current?.click()}
                  >
                    <input
                      ref={fileInputRefs.v2}
                      type="file"
                      className="hidden"
                      accept=".txt,.pdf"
                      onChange={(e) => handleFileChange(e, "v2")}
                    />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-white" />
                    <p className="font-semibold text-white">Revised Document (V2)</p>
                    {files.v2 && <p className="mt-1 text-sm font-medium text-blue-200">{files.v2.name}</p>}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={performAnalysis}
                    className="bg-white text-blue-800 hover:bg-blue-100 font-semibold py-3 px-8 shadow-lg"
                  >
                    Compare Versions
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-sm text-blue-300">End-to-end encrypted & secure.</p>
      </div>
    </section>
  )
}
