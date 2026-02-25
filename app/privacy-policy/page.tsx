import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F7FA] py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#003A70] mb-4">Privacy Policy</h1>
            <p className="text-gray-600">
              Information on how we handle and protect your data
            </p>
          </div>

          <Card className="border-t-4 border-t-[#003A70]">
            <CardContent className="p-8 prose prose-blue max-w-none text-gray-700 text-sm leading-relaxed space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#003A70] mb-3">1. Information We Collect</h2>
                <p>
                  As an infrastructure reporting platform, Nagrik collects information necessary to process your reports and communicate with you effectively.
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li><strong>Personal Information:</strong> Name, phone number, and email address when you register.</li>
                  <li><strong>Report Data:</strong> Location data (GPS coordinates), image uploads, and descriptive text when you submit a civic issue.</li>
                  <li><strong>Usage Data:</strong> Information on how the service is accessed and used, including IP addresses, browser types, and usage patterns.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#003A70] mb-3">2. How We Use Your Information</h2>
                <p>
                  Your information is utilized solely to facilitate the resolution of civic issues and to improve the portal:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>To provide and maintain the service to citizens and authorities.</li>
                  <li>To notify you about changes or progress on your reported issues.</li>
                  <li>To provide resident support and investigate reports via the relevant municipal corporation.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#003A70] mb-3">3. Disclosure of Data</h2>
                <p>
                  Nagrik may disclose your Personal Data in the good faith belief that such action is necessary to:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Comply with a legal obligation from the Government of Uttarakhand or India.</li>
                  <li>Protect and defend the rights or property of the municipal corporations.</li>
                  <li>Prevent or investigate possible wrongdoing in connection with the reporting service.</li>
                  <li>Protect the personal safety of users of the Service or the public.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#003A70] mb-3">4. Security of Data</h2>
                <p>
                  The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, including encryption at rest and in transit, we cannot guarantee its absolute security.
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
