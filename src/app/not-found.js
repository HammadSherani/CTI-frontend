import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-xl mb-6">The page you are looking for doesn't exist.</p>
          <Link 
            href="/" 
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}