import React from 'react'
import { useTranslations } from 'next-intl'

const Hero = ({locale}) => {
  const t = useTranslations('Hero');

  return (
    <section className="relative h-[500px] overflow-hidden">
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