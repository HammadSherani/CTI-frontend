import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const locale = useLocale();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-6">The page you are looking for doesn&apos;t exist.</p>
      <Link
        href='/'
        className="bg-primary-500 text-white px-6 py-2 rounded hover:bg-primary-600"
      >
        Back to Home
      </Link>
    </div>
  );
}