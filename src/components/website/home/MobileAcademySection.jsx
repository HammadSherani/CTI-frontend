import Link from "next/link";

function FreelancerSupportAcademySection() {
    return (
        <section className="relative bg-primary-50/70 py-24 px-6 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Badge */}
                <div className="flex justify-center mb-6">
                    <span className="inline-flex items-center gap-2 bg-primary-100 border border-primary-300/50 text-primary-800 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                        <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                        Trusted by 10,000+ Freelancers
                    </span>
                </div>

                {/* Heading */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent leading-tight">
                    Click to Integrate Support Academy<br />Premium Training & Guidance
                </h2>

                {/* Description */}
                <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto text-center leading-relaxed">
                    Empower your  journey with expert  support. Our certified mentors guide you fast—results in days guaranteed.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <button className="group cursor-pointer relative bg-primary-500 text-white font-semibold px-8 py-4 rounded-md  hover:shadow-primary-600/50 transition-all duration-300 hover:scale-105">
                        <Link href={'/academy'} className="relative z-10">Try CTI Academy</Link>
                        {/* <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div> */}
                    </button>

                  
                </div>

                <div className="grid sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
                    {/* Card 1 */}
                    <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-7 border border-gray-200/50 hover:border-primary-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary-500/20 ">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 6m0 0l-8-6m8 6V7m-4 7h-2V9h-2v5H9" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">Diverse Freelance Skills</h3>
                        <p className="text-gray-600 leading-relaxed">Comprehensive courses in top niches like web dev, design, and marketing with flexible pricing and payment plans</p>
                    </div>

                    {/* Card 2 */}
                    <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-7 border border-gray-200/50 hover:border-primary-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary-500/20 ">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">Expert Mentorship</h3>
                        <p className="text-gray-600 leading-relaxed">One-on-one guidance for proposals, client management, and growth—tailored to your freelance needs</p>
                    </div>

                    {/* Card 3 */}
                    <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-7 border border-gray-200/50 hover:border-primary-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary-500/20 ">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">Community & Certification</h3>
                        <p className="text-gray-600 leading-relaxed">Lifetime access to freelancer network, certifications, and 24/7 support for your success</p>
                    </div>
                </div>

               
            </div>
        </section>
    );
}

export default FreelancerSupportAcademySection;