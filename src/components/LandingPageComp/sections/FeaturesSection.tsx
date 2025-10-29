import { Shield, Zap, Brain, Lock } from "lucide-react";

const features = [
  {
    title: "Real-time Threat Detection",
    description: "Advanced algorithms monitor your endpoints 24/7, detecting and analyzing potential threats in real-time.",
    icon: Shield,
  },
  {
    title: "Lightning Fast Response",
    description: "Automated response mechanisms that act within milliseconds to contain and neutralize threats.",
    icon: Zap,
  },
  {
    title: "AI-Powered Analysis",
    description: "Machine learning models that gives information about security.",
    icon: Brain,
  },
  {
    title: "Zero Trust Security",
    description: "Implement strict access controls and continuous verification for all endpoints and users.",
    icon: Lock,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Powerful Features for Modern Security
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
            Comprehensive protection powered by cutting-edge technology
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 transition-all duration-300 border rounded-xl group bg-card hover:shadow-lg hover:-translate-y-1 hover:border-purple-500"
            >
              <div className="inline-block p-3 mb-4 rounded-lg bg-primary/10 text-primary">
                <feature.icon className="w-6 h-6 group-hover:text-purple-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 