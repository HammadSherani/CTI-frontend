'use client';
import React from 'react'
import { useTranslations, useLocale } from 'next-intl'

const Hero = () => {
  const t = useTranslations('Hero');
  const locale = useLocale();

  // Debug logs
  console.log('Hero Component Debug:');
  console.log('- Current locale:', locale);
  console.log('- Welcome text:', t('welcomeText'));

  return (
    <section className="relative h-[500px] overflow-hidden">
      {/* Debug Panel */}
      <div className="absolute top-4 left-4 z-10 bg-red-500 text-white p-2 text-xs rounded">
        <div>Locale: {locale}</div>
        <div>Welcome: {t('welcomeText')}</div>
      </div>

      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/assets/home/ban-video.mp4" type="video/mp4" />
        {t('videoNotSupported')}
      </video>

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center text-white text-center">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold">{t('welcomeText')}</h3>
          <h1 className="text-4xl md:text-5xl font-bold my-4">
            {t('mainHeading')}
          </h1>
          <p className="text-base md:text-lg">
            {t('description')}
          </p>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium shadow-md">
              {t('repairButton')}
            </button>
            <button className="bg-white text-black px-6 py-2 rounded-lg font-medium shadow-md">
              {t('technicianButton')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero