import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Report Dashboard",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600">Page Not Found</h2>
        <p className="text-gray-500">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
}
