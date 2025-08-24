'use client';

import Image from 'next/image';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

const tags = [
  'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max', 'iPhone 16e', 'Dyson Süpürge', 'Stanley Termos', 'Koltuk Takımı', 'Kurutma Makinesi', 'Playstation 5',
  'Kuzine Soba', 'Aura Cleanmax', 'Arçelik Bulaşık Makinesi', 'Pandora', 'Zara', 'Sweatshirt', 'Philips Airfryer', 'Decathlon', 'IKEA', 'Siemens Bulaşık Makinesi', 'Gant',
  'Under Armour', 'iPhone 15', 'Baget Yüzük', 'Adidas Samba', 'Makyaj Seti', 'Bargello', 'Cep Telefonu', 'UGG', 'Nike Air Force',
];

export function InterestTags() {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Bunlar da İlginizi Çekebilir</h2>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag, index) => (
            <a
              key={index}
              href="#"
              className="px-4 py-2 bg-white text-gray-700 rounded-full border border-slate-200 text-sm hover:bg-gray-200 transition-colors"
            >
              {tag}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};






export function ContentSection() {
  return (
    <div className="bg-white py-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Tüm İhtiyaçlarınız İçin Tek İhtiyacınız Trendyol!
        </h2>
        <div className="space-y-4 text-gray-600">
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </p>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
          </p>
        </div>
      </div>
    </div>
  );
};


// Data for Links
const popularBrands = [
  ['Watsons', 'Stradivarius', 'Queenna', 'Puma', 'Apple', 'Birkenstock', 'Nivea', 'Madame Coco', 'Defacto', 'TeknoSA', 'Bosch'],
  ['English Home', 'The North Face', 'Samsung', 'New Balance', 'Oppo', 'Arçelik', 'Skechers', 'Penti & Bear', 'Mavi', 'Farmasi', 'Cat'],
  ['Bershka', 'Baymen', 'Lumberjack', 'Denimood', 'Huawei', 'Dyson', 'Popüler Sayfalar', 'Koton', 'Helly Hansen', 'Karaca', 'Trendyol Japan'],
  ['Bluetooth Kulaklık', 'MacBook', 'iPhone 15', 'iPhone 16 Pro Max', 'iPhone 16', 'MacBook', 'Trendyol Greek', 'Trendyol English', 'Trendyol Deutsch', 'Trendyol Turkish'],
  ['iPhone', 'Nike Air Max', 'iPhone 15 Pro', 'Bulak Mağazası', 'Kahve Dünyası', 'Dyson Airwrap', 'Trendyol Romania', 'Trendyol Hungary', 'Trendyol Poland', 'Trendyol Arabic'],
  ['Samsung Cep Telefonu', 'Rolex Süper', 'Rolex İkonik', 'iPhone 15 Pro Max', 'Apple Watch Series 9', 'Lacoste', 'Apple AirPods', 'Trendyol Czech', 'Trendyol Ukraine', 'Network']
];

const footerLinks = {
  about: ['Biz Kimiz', 'Kariyer', 'Sürdürülebilirlik', 'İletişim', 'Trendyol\'da Güvenlik', 'Ürün Geri Çağırma'],
  campaigns: ['Kampanyalar', 'Alışveriş Kredisi', 'Elite Üyelik', 'Hediye Fikirleri'],
  seller: ['Trendyol\'da Satış Yap', 'Temel Kavramlar', 'Trendyol Akademi'],
  help: ['Sıkça Sorulan Sorular', 'Canlı Yardım / Asistan', 'Nasıl İade Edebilirim', 'İşlem Rehberi'],
};

const subFooterLinks = ['Çerez Tercihleri', 'KVKK ve Gizlilik Politikası', 'DSM Grup', 'Kullanım Koşulları'];

// ScrollToTopButton Component
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`${isVisible ? 'opacity-100' : 'opacity-0'
        } fixed bottom-8 right-8 z-50 bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-opacity duration-300`}
    >
      <Icon icon="mdi:chevron-up" className="w-6 h-6" />
    </button>
  );
};


