"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with government emblem */}
      <Header showLogin={true} />

      {/* Secondary navigation */}
      <div className="bg-[#F0F0F0] border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex text-xs gap-4">
            <Link href="/" className="text-[#003A70] font-bold">
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-[#E6EEF4] py-8 border-b">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-block bg-[#003A70] text-white px-3 py-1 text-sm font-bold">
                Citizen Participation
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#003A70]">
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
                  <Button className="bg-[#003A70] hover:bg-[#004d94]">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white p-4 border rounded-md">
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
            <h2 className="text-xl font-bold text-[#003A70] mb-6 pb-2 border-b-2 border-[#003A70]">
              How the System Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border rounded-md bg-white p-4">
                <div className="bg-[#003A70] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h3 className="font-bold mb-2">Report Issues</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Report infrastructure problems you find in the city, such as
                  road damage, broken streetlights, or sanitation issues, with
                  photos and location data.
                </p>
              </div>
              <div className="border rounded-md bg-white p-4">
                <div className="bg-[#003A70] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h3 className="font-bold mb-2">Track Progress</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Monitor the status of your reports in real-time. Track the
                  entire process transparently from assignment to resolution.
                </p>
              </div>
              <div className="border rounded-md bg-white p-4">
                <div className="bg-[#003A70] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h3 className="font-bold mb-2">See Results</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
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
      <footer className="bg-[#003A70] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                  <div className="h-6 w-6 bg-[#003A70] rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                    NAGRIK
                  </div>
                </div>
                <div className="text-sm font-bold">City Government</div>
              </div>
              <p className="text-xs">
                Dehradun
                <br />
                Uttarakhand, India
                <br />
                TEL: 123-456-7890
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-3">Related Links</h3>
              <ul className="text-xs space-y-2">
                <li>
                  <Link href="#" className="hover:underline">
                    City Website
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Emergency Information
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Waste Collection Calendar
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Public Facility Reservations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-3">User Guide</h3>
              <ul className="text-xs space-y-2">
                <li>
                  <Link href="#" className="hover:underline">
                    How to Use
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-3">Legal Information</h3>
              <ul className="text-xs space-y-2">
                <li>
                  <Link href="#" className="hover:underline">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Copyright
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-white/20 text-xs text-center">
            © {new Date().getFullYear()} City Government - Infrastructure
            Monitoring System. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
