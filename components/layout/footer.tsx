import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/mode-toggle";

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/">
              <div className="flex flex-wrap items-center gap-3">
                <Image src="/logo.png" alt="Logo" width={50} height={50} />
                <h2 className="text-2xl font-bold font-serif">Nagrik</h2>
              </div>
            </Link>
            <p className="text-xs mt-4">
              Dehradun
              <br />
              Uttarakhand, India
              <br />
              CM Helpline: 1905
            </p>
          </div>

          <div className="md:col-span-2"></div>

          <div>
            <h3 className="text-sm font-bold mb-3">Legal Information</h3>
            <ul className="text-xs space-y-2">
              <li>
                <Link href="/terms-of-use" className="hover:underline">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:underline">
                  Help
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="text-center md:text-left">
            © {new Date().getFullYear()} City Government - Infrastructure
            Monitoring System. All Rights Reserved.
          </div>
          <div>
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
