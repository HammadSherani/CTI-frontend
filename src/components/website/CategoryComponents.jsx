import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";
import handleError from "@/helper/handleError";
import axiosInstance from "@/config/axiosInstance";
import { useCallback, useEffect, useState } from "react";

export function MobileRepairCategory() {
    const [brands, setBrands] = useState([])
    const fetchBrands = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get('/public/brands');
            setBrands(data?.data?.brands);
        } catch (error) {
            handleError(error);
        }
    }, []);


    useEffect(() => {
        fetchBrands()
    }, [])


    console.log('brands', brands);

    return (
        <div className="">
            <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                    Popular Brands
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    {brands?.map((brand) => (
                        <Link
                            key={brand.name}
                            href={brand.slug}
                            className="flex items-center flex-col justify-center gap-3 px-3 py-2 hover:bg-orange-50 rounded-lg transition-colors duration-200 group"
                        >
                            <Icon icon={brand.icon} className="text-xl text-gray-600 group-hover:text-orange-600" />
                            <span className="text-sm text-gray-700 group-hover:text-orange-600">
                                {brand.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

// New Products Category Component
export function NewProductsCategory() {
    const categories = [
        {
            name: "Smartphones",
            icon: "mdi:cellphone",
            link: "/products/smartphones",
            items: ["iPhone 15 Pro", "Samsung S24", "Pixel 8"]
        },
        {
            name: "Tablets",
            icon: "mdi:tablet",
            link: "/products/tablets",
            items: ["iPad Pro", "Galaxy Tab", "Surface Pro"]
        },
        {
            name: "Laptops",
            icon: "mdi:laptop",
            link: "/products/laptops",
            items: ["MacBook Pro", "Dell XPS", "ThinkPad"]
        },
        {
            name: "Accessories",
            icon: "mdi:headphones",
            link: "/products/accessories",
            items: ["AirPods", "Cases", "Chargers"]
        },
    ];

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
                Shop New Products
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => (
                    <div key={category.name} className="space-y-2">
                        <Link
                            href={category.link}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200"
                        >
                            <Icon icon={category.icon} className="text-xl text-orange-600" />
                            <span className="font-medium text-gray-800">{category.name}</span>
                        </Link>
                        <div className="ml-4 space-y-1">
                            {category.items.map((item) => (
                                <Link
                                    key={item}
                                    href={`${category.link}/${item.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="block text-sm text-gray-600 hover:text-orange-600 py-1"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Refurbished Products Category Component
export function RefurbishedProductsCategory() {
    const products = [
        {
            name: "Refurbished Phones",
            icon: "mdi:cellphone-check",
            link: "/refurbished/phones",
            badge: "Up to 40% Off",
            items: ["iPhone 13", "Samsung S21", "OnePlus 9"]
        },
        {
            name: "Refurbished Laptops",
            icon: "mdi:laptop",
            link: "/refurbished/laptops",
            badge: "Certified",
            items: ["MacBook Air", "HP EliteBook", "Dell Latitude"]
        },
        {
            name: "Refurbished Tablets",
            icon: "mdi:tablet",
            link: "/refurbished/tablets",
            badge: "1 Year Warranty",
            items: ["iPad Air", "Galaxy Tab S7", "Surface Go"]
        },
    ];

    return (
        <div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Icon icon="mdi:shield-check" className="text-green-600 text-xl" />
                    <h3 className="text-sm font-semibold text-gray-800">Certified Refurbished</h3>
                </div>
                <p className="text-xs text-gray-600">
                    Premium quality, tested & certified with 1-year warranty
                </p>
            </div>

            <div className="space-y-3">
                {products.map((product) => (
                    <div key={product.name} className="border border-gray-200 rounded-lg p-3 hover:border-orange-300 transition-colors duration-200">
                        <Link href={product.link} className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Icon icon={product.icon} className="text-xl text-orange-600" />
                                <span className="font-medium text-gray-800">{product.name}</span>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {product.badge}
                            </span>
                        </Link>
                        <div className="flex flex-wrap gap-2 ml-7">
                            {product.items.map((item) => (
                                <Link
                                    key={item}
                                    href={`${product.link}/${item.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="text-xs text-gray-600 hover:text-orange-600 bg-gray-100 px-2 py-1 rounded"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Academy Category Component
export function AcademyCategory() {
    const courses = [
        {
            name: "Mobile Repair Course",
            icon: "mdi:school",
            link: "/academy/mobile-repair",
            duration: "3 Months",
            level: "Beginner"
        },
        {
            name: "Advanced Soldering",
            icon: "mdi:fire",
            link: "/academy/soldering",
            duration: "1 Month",
            level: "Advanced"
        },
        {
            name: "Laptop Repair Training",
            icon: "mdi:laptop",
            link: "/academy/laptop-repair",
            duration: "4 Months",
            level: "Intermediate"
        },
        {
            name: "Business Management",
            icon: "mdi:briefcase",
            link: "/academy/business",
            duration: "2 Months",
            level: "All Levels"
        },
    ];

    const resources = [
        { name: "Video Tutorials", icon: "mdi:play-circle", link: "/academy/videos" },
        { name: "Study Materials", icon: "mdi:book-open", link: "/academy/materials" },
        { name: "Certification", icon: "mdi:certificate", link: "/academy/certification" },
    ];

    return (
        <div className="grid grid-cols-3 gap-4">
            {/* Courses */}
            <div className="col-span-2 space-y-2">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                    Our Courses
                </h3>
                {courses.map((course) => (
                    <Link
                        key={course.name}
                        href={course.link}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors duration-200 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg group-hover:bg-orange-100">
                                <Icon icon={course.icon} className="text-xl text-orange-600" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-800 group-hover:text-orange-600">
                                    {course.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {course.duration} • {course.level}
                                </div>
                            </div>
                        </div>
                        <Icon icon="mdi:arrow-right" className="text-gray-400 group-hover:text-orange-600" />
                    </Link>
                ))}
            </div>

            {/* Resources */}
            <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                    Resources
                </h3>
                <div className="space-y-2">
                    {resources.map((resource) => (
                        <Link
                            key={resource.name}
                            href={resource.link}
                            className="flex items-center gap-2 p-2 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                        >
                            <Icon icon={resource.icon} className="text-lg text-orange-600" />
                            <span className="text-sm text-gray-700">{resource.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Default Empty Category Component (for categories without subcategories)
export function EmptyCategory({ categoryName }) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-8">
            <Icon icon="mdi:information-outline" className="text-4xl text-gray-400 mb-3" />
            <p className="text-gray-600">No subcategories available for {categoryName}</p>
        </div>
    );
}