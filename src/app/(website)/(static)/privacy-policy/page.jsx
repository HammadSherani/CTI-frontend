"use client";

import SideLinkPage from "@/components/website/SideLinkPage";
import React from "react";

function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 grid grid-cols-3 px-12 py-8">
            <div className="col-span-2 sm:px-6 lg:px-8 py-4">
                <div className=" mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Gizlilik ve Güvenlik Politikası
                    </h1>
                    <div className="w-24 h-1 bg-primary-600  mb-3"></div>
                    <p className="text-gray-600 ">
                        Gizliliğinizi korumak için taahhütte bulunuyoruz. Bu politika, bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.
                    </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
                    <h2 className="text-lg font-semibold text-yellow-800 mb-2">Önemli Uyarı</h2>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                        Bu sayfada sunulan sözleşme örnek amaçlıdır. Sözleşme şartları sektörünüze göre değişiklik gösterebilir. Sözleşme içeriğini kendi şirketinize uyarlamalı ve web sitenize eklemelisiniz. Sözleşme içeriğinden site sahibi sorumludur. Şirketimiz örnek sözleşmelerin kullanımından sorumluluk kabul etmemektedir.
                    </p>
                </div>

                {/* Erişim Bölümü */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                        Erişim ve Yönetim
                    </h2>
                    <div className="  ">
                        <p className="mb-4 text-gray-700 leading-relaxed">
                            Sözleşmeleri admin panelinizde <strong>İçerik Yönetimi &gt; Sayfalar</strong> bölümünden düzenleyebilirsiniz. Sayfalar bölümü hakkında daha fazla bilgi almak için{' '}
                            <a href="#" className="text-primary-600 hover:underline font-medium">
                                buraya
                            </a>{' '}
                            tıklayın.
                        </p>
                        <div className="bg-primary-50 p-4 rounded-lg mb-4">
                            <p className="text-sm font-medium text-primary-800 mb-2">İpucu:</p>
                            <p className="text-sm text-primary-700">
                                E-ticaret sitenize veya web sitenize sözleşmeler eklerken, şirketinizin yasal yükümlülüklerini ve sektör gereksinimlerini göz önünde bulundurun. Bir avukattan hukuki danışmanlık almayı unutmayın.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Politika Örneği Bölümü */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
                        Gizlilik ve Güvenlik Politikası
                    </h2>
                    <div className="space-y-8">
                        <p className="text-gray-700 leading-relaxed">
                            Mağazamızda sunulan hizmetlerin tümü ve <strong>[Şirket Adı]</strong> A.Ş., <strong>[Mağaza adresi]</strong> adresinde kayıtlı olup şirketimiz tarafından işletilmektedir.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Şirketimiz çeşitli amaçlarla kişisel veriler toplayabilir. Aşağıda, kişisel verilerin nasıl ve ne şekilde toplandığı, ne şekilde korunduğu açıklanmaktadır.
                        </p>

                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                Kişisel Verilerin Toplanması
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Üyelere ait bazı kişisel bilgiler (isim-soyisim, firma bilgisi, telefon, adres veya e-posta adresleri gibi) Mağazamız tarafından çeşitli formların ve anketlerin doldurulması veya üyelik yoluyla işin doğası gereği toplanmaktadır.
                            </p>
                        </div>

                        {/* Kampanya ve Bilgilendirme */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                Kampanya ve Bilgilendirme
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Şirketimiz, müşterilerine ve üyelerine kampanya bilgileri, yeni ürün bilgileri ve promosyon teklifleri gönderebilir. Üyelerimiz, bu bilgileri alıp almama konusundaki tercihlerini üye olurken belirtebilirler. Daha sonra giriş yaptıktan sonra hesap bilgileri bölümünden bu seçimi değiştirebilir veya bildirim e-postasında yer alan link üzerinden bildirimde bulunabilirler.
                            </p>
                        </div>

                        {/* Kişisel Bilgilerin Güvenliği */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                Kişisel Bilgilerin Güvenliği
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Üyelerimiz tarafından mağazamız üzerinden veya e-posta yoluyla gerçekleştirilen onay sürecinde elektronik ortamda mağazamıza iletilen kişisel bilgiler, Üyelerimiz ile yapmış olduğumuz "Kullanıcı Sözleşmesi" ile belirlenen amaçlar ve kapsam dışında üçüncü kişilere açıklanmayacaktır.
                            </p>
                        </div>

                        {/* IP Adreslerinin Kullanımı */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                IP Adreslerinin Kullanımı
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Şirketimiz, sistemle ilgili sorunları tanımlamak ve hizmetle ilgili sorunları çözmek için üyelerinin IP adreslerini kaydeder ve kullanır. IP adresleri, ayrıca kullanıcıları genel olarak tanımlamak ve kapsamlı demografik bilgiler toplamak için kullanılabilir.
                            </p>
                        </div>

                        {/* Kredi Kartı Güvenliği */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                Kredi Kartı Güvenliği
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Şirketimiz, web sitelerimizden alışveriş yapan kredi kartı sahiplerinin güvenliğine öncelik verir. Kredi kartı bilgileriniz hiçbir şekilde sistemimizde saklanmamaktadır.
                            </p>
                        </div>

                        {/* SSL Güvenliği */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                SSL Güvenliği
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Alışverişler sırasında kullanılan kredi kartı bilgileri, alışveriş sitelerimizden bağımsız olarak 128 bit SSL (Secure Sockets Layer) protokolü ile şifrelenir ve ilgili bankaya sorulmak üzere iletilir. Kartın kullanılabilirliği onaylanırsa alışverişe devam edilir. Kartla ilgili hiçbir bilgiyi görüntüleyemediğimiz veya saklayamadığımız için, üçüncü şahısların bu bilgilere herhangi bir koşulda erişmesi engellenmiş olur.
                            </p>
                        </div>

                        {/* Posta Yoluyla Sipariş Güvenliği */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                Posta Yoluyla Sipariş Güvenliği
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Kredi kartıyla mail-order sipariş yöntemiyle bize gönderdiğiniz kimlik ve kredi kartı bilgileriniz gizliliğe tabi tutulacaktır. Bu bilgiler, olası bir itiraz durumunda 60 gün süreyle saklanacak, ardından imha edilecektir.
                            </p>
                        </div>

                        {/* Üçüncü Taraf Web Siteleri ve Uygulamalar */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                Üçüncü Taraf Web Siteleri ve Uygulamalar
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Mağazamız, web sitesi içinde başka sitelere link verebilir. Şirketimiz, bu linkler aracılığıyla erişilen sitelerin gizlilik uygulamalarından veya içeriklerinden sorumlu değildir.
                            </p>
                        </div>

                        {/* İstisnai Durumlar */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                İstisnai Durumlar
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Aşağıda belirtilen sınırlı durumlarda, şirketimiz bu "Gizlilik Politikası" hükümleri dışında kullanıcı bilgilerini üçüncü kişilere açıklayabilir:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>Kanunlarla ve diğer mevzuatlarla getirilen yükümlülüklere uymak için.</li>
                                <li>"Üyelik Sözleşmesi"nin gereklerini yerine getirmek için.</li>
                                <li>Yetkili makamlarca yürütülen soruşturmalar için.</li>
                                <li>Kullanıcıların haklarını veya güvenliğini korumak için.</li>
                            </ul>
                        </div>

                        {/* E-posta Güvenliği */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                E-posta Güvenliği
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Mağazamıza gönderdiğiniz e-postalarda asla kredi kartı bilgilerinizi paylaşmayın. E-postalarda yer alan bilgiler üçüncü şahıslar tarafından görüntülenebilir ve şirketimiz bu bilgilerin güvenliğini garanti edemez.
                            </p>
                        </div>

                        {/* Tarayıcı Çerezleri */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                Tarayıcı Çerezleri
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Şirketimiz, mağazamızı ziyaret eden kullanıcılar hakkında bilgi toplamak için çerezleri kullanabilir. Çerezler, web sitemizde gezinmenizi kolaylaştırmak ve tercihlerinizi hatırlamak için kullanılır.
                            </p>
                        </div>

                        {/* Politika Değişiklikleri */}
                        <div className="">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                                <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                                Politika Değişiklikleri
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                Şirketimiz, bu "Gizlilik Politikası"nın hükümlerini istediği zaman değiştirebilir. Politikada yapılan değişiklikler, sitede yayınlandığı anda geçerli olur.
                            </p>
                        </div>
                    </div>
                </section>

                {/* İletişim Bölümü */}
                <section className="">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Gizlilik politikamızla ilgili her türlü soru veya öneriniz için <strong>[Şirket E-posta Adresi]</strong> adresine e-posta gönderebilirsiniz.
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

export default PrivacyPolicy;