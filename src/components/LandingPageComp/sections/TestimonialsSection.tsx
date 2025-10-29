import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "NexusSentinel has transformed our security posture. The AI-powered detection is incredibly accurate.",
    author: "Sarah Chen",
    role: "CISO, TechCorp",
    rating: 4,
  },
  {
    quote: "The automated response capabilities have reduced our incident response time by 90%.",
    author: "Michael Rodriguez",
    role: "Security Director, GlobalBank",
    rating: 5,
  },
  {
    quote: "Finally, an EDR solution that doesn't require a dedicated security team to manage.",
    author: "Emily Thompson",
    role: "IT Manager, StartupX",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="overflow-hidden relative py-24 bg-background">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b via-transparent to-transparent from-purple-950/20" />
      
      <div className="container relative px-4 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-white">
              Trusted by Security Leaders
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            See what our customers have to say about NexusSentinel
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="p-8 rounded-xl border backdrop-blur-sm transition-all duration-300 group bg-card/50 hover:shadow-lg hover:-translate-y-1 hover:border-purple-500/50"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-purple-500 fill-purple-500" />
                ))}
              </div>
              <div className="relative mb-6 text-lg">
                {/* <span className="absolute -top-2 -left-2 text-4xl text-purple-500/20">"</span> */}
                {testimonial.quote}
                {/* <span className="absolute -right-2 -bottom-2 text-4xl text-purple-500/20">"</span> */}
              </div>
              <div className="pt-4 border-t border-purple-500/10">
                <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-white">
                  {testimonial.author}
                </p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 