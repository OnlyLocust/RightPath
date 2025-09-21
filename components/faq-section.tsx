"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function FAQSection() {
  const [openItem, setOpenItem] = useState<number | null>(null)

  const faqs = [
    {
      question: "Is my data secure with RightPath?",
      answer:
        "Absolutely. We use state-of-the-art end-to-end encryption for all documents. We cannot access your files, and you have full control to delete your data at any time. Our system is designed with privacy as its core principle.",
    },
    {
      question: "Can RightPath replace a lawyer?",
      answer:
        "No. RightPath is a powerful tool designed to provide clarity and initial guidance, making you a more informed party. It is not a substitute for professional legal advice. For critical matters, we always recommend consulting with a qualified lawyer.",
    },
  ]

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index)
  }

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-border rounded-lg">
              <button
                className="flex justify-between items-center p-5 w-full text-left"
                onClick={() => toggleItem(index)}
              >
                <h5 className="font-semibold">{faq.question}</h5>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    openItem === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openItem === index && (
                <div className="px-5 pb-5">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
