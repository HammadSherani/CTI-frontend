import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</p>
        <p className="text-gray-500 mb-8">Sorry, the page you are looking for does not exist.</p>
        <Link href="/en" className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}