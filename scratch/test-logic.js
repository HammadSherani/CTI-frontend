const fs = require('fs');

const data = {
    "success": true,
    "data": {
        "_id": "6a85989fca7970b144879326",
        "images": [
            {
                "url": "https://clicktointegrate.s3.eu-north-1.amazonaws.com/refurbished-products/images/1787140254096-410039077.png",
                "publicId": "refurbished-products/images/1787140254096-410039077.png",
                "isDefault": true,
                "_id": "6a85989fca7970b144879327"
            }
        ],
        "variants": [
            {
                "_id": "6a8598caca7970b14487934c",
                "isDefault": false,
                "images": [
                    {
                        "url": "https://clicktointegrate.s3.eu-north-1.amazonaws.com/refurbished-products/images/1787140254096-410039077.png",
                        "publicId": "refurbished-products/images/1787140254096-410039077.png",
                        "_id": "6a85989fca7970b14487932a"
                    },
                    {
                        "url": "https://clicktointegrate.s3.eu-north-1.amazonaws.com/refurbish-variants/1787140294973-681410366.webp",
                        "publicId": "refurbish-variants/1787140294973-681410366.webp",
                        "_id": "6a8598caca7970b14487934f"
                    }
                ]
            },
            {
                "_id": "6a8598caca7970b144879348",
                "isDefault": true,
                "images": [
                    {
                        "url": "https://clicktointegrate.s3.eu-north-1.amazonaws.com/refurbished-products/images/1787140254096-410039077.png",
                        "publicId": "refurbished-products/images/1787140254096-410039077.png",
                        "_id": "6a85989fca7970b14487932a"
                    },
                    {
                        "url": "https://clicktointegrate.s3.eu-north-1.amazonaws.com/refurbish-variants/1787140294972-704957525.webp",
                        "publicId": "refurbish-variants/1787140294972-704957525.webp",
                        "_id": "6a8598caca7970b14487934b"
                    }
                ]
            }
        ]
    }
};

const productData = data.data;
const variants = productData.variants;
const selectedVariantId = variants.find(v => v.isDefault)._id; // "6a8598caca7970b144879348"
const selectedVariant = variants.find(v => v._id === selectedVariantId);

const selectedVariantImages = (selectedVariant?.images || []).map(i => i?.url || i);
const otherImages = variants.filter(v => v._id !== selectedVariantId).flatMap(v => (v.images || []).map(i => i?.url || i));
const productImages = (productData?.images || []).map(i => i?.url || i);
let allImages = [...new Set([...selectedVariantImages, ...productImages, ...otherImages])].filter(Boolean);

console.log("Selected Variant ID:", selectedVariantId);
console.log("allImages:", allImages);
