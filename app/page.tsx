"use client"

import { useState } from "react"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import HowItWorksSection from "@/components/how-it-works-section"
import FAQSection from "@/components/faq-section"
import Footer from "@/components/footer"
import AnalysisSection from "@/components/analysis-section"

export default function LegalDocumentAnalyzer() {
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [compareData, setCompareData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"single" | "compare">("single")
  const [originalDocumentText, setOriginalDocumentText] = useState("")
  const [originalDocumentBase64, setOriginalDocumentBase64] = useState<string | null>(null)
  const [originalDocumentMimeType, setOriginalDocumentMimeType] = useState<string | null>(null)
  const [userRole, setUserRole] = useState("")

  const handleAnalysisComplete = (data: any, isComparison = false) => {
    if (isComparison) {
      setCompareData(data)
    } else {
      setAnalysisData(data)
    }
    setShowAnalysis(true)
    setIsLoading(false)
  }

  const handleAnalysisStart = () => {
    setIsLoading(true)
    setShowAnalysis(true)
  }

  const handleDocumentContext = (text: string, base64: string | null, mimeType: string | null, role: string) => {
    setOriginalDocumentText(text)
    setOriginalDocumentBase64(base64)
    setOriginalDocumentMimeType(mimeType)
    setUserRole(role)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection
          mode={mode}
          setMode={setMode}
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onDocumentContext={handleDocumentContext}
        />

        {showAnalysis && (
          <AnalysisSection
            isLoading={isLoading}
            analysisData={analysisData}
            compareData={compareData}
            mode={mode}
            originalDocumentText={originalDocumentText}
            originalDocumentBase64={originalDocumentBase64}
            originalDocumentMimeType={originalDocumentMimeType}
          />
        )}

        <HowItWorksSection />
        <FeaturesSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  )
}
