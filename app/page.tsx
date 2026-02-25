"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/header";
import { ModeToggle } from "@/components/mode-toggle";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with government emblem */}
      <Header showLogin={true} />

      {/* Secondary navigation */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex text-xs gap-4">
            <Link href="/" className="text-primary font-bold">
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-muted py-8 border-b">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-block bg-primary text-white px-3 py-1 text-sm font-bold">
                Citizen Participation
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                Legislative & Policy Insight Platform
                <span className="block text-lg font-normal mt-2">
                  Gain valuable insights of infrastructural issues
                </span>
              </h1>
              <p className="text-sm leading-relaxed">
                Easily report and gain insights of infrastructure issues in your
                city, such as road damage, broken streetlights, and sanitation
                problems. Together, citizens and authorities can build a better
                community.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-card text-card-foreground p-4 border rounded-md">
              <Image
                src="/test.jpg?height=300&width=500"
                alt="Infrastructure monitoring system diagram"
                width={500}
                height={300}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* Information blocks */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-primary mb-6 pb-2 border-b-2 border-primary">
              How the System Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border rounded-md bg-card text-card-foreground p-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h3 className="font-bold mb-2">Report Issues</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  Report infrastructure problems you find in the city, such as
                  road damage, broken streetlights, or sanitation issues, with
                  photos and location data.
                </p>
              </div>
              <div className="border rounded-md bg-card text-card-foreground p-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h3 className="font-bold mb-2">Track Progress</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  Monitor the status of your reports in real-time. Track the
                  entire process transparently from assignment to resolution.
                </p>
              </div>
              <div className="border rounded-md bg-card text-card-foreground p-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h3 className="font-bold mb-2">See Results</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  Receive notifications when issues are resolved, with photos of
                  the repairs. Citizen cooperation enables more efficient city
                  management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* News and updates */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
