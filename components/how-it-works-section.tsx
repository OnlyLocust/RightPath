export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Upload Securely",
      description:
        "Drag and drop or upload your document. We support PDF, DOCX, and even images. Your file is encrypted immediately.",
    },
    {
      number: 2,
      title: "AI-Powered Analysis",
      description:
        "Our AI scans your document for jargon, risks, and key obligations, cross-referencing it with relevant Indian legal frameworks.",
    },
    {
      number: 3,
      title: "Receive Clear Guidance",
      description:
        "Get an interactive report with summaries, risk alerts, and plain-language explanations, empowering you to make confident decisions.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Get Clarity in 3 Simple Steps</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-pretty">
            Our streamlined process makes understanding complex documents effortless.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {steps.map((step) => (
            <div key={step.number} className="p-6">
              <div className="bg-primary/10 text-primary rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-pretty">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
