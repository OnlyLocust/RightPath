import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { contents, systemInstruction, isComparison } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.warn("Gemini API key not found, using mock data")
      await new Promise((resolve) => setTimeout(resolve, 3000 + Math.random() * 2000))

      if (isComparison) {
        return NextResponse.json({
          summary:
            "The revised document includes several significant changes that generally favor the landlord: rent increase from ₹25,000 to ₹28,000 (12% increase), extended lease term from 11 to 24 months, additional pet policy restrictions, parking fee introduction of ₹1,500/month, and stricter maintenance terms with tenant responsibility increased to ₹2,000 per incident. The changes also include new clauses for mandatory renter's insurance (₹2,00,000 coverage), modified guest policy (reduced from 15 to 7 days/month), and extended termination notice from 30 to 60 days.",
          diff: `<div class="space-y-4">
            <div class="p-3 border-l-4 border-blue-500 bg-blue-50">
              <h4 class="font-semibold text-blue-800">Rent and Financial Terms</h4>
              <p>Monthly rent: <span class="diff-remove">₹25,000</span> <span class="diff-add">₹28,000</span></p>
              <p><span class="diff-add">Parking fee: ₹1,500 per month (previously included)</span></p>
              <p>Security deposit: ₹50,000 <span class="diff-add">(now includes ₹5,000 pet deposit if applicable)</span></p>
              <p><span class="diff-add">Annual rent escalation: 5% → 7%</span></p>
            </div>
            
            <div class="p-3 border-l-4 border-yellow-500 bg-yellow-50">
              <h4 class="font-semibold text-yellow-800">Lease Terms</h4>
              <p>Lease duration: <span class="diff-remove">11 months</span> <span class="diff-add">24 months with 6-month lock-in period</span></p>
              <p>Termination notice: <span class="diff-remove">30 days</span> <span class="diff-add">60 days written notice required</span></p>
              <p><span class="diff-add">Early termination penalty: 2 months rent (new clause)</span></p>
            </div>
            
            <div class="p-3 border-l-4 border-green-500 bg-green-50">
              <h4 class="font-semibold text-green-800">New Additions</h4>
              <p><span class="diff-add">Pet Policy: Maximum 1 pet allowed with ₹5,000 additional deposit and monthly pet fee of ₹500</span></p>
              <p><span class="diff-add">Property Insurance: Tenant must maintain renter's insurance with minimum ₹2,00,000 coverage</span></p>
              <p><span class="diff-add">Maintenance Cap: Tenant responsibility increased to ₹2,000 per incident (from ₹1,000)</span></p>
              <p><span class="diff-add">Utility Cap: Tenant responsible for utilities above ₹3,000/month</span></p>
            </div>
            
            <div class="p-3 border-l-4 border-red-500 bg-red-50">
              <h4 class="font-semibold text-red-800">Removed/Modified Clauses</h4>
              <p><span class="diff-remove">Free parking space included in rent</span></p>
              <p><span class="diff-remove">Flexible guest policy (15 days/month)</span> <span class="diff-add">Restricted guest policy (7 days/month, registration required)</span></p>
              <p><span class="diff-remove">Landlord covers all major repairs</span> <span class="diff-add">Tenant liable for repairs above ₹2,000</span></p>
              <p><span class="diff-remove">30-day notice period</span> <span class="diff-add">60-day notice with early termination penalties</span></p>
            </div>
          </div>`,
        })
      } else {
        return NextResponse.json({
          tldrSummary: [
            "This is a comprehensive residential rental agreement between landlord Rajesh Kumar Patel and tenant Priya Sharma for an unfurnished 2BHK apartment in Ahmedabad, Gujarat",
            "Monthly rent is ₹25,000 with a security deposit of ₹50,000 (2 months rent), refundable within 45 days of lease termination",
            "Lease term is 11 months with automatic renewal clause unless terminated with 30 days written notice by either party",
            "Tenant is responsible for utilities (electricity, water, gas), minor maintenance under ₹1,000, and property upkeep including cleaning and pest control",
            "Agreement includes standard clauses for termination, subletting restrictions (requires written consent), and damage liability beyond normal wear and tear",
            "Property includes one designated parking space, basic fixtures, and amenities as specified in Schedule A attachment",
            "Annual rent escalation of 5% applies after the first year, with guest policy allowing visitors up to 15 days per month",
          ],
          keyInsights: {
            purpose: "Residential Rental Agreement - Unfurnished 2BHK Apartment",
            parties: "Landlord: Rajesh Kumar Patel, Tenant: Priya Sharma",
            complexityScore: 7,
          },
          clauseAnalysis: [
            {
              clause: "Security Deposit and Refund Terms (Clause 3.2)",
              explanation:
                "Security deposit of ₹50,000 (2x monthly rent) is refundable within 45 days of lease termination. However, the agreement allows deductions for 'any damages beyond normal wear and tear' which is subjectively defined and could lead to disputes. The clause also permits deductions for unpaid utilities and cleaning charges. Recommendation: Document property condition thoroughly at move-in with timestamped photos and videos, get written acknowledgment from landlord, and understand what constitutes normal wear vs. damage.",
              riskLevel: "yellow",
            },
            {
              clause: "Maintenance and Repair Responsibilities (Clause 5.1)",
              explanation:
                "Tenant is responsible for ALL repairs and maintenance costs above ₹1,000 per incident, including electrical, plumbing, and appliance repairs. This is significantly unfavorable as it transfers major repair costs to tenant. Standard practice in Gujarat limits tenant responsibility to ₹500-₹1,000 for minor repairs only. Major structural, electrical, and plumbing issues should remain landlord's responsibility. This clause could result in unexpected expenses of ₹10,000+ for major repairs.",
              riskLevel: "red",
            },
            {
              clause: "Termination and Notice Period (Clause 8.1)",
              explanation:
                "Either party can terminate with 30 days written notice, providing reasonable flexibility. The clause specifies notice must be given before the 1st of the month to avoid pro-rated rent complications. No early termination penalties during the 11-month term, which is favorable. However, ensure you understand the exact notice format required and delivery method (registered post, email, etc.).",
              riskLevel: "green",
            },
            {
              clause: "Rent Escalation Clause (Clause 2.3)",
              explanation:
                "Rent increases by 5% annually after the first year, which provides predictability but is slightly above the typical 3-4% market rate in Gujarat. Over 5 years, this compounds to a 27.6% total increase. Consider negotiating a cap at 4% or linking it to actual CPI inflation rates. The clause also allows for mid-term rent revision if property taxes increase significantly.",
              riskLevel: "yellow",
            },
            {
              clause: "Subletting and Guest Policy (Clause 6.2 & 6.3)",
              explanation:
                "Subletting is prohibited without written landlord consent, which is standard. Guest stays are limited to 15 days per month with registration required for stays over 7 days. These restrictions are reasonable and protect landlord's interests while allowing normal social activities. Violation could result in lease termination. Ensure you understand the guest registration process and any associated fees.",
              riskLevel: "green",
            },
            {
              clause: "Property Usage and Restrictions (Clause 4.1)",
              explanation:
                "Property is restricted to residential use only with no commercial activities, home businesses, or short-term rentals allowed. Pets require prior written consent with additional deposit (amount not specified). The 'no alterations without consent' clause is quite strict - even minor changes like painting, drilling holes, or installing fixtures require permission. This could limit your ability to personalize the space.",
              riskLevel: "yellow",
            },
            {
              clause: "Utility and Service Charges (Clause 3.4)",
              explanation:
                "Tenant is responsible for all utilities including electricity, water, gas, internet, and cable TV. The agreement doesn't specify any caps on utility costs, which could be problematic if there are hidden charges or if previous bills are outstanding. Ensure all utility connections are transferred to your name and verify no pending dues before taking possession.",
              riskLevel: "yellow",
            },
            {
              clause: "Parking and Common Area Usage (Clause 4.3)",
              explanation:
                "One designated parking space is included in the rent, which is favorable. However, the clause doesn't specify the exact location or provide protection if the space is occupied by others. Common area usage is allowed but with restrictions on storage and modifications. Ensure parking space location is clearly marked and documented.",
              riskLevel: "green",
            },
          ],
          recommendations: {
            actionableSuggestions: [
              "Document property condition comprehensively with timestamped photos/videos of every room, fixture, and appliance before moving in and get landlord's written acknowledgment",
              "Negotiate the maintenance responsibility cap from ₹1,000 to ₹500 per incident, and exclude major structural, electrical, and plumbing issues from tenant responsibility",
              "Request detailed clarification on what constitutes 'normal wear and tear' vs. damage requiring security deposit deduction, and get this in writing",
              "Negotiate rent escalation from 5% to 4% annually or link to actual CPI inflation rates to avoid excessive increases",
              "Ensure all appliances, fixtures, and electrical/plumbing systems are in working condition before signing and get this documented with warranty periods",
              "Request a detailed inventory list of all items included with the property, including furniture, appliances, and fixtures with their current condition",
              "Clarify the guest registration process, any associated fees, and the exact procedure for obtaining landlord consent for pets or modifications",
              "Get written confirmation of parking space location (specific number/area) and ensure it's protected from unauthorized use",
              "Verify all utility connections are properly transferred and no outstanding dues exist from previous tenants",
              "Understand the exact notice format, delivery method, and timeline required for lease termination to avoid disputes",
            ],
            marketComparison:
              "The rent of ₹25,000 for a 2BHK unfurnished apartment in Ahmedabad is competitive and aligns with current market rates for similar properties in decent localities. Security deposit at 2x monthly rent is standard practice in Gujarat. However, several clauses are less favorable than typical agreements: (1) Maintenance clause transferring ₹1,000+ repairs to tenant is above market standard of ₹500, (2) 5% annual rent increase is higher than the typical 3-4% market average, (3) Strict alteration restrictions are more limiting than usual. Overall, this agreement leans moderately in favor of the landlord but remains within acceptable ranges for the local market. The inclusion of parking space and reasonable guest policy are positive aspects.",
            missingClauses: [
              "Pet policy details including specific pet deposit amount, monthly pet fees, and restrictions on pet types/sizes",
              "Internet and cable TV installation responsibilities, speed requirements, and cost-sharing arrangements",
              "Detailed parking space allocation with specific location/number and protection against unauthorized use",
              "Landlord property inspection procedures including required notice period (typically 24-48 hours) and frequency limits",
              "Force majeure clause covering natural disasters, government restrictions, or pandemic-related situations",
              "Dispute resolution mechanism specifying mediation/arbitration process and jurisdiction for legal matters",
              "Utility connection transfer process, responsibility for outstanding bills, and procedure for handling utility disputes",
              "Property insurance requirements, coverage amounts, and clarification of who bears the cost (landlord vs. tenant)",
              "Maintenance emergency contact information and procedures for urgent repairs outside business hours",
              "Inventory list of all included items with their condition and responsibility for replacement/repair",
            ],
          },
          jargonBuster: [
            {
              term: "Security Deposit",
              definition:
                "Money paid upfront (typically 1-3 months rent in India) to protect the landlord against property damage, unpaid rent, or cleaning costs. Must be refunded within 45 days of lease termination if no legitimate deductions apply. In Gujarat, 2 months rent is standard practice.",
            },
            {
              term: "Normal Wear and Tear",
              definition:
                "Expected deterioration from regular residential use over time, such as minor scuff marks, small nail holes, faded paint, carpet wear in high-traffic areas, or minor scratches on fixtures. Tenant is NOT responsible for these costs as they're considered natural aging of the property.",
            },
            {
              term: "Subletting",
              definition:
                "Renting out the property (or part of it) to another person while you remain the official tenant and primary leaseholder. Usually requires written landlord permission and may involve additional documentation, background checks, and deposits.",
            },
            {
              term: "Lock-in Period",
              definition:
                "Initial period (usually 11 months in India) during which neither party can terminate the lease without penalty, providing stability for both landlord and tenant. After this period, termination is typically allowed with proper notice.",
            },
            {
              term: "Escalation Clause",
              definition:
                "Provision for automatic rent increases at specified intervals (usually annually). Should be reasonable (3-5% in India) and ideally linked to inflation or market rates rather than arbitrary percentages.",
            },
            {
              term: "Force Majeure",
              definition:
                "Unforeseeable circumstances beyond anyone's control (natural disasters, government actions, pandemics, wars) that prevent fulfillment of contract obligations. Important for protecting both parties during emergencies or extraordinary situations.",
            },
            {
              term: "Jurisdiction Clause",
              definition:
                "Specifies which court/legal system will handle disputes arising from the agreement. Usually the location where the property is situated. In this case, it would be Gujarat state courts following Indian tenancy laws.",
            },
            {
              term: "Registered Agreement",
              definition:
                "Lease agreement that's officially registered with local authorities (Sub-Registrar office) for legal validity. Registration involves stamp duty payment and makes the agreement legally enforceable in courts.",
            },
          ],
        })
      }
    }

    // Real Gemini API implementation
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
    const payload = {
      contents: contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { responseMimeType: "application/json" },
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
      return NextResponse.json(JSON.parse(result.candidates[0].content.parts[0].text))
    }

    throw new Error("Invalid AI response structure.")
  } catch (error) {
    console.error("Gemini API call failed:", error)
    return NextResponse.json({ error: `Failed to get response from AI. ${error.message}` }, { status: 500 })
  }
}