export const Brands = () => {
  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Popüler Marka ve Mağazalar</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-sm text-gray-600">
        {popularBrands.map((col, colIndex) => (
          <div key={colIndex} className="space-y-3">
            {col.map((link, linkIndex) => (
              <a key={linkIndex} href="#" className="block hover:underline">{link}</a>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Footer Component
export function BottomFooter() {
  return (
    <>
      <footer className="bg-white border-t border-gray-200">
        {/* Popular Brands Section */}


        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-10">
            {/* Main Footer Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {/* Column 1 */}
              <div className="space-y-4">
                <Image src="/assets/logo/logo.png" alt="Logo" width={128} height={32} />
                <ul className="space-y-2 text-sm text-gray-600">
                  {footerLinks.about.map(link => <li key={link}><a href="#" className="hover:underline">{link}</a></li>)}
                </ul>
              </div>
              {/* Column 2 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Kampanyalar</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {footerLinks.campaigns.map(link => <li key={link}><a href="#" className="hover:underline">{link}</a></li>)}
                </ul>
              </div>
              {/* Column 3 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Satıcı</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {footerLinks.seller.map(link => <li key={link}><a href="#" className="hover:underline">{link}</a></li>)}
                </ul>
              </div>
              {/* Column 4 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Yardım</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {footerLinks.help.map(link => <li key={link}><a href="#" className="hover:underline">{link}</a></li>)}
                </ul>
              </div>
              {/* Column 5 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Ülke Değiştir</h3>
                <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                  <option>Ülke Seç</option>
                </select>
                <h3 className="font-semibold text-gray-800 pt-4">Sosyal Medya</h3>
                <div className="flex space-x-4 text-gray-600">
                  <a href="#" aria-label="Facebook"><Icon icon="mdi:facebook" className="w-6 h-6" /></a>
                  <a href="#" aria-label="Instagram"><Icon icon="mdi:instagram" className="w-6 h-6" /></a>
                  <a href="#" aria-label="YouTube"><Icon icon="mdi:youtube" className="w-6 h-6" /></a>
                  <a href="#" aria-label="X"><Icon icon="pajamas:x" className="w-5 h-5" /></a>
                </div>
              </div>
            </div>

            {/* Bottom Row with App Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10 mt-10 border-t border-gray-200">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Güvenlik Sertifikası</h3>
                <div className="flex space-x-2">
                  <Image src="/assets/logo/footer1.png" alt="Security Certificate" width={32} height={30} />
                  <Image src="/assets/logo/footer2.png" alt="Security Certificate" width={32} height={30} />
                  <Image src="/assets/logo/footer3.png" alt="Security Certificate" width={32} height={30} />
                  <Image src="/assets/logo/footer4.png" alt="Security Certificate" width={32} height={30} />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Güvenli Alışveriş</h3>
                <div className="flex space-x-2">
                  <Image src="/assets/logo/footer.png" alt="Secure Shopping" width={160} height={100} />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Mobil Uygulamalar</h3>
                <div className="flex flex-wrap gap-3">
                  <a href="#" className="flex items-center gap-3 bg-gray-900 text-white p-2 rounded-lg">
                    <Image src="/assets/logo/foot3.png" alt="App Store" width={24} height={24} />
                    <div>
                      <p className="text-xs">App Store'dan</p>
                      <p className="text-sm font-semibold">indirin</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 bg-gray-900 text-white p-2 rounded-lg">
                    <Image src="/assets/logo/foot2.png" alt="Google Play" width={24} height={24} />
                    <div>
                      <p className="text-xs">Google Play</p>
                      <p className="text-sm font-semibold">'DEN ALIN</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 bg-gray-900 text-white p-2 rounded-lg">
                    <Image src="/assets/logo/foot1.png" alt="AppGallery" width={24} height={24} />
                    <div>
                      <p className="text-xs">AppGallery</p>
                      <p className="text-sm font-semibold">ile KESFEDIN</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Footer */}
        <div className="bg-gray-800 text-gray-400 text-sm">
          <div className="max-w-7xl mx-auto py-3 flex flex-col md:flex-row justify-between items-center">
            <p>©2025 DSM Grup Danimanlik Iletiim ve Sati Tic. A.S. Her Hakki Saklidir.</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 md:mt-0">
              {subFooterLinks.map(link => <a key={link} href="#" className="hover:text-white">{link}</a>)}
            </div>
          </div>
        </div>
      </footer>
      <ScrollToTopButton />
    </>
  );
};

import React from 'react'

function Footer() {
  return (
    <div>
      {/* <InterestTags /> */}
      {/* <ContentSection /> */}
      <BottomFooter />
    </div>
  )
}

export default Footer




