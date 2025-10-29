import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Deploy Agents",
    description: "Install lightweight agents on your endpoints with zero impact on performance.",
    details: "Our deployment process is seamless and takes just a few minutes. Agents are lightweight, auto-update, and require no user intervention.",
  },
  {
    number: "02",
    title: "Monitor & Analyze",
    description: "Our agents continuously monitors and analyzes endpoint behavior for potential threats.",
    details: "Behavioral analytics and AI models work together to detect anomalies and suspicious activity in real time, 24/7.",
  },
  {
    number: "03",
    title: "Detect Threats",
    description: "Advanced algorithms identify and classify potential security threats in real-time.",
    details: "Threats are detected instantly using advanced pattern recognition, minimizing false positives.",
  },
  {
    number: "04",
    title: "Respond & Protect",
    description: "Automated response mechanisms neutralize threats while keeping you informed.",
    details: "Automated playbooks isolate, remediate, and alert you to threats, ensuring your endpoints stay protected at all times.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-purple-100">How </span> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-white">NexusSentinel</span> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-purple-100"> Works</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
            Simple deployment, powerful protection
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 border-purple-300 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative p-6 transition-all duration-300 border group rounded-xl bg-card hover:shadow-lg hover:-translate-y-1 hover:border-purple-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 text-lg font-bold transition-transform duration-300 rounded-full bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-gradient-to-r group-hover:from-purple-700 group-hover:to-white group-hover:text-black">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 hidden lg:block">
                    <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-purple-700" />
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-xl font-semibold group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-700 group-hover:to-white">{step.title}</h3>
              <div className="relative h-16">
                <p className="absolute inset-0 flex items-center mb-2 transition-all duration-300 ease-in-out translate-y-0 opacity-100 text-muted-foreground group-hover:opacity-0 group-hover:translate-y-2">
                  {step.description}
                </p>
                <div className="absolute inset-0 flex items-center text-sm transition-all duration-300 ease-in-out translate-y-2 opacity-0 text-white/90 group-hover:opacity-100 group-hover:translate-y-0">
                  {step.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 