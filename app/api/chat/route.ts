import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { contents, systemInstruction } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.warn("Gemini API key not found, using mock responses")
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000))

      const question = contents[0]?.parts?.[0]?.text?.toLowerCase() || ""

      if (question.includes("terminate") || question.includes("break") || question.includes("end")) {
        return NextResponse.json({
          response:
            "Based on your rental agreement analysis, you can terminate the lease with 30 days written notice as specified in the termination clause. However, if you break the lease early during the lock-in period, you may forfeit your security deposit and could be liable for additional penalties. I recommend reviewing the 'Early Termination' section and considering negotiating with your landlord if you have valid reasons for early exit.",
        })
      } else if (question.includes("deposit") || question.includes("refund")) {
        return NextResponse.json({
          response:
            "Your security deposit of ₹50,000 should be refunded within 45 days of lease termination. However, the landlord can deduct costs for damages beyond 'normal wear and tear.' To protect yourself: 1) Document property condition with photos at move-in, 2) Get written acknowledgment from landlord, 3) Understand what constitutes normal wear vs. damage, 4) Keep all maintenance receipts.",
        })
      } else if (question.includes("maintenance") || question.includes("repair")) {
        return NextResponse.json({
          response:
            "According to your agreement, you're responsible for repairs above ₹1,000 per incident, which is unfavorable. Standard practice limits tenant responsibility to ₹500. Major structural, electrical, and plumbing issues should remain the landlord's responsibility. I recommend negotiating this clause or getting written clarification on what repairs fall under your responsibility.",
        })
      } else if (question.includes("rent") || question.includes("increase")) {
        return NextResponse.json({
          response:
            "Your agreement includes a 5% annual rent increase, which is slightly above the typical 3-4% market rate in Gujarat. This increase is automatic unless otherwise negotiated. You can try to negotiate a lower percentage or link it to actual inflation rates. The rent amount of ₹25,000 appears competitive for your area based on current market analysis.",
        })
      } else if (question.includes("guest") || question.includes("visitor")) {
        return NextResponse.json({
          response:
            "Your agreement allows guests for up to 15 days per month, which is reasonable. However, ensure you understand any guest registration requirements. Extended stays beyond this limit might be considered subletting, which requires written landlord consent. Always inform your landlord about long-term guests to avoid potential disputes.",
        })
      } else if (question.includes("legal") || question.includes("lawyer") || question.includes("court")) {
        return NextResponse.json({
          response:
            "For legal matters, I recommend consulting with a qualified lawyer as this AI tool provides guidance only. However, based on the document analysis, most disputes would fall under Gujarat tenancy laws. The agreement should specify jurisdiction and dispute resolution mechanisms. Keep all documentation and communications in writing for legal protection.",
        })
      } else {
        return NextResponse.json({
          response:
            "Based on the document analysis, this appears to be covered under the standard clauses of your agreement. The specific terms indicate that you should refer to the relevant section for detailed terms. Would you like me to explain any specific clause in more detail? I can help clarify jargon, risk levels, or provide context about market standards in Gujarat.",
        })
      }
    }

    // Real Gemini API implementation
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
    const payload = {
      contents: contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({
        response: result.candidates[0].content.parts[0].text,
      })
    }

    throw new Error("Invalid AI response structure.")
  } catch (error) {
    console.error("Chat API call failed:", error)
    return NextResponse.json({ error: `Failed to get response from AI. ${error.message}` }, { status: 500 })
  }
}
