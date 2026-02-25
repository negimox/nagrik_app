import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F7FA] py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">Contact Us</h1>
            <p className="text-gray-600">
              Uttarakhand Government Helpline Numbers & Support
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Emergency & Helpline Numbers
                </CardTitle>
                <CardDescription>Government of Uttarakhand 24/7 Helplines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-gray-700">CM Helpline</span>
                  <span className="font-bold text-primary bg-blue-50 px-3 py-1 rounded">1905</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-gray-700">Police Assistance</span>
                  <span className="font-bold text-primary bg-blue-50 px-3 py-1 rounded">112 / 100</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-gray-700">Fire & Ambulance</span>
                  <span className="font-bold text-primary bg-blue-50 px-3 py-1 rounded">108 / 112 / 101</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-gray-700">Women Helpline</span>
                  <span className="font-bold text-primary bg-blue-50 px-3 py-1 rounded">1090</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Disaster Management</span>
                  <span className="font-bold text-primary bg-blue-50 px-3 py-1 rounded">1070</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    Head Office
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600 text-sm leading-relaxed">
                  <strong>Nagar Nigam Dehradun</strong><br />
                  Patel Bhavan, 1, New Road,<br />
                  Near Doon Hospital, Dehradun<br />
                  Uttarakhand 248001, India
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600 text-sm">
                  <p className="mb-2">For portal issues or technical support:</p>
                  <a href="mailto:support@nagrik.uk.gov.in" className="text-blue-600 hover:underline font-medium">
                    e-helpdesk.uk.gov.in
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>

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
