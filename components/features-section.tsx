import { FileText, AlertTriangle, MessageCircle } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Instant Summary",
      description: "Get a high-level, easy-to-read summary of any document, highlighting its purpose and key outcomes.",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Risk Highlighting",
      description:
        "Automatically flags unfavorable, non-standard, or high-risk clauses, color-coded for easy identification.",
      bgColor: "bg-destructive/10",
      iconColor: "text-destructive",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Natural Language Q&A",
      description:
        'Ask specific questions in your own words (e.g., "What if I break my lease?") and get clear answers.',
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary",
    },
  ]

  return (
    <section id="features" className="py-20 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">A Comprehensive Feature Suite</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-pretty">
            Everything you need to make informed decisions with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card bg-background p-8 rounded-xl border">
              <div
                className={`${feature.bgColor} ${feature.iconColor} rounded-full h-12 w-12 flex items-center justify-center mb-4`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-pretty">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
