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
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
  },
  {
    id: 2,
    name: "Sophia Lee",
    role: "UI/UX Designer",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  },
  {
    id: 3,
    name: "Daniel Smith",
    role: "Backend Developer",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
  },
  {
    id: 4,
    name: "Emily Carter",
    role: "Product Manager",
    image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
  },
  {
    id: 5,
    name: "Michael Brown",
    role: "DevOps Engineer",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61",
  },
  {
    id: 6,
    name: "Olivia Wilson",
    role: "QA Engineer",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91",
  },
  {
    id: 7,
    name: "James Anderson",
    role: "Mobile App Developer",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef",
  },
  {
    id: 8,
    name: "Isabella Martinez",
    role: "Marketing Strategist",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
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
        >
          {team.map((member) => (
            <SwiperSlide key={member.id}>
              <motion.div
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
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
