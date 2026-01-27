import Image from 'next/image';
import React from 'react';

function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      {/* <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg md:text-xl opacity-90">Discover the story behind our passion for innovation, excellence, and making a difference in the world.</p>
        </div>
      </header> */}


<section className="relative  overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 text-white">
  <div className="container mx-auto px-6 pt-10 ">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      {/* Left Content */}
      <div className="max-w-xl">
        <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-widest text-white/80">
          Sustainability & Innovation
        </span>

        <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-tight mb-6">
          Reuse & Reduce
        </h1>

        <h2 className="text-2xl font-semibold mb-6 text-white/95">
          Our grandparents lived a sustainable life — long before sustainability was even a concept.
        </h2>

        <p className="text-base md:text-lg leading-relaxed text-white/90">
          Let’s mindfully bring sustainable choices back into our modern lifestyle, 
          starting  future.
        </p>

      </div>

      {/* Right Image */}
      <div className="relative flex justify-center lg:justify-end">
        <Image
          src="/assets/about/1.avif"
          width={700}
          height={500}
          alt="Sustainable living"
          className="w-full max-w-lg rounded-xl object-cover"
          priority
        />
      </div>

    </div>
  </div>
</section>


      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Story</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">
              Founded in 2015 in the heart of Silicon Valley, we began as a small team of visionary engineers and designers with a simple yet ambitious goal: to bridge the gap between cutting-edge technology and everyday human needs. What started in a modest garage—much like the tales of legendary startups—has grown into a global powerhouse employing over 500 talented individuals across three continents.
            </p>
            <p className="text-lg">
              Our journey hasn't been without challenges. From navigating the volatile tech markets of the early 2020s to pivoting during the global pandemic, we've learned that true innovation thrives in adversity. Today, TechNova stands as a testament to resilience, creativity, and an unwavering commitment to our core principle: technology should empower, not complicate.
            </p>
          </div>

          {/* Timeline */}
          <div className="mt-12 space-y-6">
            <div className="flex gap-4 bg-gray-50 p-6 rounded-lg border-l-4 border-primary-600">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold">
                  2015
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">The Spark</h3>
                <p className="text-gray-600">A group of five friends launches TechNova with their first product, a smart home automation app that revolutionized energy efficiency for urban dwellers.</p>
              </div>
            </div>

            <div className="flex gap-4 bg-gray-50 p-6 rounded-lg border-l-4 border-primary-600">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold">
                  2018
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Scaling Horizons</h3>
                <p className="text-gray-600">Securing Series A funding, we expand to Europe and Asia, launching our flagship AI-driven analytics platform used by Fortune 500 companies.</p>
              </div>
            </div>

            <div className="flex gap-4 bg-gray-50 p-6 rounded-lg border-l-4 border-primary-600">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold">
                  2020
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Resilience Redefined</h3>
                <p className="text-gray-600">In response to global disruptions, we develop contactless health monitoring tools, supporting millions in remote healthcare access.</p>
              </div>
            </div>

            <div className="flex gap-4 bg-gray-50 p-6 rounded-lg border-l-4 border-primary-600">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold">
                  2023
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Impact</h3>
                <p className="text-gray-600">Achieving unicorn status, we partner with NGOs to deploy sustainable tech solutions in underserved communities worldwide.</p>
              </div>
            </div>

            <div className="flex gap-4 bg-gray-50 p-6 rounded-lg border-l-4 border-primary-600">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold">
                  2025
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">The Future Awaits</h3>
                <p className="text-gray-600">With our eyes on quantum computing and ethical AI, we're poised to lead the next wave of technological evolution.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                M
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                At TechNova, our mission is to harness the power of technology to create inclusive, sustainable solutions that enhance quality of life for individuals, businesses, and communities. We believe in democratizing access to advanced tools, ensuring that innovation isn't confined to the elite but reaches every corner of the globe.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-2xl font-bold mb-4">
                V
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                We envision a world where technology acts as a force for good, fostering a harmonious blend of human potential and machine intelligence. By 2030, TechNova aims to be the go-to partner for ethical tech adoption, with our solutions integrated into 1 billion devices and contributing to the UN's Sustainable Development Goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These principles guide every decision we make, from product development to team collaborations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border-t-4 border-primary-600">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">We encourage bold ideas and iterative experimentation, knowing that failure is just a stepping stone to breakthrough success.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-t-4 border-primary-600">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Integrity</h3>
              <p className="text-gray-600">Transparency and ethical practices are non-negotiable. We build trust through honest communication and accountable actions.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-t-4 border-primary-600">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Inclusivity</h3>
              <p className="text-gray-600">Diversity fuels our creativity. We champion diverse voices, ensuring our team and products reflect the world's beautiful mosaic.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-t-4 border-primary-600">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600">Our innovations prioritize the planet. From primary data centers to circular economy models, we're committed to a regenerative future.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-t-4 border-primary-600">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">We strive for nothing less than world-class quality, blending rigorous standards with a passion for delighting our users.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border-t-4 border-primary-600">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">We're more than a company; we're a community. Giving back through mentorship, open-source contributions, and philanthropy is in our DNA.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Behind every great product is an extraordinary team. Our diverse collective of experts brings unique perspectives that drive our success.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                AJ
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Alex Johnson</h3>
              <p className="text-primary-600 font-medium mb-3 text-sm">CEO & Founder</p>
              <p className="text-gray-600 text-sm">Alex's 20+ years in tech entrepreneurship have shaped TechNova's agile culture. When not strategizing, you'll find Alex hiking the Pacific trails.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                SL
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Sara Lee</h3>
              <p className="text-primary-600 font-medium mb-3 text-sm">CTO</p>
              <p className="text-gray-600 text-sm">Sara leads our tech vision with a PhD in Machine Learning. A mentor at heart, she hosts coding bootcamps for underrepresented youth.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                MC
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Mike Chen</h3>
              <p className="text-primary-600 font-medium mb-3 text-sm">Head of Design</p>
              <p className="text-gray-600 text-sm">Mike's award-winning designs have graced TED stages. He's passionate about user-centric innovation and sustainable materials in product prototyping.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                PS
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Priya Singh</h3>
              <p className="text-primary-600 font-medium mb-3 text-sm">VP of Operations</p>
              <p className="text-gray-600 text-sm">Priya streamlines our global ops with MBA smarts. An advocate for work-life balance, she champions flexible policies that keep our team thriving.</p>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8">
            This is just a glimpse—our full team of 500+ includes brilliant minds from 25+ countries. <a href="/careers" className="text-primary-600 hover:underline font-medium">Join us?</a>
          </p>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Achievements</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're proud of the milestones we've hit, but even prouder of the impact we've made.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">1M+</div>
              <p className="text-gray-600">Users empowered by our AI tools worldwide</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <p className="text-gray-600">Patents filed in sustainable tech and machine learning</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">$100M+</div>
              <p className="text-gray-600">In venture funding raised to fuel our growth</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">95%</div>
              <p className="text-gray-600">Customer satisfaction rate, backed by independent audits</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">10x</div>
              <p className="text-gray-600">Reduction in client energy costs through our platforms</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">Awards</div>
              <p className="text-gray-600">TechCrunch Disrupt, Forbes 30 Under 30, UN Innovation Award</p>
            </div>
          </div>
          <blockquote className="bg-primary-50 border-l-4 border-primary-600 p-6 rounded-r-lg">
            <p className="text-gray-700 italic text-lg mb-2">
              "TechNova isn't just building products; they're building a better tomorrow."
            </p>
            <cite className="text-gray-600 font-semibold not-italic">— Forbes Magazine</cite>
          </blockquote>
        </div>
      </section>

      {/* Looking Ahead Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">Looking Ahead</h2>
          <div className="space-y-6 text-lg opacity-90 mb-8">
            <p>
              As we stand on the cusp of the next tech revolution, TechNova is more excited than ever. Our roadmap includes breakthroughs in quantum-secure encryption, AI for climate modeling, and immersive VR training for global workforces.
            </p>
            <p>
              Join us on this journey. Whether as a customer, partner, or team member, your story is part of ours. Let's innovate, collaborate, and elevate—together.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/careers" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Careers at TechNova
            </a>
            <a href="/contact" className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition">
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;