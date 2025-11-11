"use client";

import SideLinkPage from "@/components/website/SideLinkPage";
import React from "react";

function RefundPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 grid grid-cols-3 px-12 py-8">
            <div className="col-span-2 sm:px-6 lg:px-8 py-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        İade ve Geri Ödeme Politikası
                    </h1>
                    <div className="w-24 h-1 bg-primary-600 mb-3"></div>
                    <p className="text-gray-600">
                        Bu sayfa, ürünlerinizin iadesi ve geri ödemeler ile ilgili kuralları, koşulları ve süreci açıklamaktadır.
                    </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
                    <h2 className="text-lg font-semibold text-yellow-800 mb-2">Önemli Uyarı</h2>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                        Bu politika örnek amaçlıdır. İade ve geri ödeme koşulları şirketinize ve sektöre göre değişiklik gösterebilir. İçeriği kendi şartlarınıza uyarlayınız.
                    </p>
                </div>

                {/* Genel Koşullar */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Genel Koşullar
                    </h2>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        Ürün iadesi ve geri ödemeler, yalnızca belirlenen şartlar altında kabul edilir. Lütfen siparişiniz öncesinde bu koşulları okuyunuz.
                    </p>
                    <div className="bg-primary-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium text-primary-800 mb-2">İpucu:</p>
                        <p className="text-sm text-primary-700">
                            İade ve geri ödeme politikasını hazırlarken, tüketici hakları ve yerel yasal düzenlemelere uyduğunuzdan emin olun.
                        </p>
                    </div>
                </section>

                {/* İade ve Geri Ödeme Bölümleri */}
                <section className="mb-12 space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            İade Koşulları
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Ürünler, teslimat tarihinden itibaren 14 gün içinde iade edilebilir. Ürünler kullanılmamış ve orijinal ambalajında olmalıdır. Aksi durumlarda iade kabul edilmez.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            Geri Ödeme Süreci
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            İade edilen ürünler onaylandıktan sonra geri ödeme işlemi başlatılır. Geri ödeme, ödemenin yapıldığı yöntemle gerçekleştirilir ve genellikle 5–10 iş günü sürer.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            İstisnai Durumlar
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Aşağıdaki durumlarda iade ve geri ödeme yapılamaz:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Kullanılmış veya hasarlı ürünler</li>
                            <li>İade süresi geçmiş ürünler</li>
                            <li>Özel sipariş veya kişiselleştirilmiş ürünler</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            İade İletişim
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            İade veya geri ödeme talebinizi <strong>[Şirket E-posta Adresi]</strong> üzerinden iletebilirsiniz. Talebiniz alındıktan sonra size gerekli talimatlar gönderilecektir.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            Politika Değişiklikleri
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Şirketimiz, iade ve geri ödeme politikasını dilediği zaman güncelleyebilir. Politika değişiklikleri sitede yayınlandığı anda geçerlidir.
                        </p>
                    </div>
                </section>

                {/* İletişim */}
                <section className="">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        İade ve geri ödemelerle ilgili sorularınız için <strong>[Şirket E-posta Adresi]</strong> adresine e-posta gönderebilirsiniz.
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

export default RefundPolicy;
