import { Check } from "lucide-react";
import { Button } from "../../../components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for small businesses",
    features: [
      "Up to 50 endpoints",
      "Basic threat detection",
      "Email support",
      "Weekly reports",
    ],
  },
  {
    name: "Professional",
    price: "$99",
    description: "Ideal for growing companies",
    features: [
      "Up to 200 endpoints",
      "Advanced threat detection",
      "24/7 support",
      "Real-time alerts",
      "Custom policies",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Unlimited endpoints",
      "AI-powered detection",
      "Dedicated support",
      "Custom integrations",
      "Advanced analytics",
      "SLA guarantee",
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-white">
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Choose the plan that fits your security needs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative p-8 rounded-lg border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                plan.popular ? "border-primary -mt-9" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 text-sm font-medium bg-gradient-to-r from-purple-500 to-white rounded-full text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-8 text-center">
                <h3 className="mb-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-white">{plan.name}</h3>
                <div className="mb-2 text-4xl font-bold">{plan.price}</div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="flex-grow mb-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 items-center">
                    <Check className="w-5 h-5 text-purple-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-gradient-to-r from-purple-700 to-white hover:from-purple-900 hover:to-white"
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 