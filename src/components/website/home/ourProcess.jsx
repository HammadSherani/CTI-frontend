import Image from 'next/image';
import { Icon } from '@iconify/react';

const OurProcess = () => {
  return (
    <section className="bg-[#F8F8F8] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-16 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-6 text-center lg:text-left">
            <div className="mb-4">
              <p className="font-semibold text-amber-500 mb-2">Our Process</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Who We Are &<br />How We Work
              </h2>
            </div>
            
            <div className="pt-4">
              <p className="font-bold text-gray-700 mb-1">STEP 01</p>
              <h3 className="text-xl font-bold text-gray-900">Tell us your Issue</h3>
              <p className="text-gray-500 mt-3 leading-relaxed max-w-md mx-auto lg:mx-0">
                Share the problem you are facing with your mobile, laptop, or tablet.
                Our expert team will diagnose it and suggest the best repair solution.
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-5 pt-4">
              <button className="bg-gray-100 border border-gray-200/80 text-gray-800 font-semibold px-6 py-3 rounded-md hover:bg-gray-200 transition-colors">
                TALK WITH US
              </button>
              <button className="flex items-center gap-2 font-semibold text-gray-800 border-b border-gray-800 pb-1 hover:text-black transition-colors">
                GET LOCATION
                <Icon icon="mdi:map-marker" className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Middle Column - Image */}
          <div className="lg:col-span-4 flex justify-center order-first lg:order-none">
            <Image 
              src="/assets/logo/hand-phone.png"
              alt="A hand holding a smartphone displaying an expense tracking app"
              width={380}
              height={760}
              className="max-w-[280px] md:max-w-xs lg:max-w-none h-auto"
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-12 text-center lg:text-left">
            <div>
              <p className="font-bold text-gray-700 mb-1">STEP 02.</p>
              <h3 className="text-xl font-bold text-gray-900">Bring or Send Your Device</h3>
              <p className="text-gray-500 mt-3 leading-relaxed max-w-md mx-auto lg:mx-0">
                We handle every device with care and ensure a smooth repair process.
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-700 mb-1">STEP 03.</p>
              <h3 className="text-xl font-bold text-gray-900">Get Your Device Back</h3>
              <p className="text-gray-500 mt-3 leading-relaxed max-w-md mx-auto lg:mx-0">
                Once repaired, your device will be ready for pickup or delivery.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default OurProcess;