import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  // Get locale from request context
  const locale = await (async () => {
    try {
      // Try to detect locale from request headers or default to 'en'
      return "en";
    } catch {
      return "en";
    }
  })();

  const messages = {
    en: {
      title: "404 - Page Not Found",
      message: "Sorry, the page you are looking for does not exist.",
      backHome: "Back to Home",
    },
    tr: {
      title: "404 - Sayfa Bulunamadı",
      message: "Üzgünüz, aradığınız sayfa mevcut değil.",
      backHome: "Ana Sayfaya Dön",
    },
  };

  const t = messages[locale] || messages.en;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-2xl font-semibold text-gray-700 mb-4">{t.title}</p>
        <p className="text-gray-500 mb-8">{t.message}</p>
        <Link
          href="/"
          className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          {t.backHome}
        </Link>
      </div>
    </div>
  );
}