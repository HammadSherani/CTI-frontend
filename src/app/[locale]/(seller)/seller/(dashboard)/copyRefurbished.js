const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', '..', '..', '(admin)', 'admin', '(refurbished)', 'refurbished');
const targetDir = path.join(__dirname, 'refurbished');

function copyAndTransform(src, dest) {
    if (fs.statSync(src).isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(file => {
            copyAndTransform(path.join(src, file), path.join(dest, file));
        });
    } else {
        if (!src.endsWith('.jsx') && !src.endsWith('.js')) return;

        let content = fs.readFileSync(src, 'utf8');

        // Replace router.push paths
        content = content.replace(/\/admin\/refurbished/g, '/seller/refurbished');

        // Replace API routes (Products/Variants)
        content = content.replace(/\/admin\/refurbish\/categories/g, '/seller/refurbished-products/categories');
        content = content.replace(/\/admin\/refurbish\/brands\?categoryId=/g, '/seller/refurbished-products/brands/'); // Note: need to handle this query param difference if possible, or just change the frontend call
        // The admin call is `/admin/refurbish/brands?categoryId=${form.categoryId}`
        // Our seller route is `router.get('/brands/:categoryId', ...)`
        content = content.replace(/\/admin\/refurbish\/brands\?categoryId=\$\{([^\}]+)\}/g, '/seller/refurbished-products/brands/${$1}');
        
        content = content.replace(/\/admin\/refurbish\/products\/toggle\//g, '/seller/refurbished-products/products/toggle/');
        content = content.replace(/\/admin\/refurbish\/products/g, '/seller/refurbished-products/products');
        
        // Replace API routes (Orders)
        content = content.replace(/\/admin\/refurbish\/orders/g, '/seller/refurbished-orders');

        // Clean up some things like user vs seller specific components if necessary, but we'll manually check
        fs.writeFileSync(dest, content);
    }
}

// We only need products and orders
const modulesToCopy = ['products', 'orders'];
modulesToCopy.forEach(mod => {
    const src = path.join(sourceDir, mod);
    const dest = path.join(targetDir, mod);
    if (fs.existsSync(src)) {
        copyAndTransform(src, dest);
    }
});

console.log("Transformation complete.");
