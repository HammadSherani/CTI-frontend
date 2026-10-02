const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src/app/[locale]/(admin)/admin/(dashboard)/academy/academy-categories');
const destDir = path.join(__dirname, 'src/app/[locale]/(admin)/admin/(dashboard)/academy/academy-subcategories');

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    const elements = fs.readdirSync(from);
    elements.forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isFile()) {
            let content = fs.readFileSync(fromPath, 'utf8');
            // Replace references
            content = content.replace(/academic-category/g, 'academic-subcategory');
            content = content.replace(/Academy Categories/g, 'Academy SubCategories');
            content = content.replace(/academy-categories/g, 'academy-subcategories');
            content = content.replace(/Category Name/g, 'SubCategory Name');
            content = content.replace(/Category created/g, 'SubCategory created');
            content = content.replace(/Category updated/g, 'SubCategory updated');
            
            fs.writeFileSync(toPath, content);
        } else {
            copyFolderSync(fromPath, toPath);
        }
    });
}

try {
    copyFolderSync(srcDir, destDir);
    console.log("Copy and modification successful.");
} catch (error) {
    console.error("Error:", error);
}
