import React from 'react'

const hero = () => {
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
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center text-white text-center">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold">Welcome to Our Store</h3>
          <h1 className="text-4xl md:text-5xl font-bold my-4">
            Explore our latest devices <br /> and offers
          </h1>
          <p className="text-base md:text-lg">
            We provide fast, reliable repairs for computers and mobile. Our expert
            technicians use high-quality parts to ensure your devices function like new.
          </p>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium shadow-md">
              Create a Quick Repair Request
            </button>
            <button className="bg-white text-black px-6 py-2 rounded-lg font-medium shadow-md">
              Find the Nearest Technician
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default hero