'use client';

import { Icon } from '@iconify/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const REVIEWS = [
    {
        name: 'Mobile Care Hub',
        title: 'We are very happy with our partnership with CTI.',
        text: 'The training is excellent and the trainers are always available and quick to help. The hands-on practice improved our repair quality and the confidence of our whole team.',
    },
    {
        name: 'Tech Fix Point',
        title: 'Our experience with the program has been excellent.',
        text: 'The certification brought us more customers and trust in the market. Most importantly, the CTI team has always been there to guide us whenever we needed support.',
    },
    {
        name: 'Smart Repair Zone',
        title: 'We are grateful for the excellent support.',
        text: 'It quickly became one of the most important parts of our business. The latest course content, practical sessions and community support make it a great place to grow.',
    },
    {
        name: 'Phone Doctor',
        title: 'A real difference for our repair shop.',
        text: 'Our technicians now handle advanced laptop and tablet repairs that we used to turn away. The skills we gained paid for themselves within months.',
    },
    {
        name: 'Gadget Clinic',
        title: 'Professional, practical and friendly.',
        text: 'Weekly sessions in our own language made everything easy to follow. Questions were answered clearly and the follow-up support was great.',
    },
];

export default function SellerReviews() {
    return (
        <section className="bg-primary-50 px-4 py-12 sm:px-6 md:py-16 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                    Seller reviews
                </h2>

                <div className="relative mt-8">
                    <Icon
                        icon="ri:double-quotes-l"
                        className="absolute -left-1 -top-4 hidden h-8 w-8 text-primary-300 lg:block"
                    />
                    <Icon
                        icon="ri:double-quotes-r"
                        className="absolute -bottom-2 -right-1 hidden h-8 w-8 text-primary-300 lg:block"
                    />

                    <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={20}
                        slidesPerView={1}
                        loop
                        grabCursor
                        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                        pagination={{ clickable: true }}
                        navigation
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="!px-1 !pb-12 [--swiper-navigation-color:theme(colors.primary.500)] [--swiper-navigation-size:22px] [--swiper-pagination-color:theme(colors.primary.500)] [&_.swiper-button-next]:hidden [&_.swiper-button-prev]:hidden md:[&_.swiper-button-next]:flex md:[&_.swiper-button-prev]:flex"
                    >
                        {REVIEWS.map((r) => (
                            <SwiperSlide key={r.name} className="!h-auto">
                                <article className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                                            {r.name.charAt(0)}
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                                    </div>

                                    <h3 className="mt-4 text-sm font-bold text-gray-900">{r.title}</h3>
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                                        {r.text}
                                    </p>

                                    <div className="mt-4 flex gap-0.5 text-amber-400">
                                        {[...Array(5)].map((_, n) => (
                                            <Icon key={n} icon="heroicons:star-solid" className="h-4 w-4" />
                                        ))}
                                    </div>
                                </article>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
