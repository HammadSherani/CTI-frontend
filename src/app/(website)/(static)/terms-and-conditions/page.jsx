"use client";

import SideLinkPage from "@/components/website/SideLinkPage";
import React from "react";

function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-gray-50 grid grid-cols-3 px-12 py-8">
            <div className="col-span-2 sm:px-6 lg:px-8 py-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Kullanım Şartları ve Koşulları
                    </h1>
                    <div className="w-24 h-1 bg-primary-600 mb-3"></div>
                    <p className="text-gray-600">
                        Bu kullanım şartları, web sitemizin kullanımını, kullanıcı haklarını ve yükümlülüklerini açıklamaktadır. Lütfen dikkatlice okuyunuz.
                    </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
                    <h2 className="text-lg font-semibold text-yellow-800 mb-2">Önemli Uyarı</h2>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                        Bu sayfada sunulan içerik örnek amaçlıdır. Şartlar, sektörünüze veya şirketinize göre değişiklik gösterebilir. İçeriği kendi şirketinize uyarlamanız ve web sitenize eklemeniz gerekmektedir.
                    </p>
                </div>

                {/* Genel Şartlar */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Genel Şartlar
                    </h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        Web sitemizi kullanarak, aşağıdaki şartları kabul etmiş sayılırsınız. Şartlar, üyelik, sipariş, ödeme ve hizmetlerin kullanımı ile ilgilidir.
                    </p>
                    <div className="bg-primary-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium text-primary-800 mb-2">İpucu:</p>
                        <p className="text-sm text-primary-700">
                            Kullanım şartlarını oluştururken şirketinizin yasal yükümlülüklerini ve sektör gereksinimlerini dikkate alın. Gerekirse bir avukattan hukuki danışmanlık alın.
                        </p>
                    </div>
                </section>

                {/* Bölümler */}
                <section className="mb-12 space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            Üyelik ve Hesap
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Üyelik oluştururken verdiğiniz bilgiler doğru ve güncel olmalıdır. Hesabınızın güvenliği sizin sorumluluğunuzdadır.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            Hizmet Kullanımı
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Web sitemizde sunulan ürün ve hizmetleri yalnızca yasal ve izin verilen amaçlarla kullanabilirsiniz. Hizmetin kötüye kullanımı yasaktır.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            Ödemeler ve Siparişler
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Siparişleriniz, ödeme işlemleri tamamlandığında işleme alınır. Ödeme bilgileri gizli tutulur ve üçüncü taraflarla paylaşılmaz.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            Fesih ve İptal
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Kullanıcı veya şirket, hesap ve hizmetleri belirli şartlar altında sonlandırabilir. İptal ve fesih işlemleri, web sitemizde belirtilen prosedürlere tabidir.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            Sorumluluk Sınırlamaları
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Web sitemiz, içerik ve hizmetlerin kullanımından doğabilecek doğrudan veya dolaylı zararlardan sorumlu değildir. Kullanıcı, hizmetleri kendi sorumluluğunda kullanır.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            Üçüncü Taraf Bağlantıları
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Web sitemizden erişilen üçüncü taraf sitelerinin içerik ve gizlilik uygulamalarından şirketimiz sorumlu değildir.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                            Politika Değişiklikleri
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Şirketimiz, bu kullanım şartlarını istediği zaman güncelleyebilir. Değişiklikler sitede yayınlandığı anda geçerli olur.
                        </p>
                    </div>
                </section>

                {/* İletişim */}
                <section className="">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Kullanım şartlarıyla ilgili her türlü soru veya öneriniz için <strong>[Şirket E-posta Adresi]</strong> adresine e-posta gönderebilirsiniz.
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

export default TermsAndConditions;
