"use client"
import { Button } from "../../../components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, StarStyle, generateStars, getTwinkleCSS } from "../../../utils/StarGenerator";

export default function HeroSection() {
  const [stars, setStars] = useState<StarStyle[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    // Generate stars with custom configuration
    const newStars = generateStars({
      count: 70,
      minSize: 1.5,
      maxSize: 3,
      minDuration: 3,
      maxDuration: 7,
      maxDelay: 3,
      edgeMargin: 2.5
    });
    setStars(newStars);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: getTwinkleCSS()
      }} />
      <section className="relative flex items-center justify-center min-h-screen overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b to-transparent via-purple-500/15" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-700/20 via-transparent to-transparent" />
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
        </div>
        
        {/* Stars */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {stars.map((style, index) => (
            <Star key={index} style={style} />
          ))}
        </div>

        <div className="container relative z-10 px-4 py-32 mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-r to-white from-purple-950">
                  NexusSentinel
                </span>
              </h1>
              <p className="mt-4 text-xl text-muted-foreground sm:text-2xl">
                AI-Powered Endpoint Detection & Response
              </p>
            </div>

            <div className="mt-8 animate-fade-in-up animation-delay-200">
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                Protect your endpoints with advanced AI-driven security. Detect, respond, and prevent threats in real-time.
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-8 animate-fade-in-up animation-delay-400 sm:flex-row">
              <Button
                size="lg"
                onClick={() => router.push('/signup')}
                className="bg-gradient-to-r from-purple-500 to-white hover:from-purple-600 hover:to-white"
              >
                Get Started as Admin
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/endpoint/signup')}
                className="text-white border-white/20 hover:bg-white/10 hover:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Request Access
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}