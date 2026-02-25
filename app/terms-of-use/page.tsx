import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function TermsOfUsePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F7FA] py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#003A70] mb-4">Terms of Use</h1>
            <p className="text-gray-600">
              Welcome to the Nagrik Infrastructure Monitoring System
            </p>
          </div>

          <Card className="border-t-4 border-t-[#003A70]">
            <CardContent className="p-8 prose prose-blue max-w-none text-gray-700 text-sm leading-relaxed space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#003A70] mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using this portal ("Nagrik"), operated in association with the Government of Uttarakhand, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this portal's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#003A70] mb-3">2. Description of Service</h2>
                <p>
                  Nagrik provides users with access to a rich collection of resources focused on civic engagement, infrastructure monitoring, and reporting to municipal authorities. You understand and agree that the service may include certain communications from the authorities such as service announcements and administrative messages.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#003A70] mb-3">3. User Conduct</h2>
                <p>
                  You agree to use the portal only for lawful purposes. You are strictly prohibited from:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Posting inaccurate, misleading, or abusive reports regarding infrastructure.</li>
                  <li>Impersonating any person or entity, including, but not limited to, a government official.</li>
                  <li>Interfering with or disrupting the service or servers or networks connected to the service.</li>
                  <li>Intentionally or unintentionally violating any applicable local, state, national, or international law.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#003A70] mb-3">4. Disclaimer of Warranties</h2>
                <p>
                  Your use of the service is at your sole risk. The service is provided on an "as is" and "as available" basis. The operators expressly disclaim all warranties of any kind, whether express or implied. No advice or information, whether oral or written, obtained by you from Nagrik shall create any warranty not expressly stated in the terms.
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
