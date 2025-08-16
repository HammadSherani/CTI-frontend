'use client';

export default function PromoBanner() {
  return (
    <section className="py-3">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-xl bg-white shadow-sm border md:flex items-center gap-4 px-4 sm:px-6 py-3">
          <div className="font-semibold text-gray-900">
            Click to Integrade&apos;e Hoş Geldiniz
          </div>

          <div className="text-gray-700 md:flex-1">
            Hafta sonları her gün yeni teklif hediye paketi yeni kupon kodu:{' '}
            <strong className="text-gray-900">8326493284</strong>
          </div>

          <button
            type="button"
            className="promo-btn mt-2 md:mt-0 inline-flex items-center justify-center rounded-lg border border-transparent bg-[#FEA621] px-4 py-2 text-sm font-semibold text-black hover:brightness-95 active:brightness-90 focus:outline-none focus:ring-2 focus:ring-[#FEA621]/40"
          >
            Şimdi Keşfet
          </button>
        </div>
      </div>
    </section>
  );
}
