"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { subtitles } from '@cloudinary/url-gen/qualifiers/source';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setFormStatus(''), 3000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: "mdi:map-marker",
      title: "Visit Us",
      subtitles: "Our Office Location",
      details: ["123 Business Street", "Suite 100, New York, NY 10001"],
    },
    {
      icon: "mdi:phone",
      title: "Call Us",
      subtitles: "Customer Support",
      details: ["+1 (555) 123-4567", "+1 (555) 987-6543"],
    },
    {
      icon: "mdi:email",
      title: "Email Us",
      subtitles: "General Inquiries",
      details: ["info@company.com", "support@company.com"],
    },
    {
      icon: "mdi:clock-outline",
      title: "Working Hours",
      subtitles: "Business Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat - Sun: Closed"],
    }
  ];

  const reachesUs = [
    {
      title: "Live Chat Support",
      description: "Connect with our support team instantly. Get real-time answers to your questions 24/7.",
      icon: "mdi:chat-processing",
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Knowledge Base",
      description: "Explore our comprehensive library of guides, tutorials, and FAQs for quick solutions.",
      icon: "mdi:book-open-variant",
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Community Forum",
      description: "Join thousands of users sharing experiences and helping each other succeed.",
      icon: "mdi:account-group",
      color: "bg-purple-50 border-purple-200"
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step video guides to master our platform and features.",
      icon: "mdi:video-box",
      color: "bg-pink-50 border-pink-200"
    },
    {
      title: "Schedule a Call",
      description: "Book a personalized consultation with our experts at your convenience.",
      icon: "mdi:calendar-clock",
      color: "bg-orange-50 border-orange-200"
    },
    {
      title: "Social Media",
      description: "Follow us on social platforms for updates, tips, and community engagement.",
      icon: "mdi:share-variant",
      color: "bg-indigo-50 border-indigo-200"
    }
  ];

 

  const socialLinks = [
    { icon: "mdi:facebook", url: "#", color: "hover:text-blue-600" },
    { icon: "mdi:twitter", url: "#", color: "hover:text-sky-500" },
    { icon: "mdi:linkedin", url: "#", color: "hover:text-blue-700" },
    { icon: "mdi:instagram", url: "#", color: "hover:text-pink-600" },
    { icon: "mdi:youtube", url: "#", color: "hover:text-red-600" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative   px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto relative z-10 p-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <motion.h1 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
              >
                Let's <span className="text-yellow-300">Connect</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl sm:text-2xl mb-8 text-gray-100"
              >
                We're here to help you succeed
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-lg mb-8 text-gray-200 leading-relaxed"
              >
                Whether you have a question, need support, or want to explore our services, 
                our dedicated team is ready to assist you every step of the way.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 group"
                  >
                    <Icon icon={social.icon} className="text-2xl text-white group-hover:text-primary-600 transition-colors" />
                  </a>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-pink-300 rounded-3xl transform rotate-6 opacity-20"></div>
                <Image 
                  src="/assets/contact/1.avif" 
                  alt="Contact Us" 
                  width={600} 
                  height={400} 
                  className="rounded-3xl shadow-2xl relative z-10"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>


{/* Section2 */}
<section className="bg-gray-100 py-20 min-h-[80vh]">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex flex-col items-center">

      {/* Header Badge */}
      <div className="p-1 flex items-center justify-center gap-2 shadow-lg rounded-full bg-white text-gray-600 font-semibold w-[180px]">
        <span className="w-2 h-2 rounded-full bg-primary-700 block"></span>
        Contact Info
        <span className="w-2 h-2 rounded-full bg-primary-700 block"></span>
      </div>

      {/* Title and Description */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 mt-6"
      >
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          <span className="text-primary-600">Connect</span> and join together
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, our team is here to assist you.
        </p>
      </motion.div>

      {/* Contact Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {contactInfo.map((info, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start gap-4">
              <Icon icon={info.icon} className="text-4xl text-primary-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">{info.title}</h3>
                <p className="text-sm text-primary-500">{info.subtitles}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              {info.details.map((detail, idx) => (
                <p key={idx} className="text-gray-600 bg-gray-100 rounded-lg p-2 text-sm">
                  {detail}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
</section>



      {/* Alternative Contact Methods */}
      <section className="py-20 px-4 sm:px-8 lg:px-20 mt-4 mb-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              More Ways to <span className="text-primary-600">Connect</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the communication channel that works best for you
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8"
          >
            {reachesUs.map((method, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`${method.color} border-2 flex gap-6  rounded-2xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer group`}
              >
                <div className="w-16 h-16 p-4 bg-white rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                  <Icon icon={method.icon} className="text-4xl text-primary-600" />
                </div>
                <div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{method.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{method.description}</p>
                <button className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                  Learn More
                  <Icon icon="mdi:arrow-right" className="text-xl" />
                </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      
     

      {/* Call to Action */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-400 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <Icon icon="mdi:heart-circle" className="text-6xl mx-auto mb-6 text-yellow-300" />
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-xl mb-10 opacity-90 leading-relaxed">
            Our friendly team is always here to help. Don't hesitate to reach out through 
            any of our contact channels. We're committed to providing you with the best support experience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="tel:+1234567890"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              <Icon icon="mdi:phone" className="text-2xl" />
              Call Us Now
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="mailto:info@company.com"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-primary-600 transition-all"
            >
              <Icon icon="mdi:email" className="text-2xl" />
              Send an Email
            </motion.a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default ContactUs;