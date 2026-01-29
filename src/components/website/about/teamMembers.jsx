"use client";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// Publicly usable placeholder-style content (inspired by real-world roles)
const team = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Frontend Engineer",
    image: "/assets/about/10.avif",
  },
  {
    id: 2,
    name: "Sophia Lee",
    role: "UI/UX Designer",
    image: "/assets/about/11.avif",
  },
  {
    id: 3,
    name: "Daniel Smith",
    role: "Backend Developer",
    image: "/assets/about/12.avif",
  },
  {
    id: 4,
    name: "Emily Carter",
    role: "Product Manager",
    image: "/assets/about/13.avif",
  },
  {
    id: 5,
    name: "Michael Brown",
    role: "DevOps Engineer",
    image: "/assets/about/11.avif",
  },
  {
    id: 6,
    name: "Olivia Wilson",
    role: "QA Engineer",
    image: "/assets/about/12.avif",
  },
  {
    id: 7,
    name: "James Anderson",
    role: "Mobile App Developer",
    image: "/assets/about/10.avif",
  },
  {
    id: 8,
    name: "Isabella Martinez",
    role: "Marketing Strategist",
    image: "/assets/about/13.avif",
  },
];

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function TeamSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-4"
        >
          Meet Our Team
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-gray-600 max-w-2xl mx-auto mb-12"
        >
          A diverse group of professionals inspired by real-world product and
          engineering teams.
        </motion.p>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="!py-3"
        >
          {team.map((member) => (
            <SwiperSlide key={member.id}>
              <motion.div
                variants={item}
                // initial="hidden"
                // whileInView="show"
                // viewport={{ once: true }}
                // whileHover={{ y: -8 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-5 text-center">
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{member.role}</p>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
