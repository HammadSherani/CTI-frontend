"use client";

import SideLinkPage from "@/components/website/SideLinkPage";
import React, { useState } from "react";

function ContactUs() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder for form submission logic (API call or email)
        alert("Mesajınız gönderildi!");
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <div className="min-h-screen bg-gray-50 grid grid-cols-3 px-12 py-8">
            <div className="col-span-2 sm:px-6 lg:px-8 py-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Bize Ulaşın
                    </h1>
                    <div className="w-24 h-1 bg-primary-600 mb-3"></div>
                    <p className="text-gray-600">
                        Her türlü soru, öneri veya iş birliği talepleriniz için aşağıdaki formu doldurabilir veya iletişim bilgilerimiz üzerinden bize ulaşabilirsiniz.
                    </p>
                </div>

                {/* İletişim Formu */}
                <section className="mb-12">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white shadow-md rounded-lg p-8 space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adınız
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    E-posta
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Konu
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mesaj
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                        >
                            Gönder
                        </button>
                    </form>
                </section>

                {/* Şirket İletişim Bilgileri */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Bizimle doğrudan iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-center">
                                    <span className="font-semibold text-gray-900 w-32">Şirket Adı:</span>
                                    <span>[Şirket Adı]</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="font-semibold text-gray-900 w-32">Adres:</span>
                                    <span>[Şirket Adresi]</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-center">
                                    <span className="font-semibold text-gray-900 w-32">E-posta:</span>
                                    <span>[Şirket E-posta Adresi]</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="font-semibold text-gray-900 w-32">Tel:</span>
                                    <span>[Şirket Telefon Numarası]</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="font-semibold text-gray-900 w-32">Faks:</span>
                                    <span>[Şirket Faks Numarası]</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Footer Notu */}
                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>Son güncelleme: 11 Kasım 2025</p>
                </div>
            </div>
            <SideLinkPage />
        </div>
    );
}

export default ContactUs;
