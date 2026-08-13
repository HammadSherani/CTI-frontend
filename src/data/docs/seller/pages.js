export const sellerPages = {
  // ───────────────────────── Seller Basics ─────────────────────────

  seller: {
    title: 'Seller Basics',
    description: 'What selling on CTI means, and everything about setting up your seller account.',
    content: [
      {
        type: 'lead',
        text: 'CTI is a marketplace where many different sellers list and sell their own products to customers, alongside CTI\'s refurbished-devices and repair-service offerings. As a seller, you get your own dashboard to manage your products, orders, and earnings.',
      },
      {
        type: 'paragraph',
        text: 'When you become a seller, you can list products under CTI\'s existing categories and brands, set your own prices, manage your own stock, and fulfill your own orders. Customers can also visit your public store page to browse everything you sell.',
      },

      { type: 'heading', id: 'what-you-can-do', text: 'What you can do as a seller' },
      {
        type: 'list',
        items: [
          'Add and manage your own products, with your own pricing and stock',
          'Receive and fulfill orders placed by customers',
          'Track your earnings and request payouts to your bank account',
          'Reply to customer and order enquiries',
          'Run sponsored ad campaigns for your products or store',
          'Manage returns for your orders',
        ],
      },

      { type: 'heading', id: 'becoming-a-seller', text: 'Becoming a Seller — the overall path' },
      {
        type: 'paragraph',
        text: 'Becoming a seller has three phases: register your account, complete your seller profile for verification, then wait for approval. Once approved, your dashboard unlocks and you can start adding products.',
      },
      {
        type: 'steps',
        items: [
          { title: 'Create your account', text: 'Sign up and choose Seller as your account type.' },
          {
            title: 'Complete your seller profile',
            text: 'Fill in your personal details, business details, upload your documents, set your shipping preferences, and add your bank details.',
          },
          {
            title: 'Wait for approval',
            text: 'Your profile is reviewed. You\'ll be notified once it\'s approved, sent back for changes, or rejected.',
          },
          { title: 'Start selling', text: 'Once approved, your seller dashboard unlocks and you can add products right away.' },
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'You cannot access your seller dashboard or add products until your profile is approved — plan for a short review period before you can go live.',
      },

      { type: 'heading', id: 'registration', text: 'Registration' },
      {
        type: 'paragraph',
        text: 'Registration is a single sign-up form — you don\'t need a separate "seller application" first.',
      },
      {
        type: 'steps',
        items: [
          { title: 'Open the registration page', text: 'Go to the CTI registration page.' },
          { title: 'Fill in your details', text: 'Enter your name, email address, phone number, and a password.' },
          {
            title: 'Choose Seller as your account type',
            text: 'The registration form has an account type option — select Seller (alongside Customer and Repair Specialist).',
          },
          {
            title: 'Submit and verify your email',
            text: 'After submitting, you\'ll be asked to verify your account with a one-time code (OTP) sent to your email.',
          },
        ],
      },
      { type: 'link', label: 'Go to Registration', href: '/auth/register' },

      { type: 'heading', id: 'onboarding-kyc', text: 'Onboarding & Verification (KYC)' },
      {
        type: 'paragraph',
        text: 'After registering, you\'ll complete a 5-step profile form. This is required before your seller dashboard unlocks and CTI can review your account.',
      },
      {
        type: 'steps',
        items: [
          {
            title: '1. Personal Information',
            text: 'Your full name, gender, date of birth, phone number, and your store address (country, state, city, zip code).',
          },
          {
            title: '2. Business Information',
            text: 'Your business name, a description of your store (20–700 characters), your national ID or tax number, and whether you also sell refurbished devices.',
          },
          {
            title: '3. Document Uploads',
            text: 'Upload a profile picture/logo, your national ID or passport, your shop license or tax certificate, and a proof of address. Each document can be an image or PDF, up to 5MB.',
          },
          {
            title: '4. Shipping & Operations',
            text: 'Choose how you\'ll fulfill orders (pickup, courier, or drop-off), your working days, and your working hours.',
          },
          {
            title: '5. Bank Details',
            text: 'Your account title, account number, and bank name (branch name and IBAN are optional). This is where your earnings will eventually be paid out.',
          },
        ],
      },
      {
        type: 'paragraph',
        text: 'Once you submit, your profile status becomes Pending and CTI reviews it — typically within 12 to 24 hours.',
      },
      {
        type: 'table',
        headers: ['Status', 'What it means'],
        rows: [
          ['Pending / Under Review', 'Your profile has been submitted and is being reviewed. You can\'t access the dashboard yet.'],
          ['Approved', 'You\'re verified — your dashboard unlocks and you can start adding products.'],
          ['Revision Required', 'CTI needs you to update something specific. A reason is shown so you know what to fix.'],
          ['Rejected', 'Your profile was not approved. A reason is shown, along with a way to contact support.'],
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'You must be 18 or older to register as a seller — this is checked from the date of birth you provide.',
      },

      { type: 'heading', id: 'seller-profile', text: 'Your Seller Profile' },
      {
        type: 'paragraph',
        text: 'Your seller profile is your business identity on CTI — it\'s built during onboarding and can be updated afterward from your dashboard.',
      },
      {
        type: 'list',
        items: [
          '**Personal details** — name, gender, date of birth, phone, store address',
          '**Business details** — business name, store description, tax/ID number, whether you sell refurbished devices',
          '**Documents** — profile picture/logo, cover photo, ID, shop license/tax certificate, proof of address',
          '**Shipping preferences** — fulfillment method, working days and hours',
          '**Bank details** — where your payouts are sent',
          '**Social links** — Facebook, Instagram, Twitter, LinkedIn, WhatsApp, YouTube, TikTok, and your website',
          '**Store banner images** — up to 5, shown on your public store page',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'Every approved seller is also given a unique seller ID, and customers can visit your public store page to see everything you sell.',
      },

      { type: 'heading', id: 'requirements', text: 'Requirements Checklist' },
      {
        type: 'paragraph',
        text: 'Having everything ready before you start your profile makes onboarding quick. Here\'s the full checklist.',
      },
      {
        type: 'list',
        items: [
          'You must be 18 years or older',
          'A valid national ID or passport',
          'A shop license or tax certificate',
          'A proof of address document',
          'A profile picture or logo for your store',
          'Your business name and a short store description',
          'Your bank account details (account title, account number, bank name)',
          'A working email address and phone number',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Documents can be uploaded as an image or PDF, up to 5MB each — have digital copies ready before you begin.',
      },
    ],
  },

  // ───────────────────────── Products ─────────────────────────

  products: {
    title: 'Products',
    description: 'Everything about adding, pricing, and managing your products.',
    content: [
      {
        type: 'lead',
        text: 'Once your seller account is approved, you can add products from your dashboard\'s Products section. This page covers everything about listing and managing products.',
      },

      { type: 'heading', id: 'adding-products', text: 'Adding Products' },
      {
        type: 'steps',
        items: [
          { title: 'Go to Products → Add Product', text: 'Open the add-product form from your dashboard.' },
          {
            title: 'Fill in the product details',
            text: 'Title, description, category, subcategory and brand, tags, and warranty information.',
          },
          {
            title: 'Upload images (and videos, if you have them)',
            text: 'At least one image is required.',
          },
          {
            title: 'Set your price and stock',
            text: 'Every product starts with a default price and stock level, which you can later split into variants.',
          },
          { title: 'Save the product', text: 'Your product is created and immediately visible in your store.' },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'There\'s no waiting period or approval step for products — once you save it, it\'s live. You stay fully in control of activating, editing, or removing it afterward.',
      },

      { type: 'heading', id: 'categories-brands', text: 'Categories, Subcategories & Brands' },
      {
        type: 'paragraph',
        text: 'Every product belongs to a category (required), and optionally a subcategory and a brand. These lists are managed by CTI — as a seller, you choose from the existing options rather than creating new ones.',
      },
      {
        type: 'steps',
        items: [
          { title: 'Choose a category', text: 'Pick from CTI\'s list of active categories.' },
          { title: 'Choose a subcategory (optional)', text: 'The subcategory list updates based on the category you picked.' },
          { title: 'Choose a brand (optional)', text: 'The brand list updates based on the subcategory you picked.' },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'Categories, subcategories, and brands are all managed by CTI — sellers pick from the existing list and cannot create new ones themselves.',
      },

      { type: 'heading', id: 'product-information', text: 'Product Information' },
      {
        type: 'paragraph',
        text: 'Beyond category/brand, each product carries the following information.',
      },
      {
        type: 'list',
        items: [
          '**Title** — the product name customers see (up to 300 characters)',
          '**Short description** — a brief summary (up to 500 characters)',
          '**Full description** — the complete product description',
          '**Model number** — must be unique across the platform',
          '**Tags** — keywords that help customers find your product',
          '**Warranty** — whether the product has a warranty, and for how many months',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'A SKU and barcode are generated for your product automatically — you don\'t need to create these yourself.',
      },

      { type: 'heading', id: 'variants-pricing', text: 'Variants & Pricing' },
      {
        type: 'paragraph',
        text: 'A variant is a specific version of your product — for example, a T-shirt in "Red / Large" versus "Blue / Small." Each variant has its own price and stock.',
      },
      {
        type: 'paragraph',
        text: 'You set the price you want to receive for a variant. CTI adds a platform fee on top of your price to form the price the customer actually pays — you always receive the price you set.',
      },
      {
        type: 'example',
        title: 'Example',
        text: 'If you set your price to 1,000 and the platform fee is 10%, the customer sees a selling price of 1,100. You still receive 1,000 for that sale.',
      },
      {
        type: 'paragraph',
        text: 'You can also apply a discount percentage (up to 99%) to a variant. The discount lowers the price the customer pays — you continue to receive your original price, so the discount is absorbed by CTI\'s share, not deducted from your earnings.',
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'If a product has more than one variant, each variant needs at least one attribute (like Color or Size) so customers can tell them apart. A product with just one variant doesn\'t need this.',
      },

      { type: 'heading', id: 'stock-inventory', text: 'Stock & Inventory' },
      {
        type: 'paragraph',
        text: 'Stock is tracked per variant, not per product — so each version of a product (each color, size, etc.) has its own stock count.',
      },
      {
        type: 'list',
        items: [
          'Update stock any time from the product\'s variant management page',
          'Each variant\'s stock is managed independently of the others',
          'Keep your stock numbers current so customers only see what you can actually fulfill',
        ],
      },

      { type: 'heading', id: 'product-images', text: 'Product Images & Videos' },
      {
        type: 'list',
        items: [
          'At least 1 image is required to create a product',
          'Up to 5 images can be uploaded per product',
          'Up to 3 videos can be uploaded per product (optional)',
          'Your first image is used as the default/main image shown to customers',
          'Variants can also have their own images if a version looks different (e.g. a different color)',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Use clear, well-lit photos that show the product from multiple angles — this is often what customers check first.',
      },

      { type: 'heading', id: 'publishing-editing-removing', text: 'Publishing, Editing & Removing' },
      {
        type: 'paragraph',
        text: 'There is no approval step for products — you\'re fully in control of when a product is live, hidden, or removed. A product goes live the moment you create it, and you can edit its details, images, and pricing at any time.',
      },
      {
        type: 'paragraph',
        text: 'You can temporarily deactivate a product to hide it from your store without deleting it, and reactivate it later.',
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'If CTI deactivates the category your product belongs to, you won\'t be able to reactivate that product until the category is active again.',
      },
      { type: 'paragraph', text: 'Deleting a product removes it from your store listing.' },
    ],
  },

  // ───────────────────────── Orders & Selling ─────────────────────────

  orders: {
    title: 'Orders & Selling',
    description: 'How selling works end-to-end, and how to manage orders and returns.',
    content: [
      {
        type: 'lead',
        text: 'Here\'s the full lifecycle of a sale, from the moment a customer buys to when the money reaches your bank account, plus how to manage orders and returns.',
      },

      { type: 'heading', id: 'selling-flow', text: 'How Selling Works' },
      {
        type: 'steps',
        items: [
          { title: 'Customer places an order', text: 'The order appears in your Orders dashboard.' },
          {
            title: 'You prepare the order and create a shipment',
            text: 'A shipment must be created for the order before it can be marked as shipped.',
          },
          { title: 'You mark the order as shipped', text: 'The customer can then track their delivery.' },
          { title: 'The order is marked delivered', text: 'Once delivered, an earning record is created for you.' },
          {
            title: 'Your earning is held briefly',
            text: 'Earnings are held for a short period before becoming available for withdrawal — see the Earnings & Payments page.',
          },
          { title: 'You request a withdrawal', text: 'Once available, you can request a payout to your bank account.' },
        ],
      },

      { type: 'heading', id: 'seller-orders', text: 'Viewing Your Orders' },
      {
        type: 'list',
        items: [
          'Your Orders page shows every order that includes at least one of your products',
          'Search and filter orders by date range or status',
          'Open an order to see its items, quantities, and your total for that order',
          'View cancelled orders separately, along with who cancelled them',
        ],
      },

      { type: 'heading', id: 'order-management', text: 'Managing Order Status' },
      {
        type: 'paragraph',
        text: 'As you fulfill an order, you move it through a series of statuses so the customer stays informed.',
      },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [
          ['Pending', 'Order placed, not yet processed'],
          ['Processing', 'You\'re preparing the order'],
          ['Shipment Created', 'A shipment has been created for this order'],
          ['Shipping', 'The order is on its way'],
          ['Shipped', 'The order has been handed off for delivery'],
          ['Delivered', 'The customer has received the order — this also triggers your earning for it'],
          ['On Hold', 'The order is temporarily paused'],
          ['Cancelled', 'The order was cancelled'],
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'You must create a shipment for an order before you can mark it as Shipped or Delivered.',
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'Once an order is Delivered or Cancelled, its status is final and can no longer be changed.',
      },

      { type: 'heading', id: 'returns', text: 'Returns' },
      {
        type: 'paragraph',
        text: 'When a customer requests a return on one of your orders, it goes through its own review flow.',
      },
      {
        type: 'table',
        headers: ['Return status', 'Meaning'],
        rows: [
          ['Requested', 'The customer has asked to return the item'],
          ['Shipped', 'The item is being sent back to you'],
          ['Approved', 'You\'ve accepted the return'],
          ['Rejected', 'You\'ve declined the return'],
        ],
      },
      {
        type: 'paragraph',
        text: 'When you approve a return, the corresponding amount is deducted from your earnings/wallet, since that amount is refunded back to the customer.',
      },
    ],
  },

  // ───────────────────────── Earnings & Payments ─────────────────────────

  earnings: {
    title: 'Earnings & Payments',
    description: 'How your earnings are calculated, held, and paid out.',
    content: [
      {
        type: 'lead',
        text: 'Your wallet tracks everything you\'ve earned from sales, what\'s still held, and what\'s available to withdraw.',
      },

      { type: 'heading', id: 'platform-fee', text: 'Platform Fee' },
      {
        type: 'paragraph',
        text: 'CTI adds a platform fee of 10% on top of the price you set for each variant, to form the price the customer pays. You keep the price you originally set.',
      },

      { type: 'heading', id: 'how-earnings-work', text: 'How Earnings Work' },
      {
        type: 'steps',
        items: [
          { title: 'Order delivered', text: 'Once an order is marked Delivered, an earning is created for you.' },
          { title: 'Held for 20 days', text: 'Your earning is held for 20 days after delivery before becoming available.' },
          { title: 'Becomes available', text: 'After the hold period, the earning becomes part of your available balance.' },
          { title: 'Withdraw it', text: 'You can then request a withdrawal to your bank account.' },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'The hold period exists so that returns can still be processed before a payout is made final.',
      },

      { type: 'heading', id: 'withdrawals', text: 'Withdrawals & Payouts' },
      {
        type: 'paragraph',
        text: 'Once you have an available balance, you can request a withdrawal to the bank account on your profile.',
      },
      {
        type: 'steps',
        items: [
          {
            title: 'Make sure your bank details are saved',
            text: 'Your account number and bank name must already be on your profile before you can withdraw.',
          },
          { title: 'Go to your Wallet', text: 'Open the Wallet section of your dashboard.' },
          { title: 'Request a withdrawal', text: 'Request a payout from your available balance.' },
          { title: 'Wait for it to be processed', text: 'CTI reviews and processes withdrawal requests.' },
        ],
      },
      {
        type: 'table',
        headers: ['Withdrawal status', 'Meaning'],
        rows: [
          ['Pending', 'Your request has been submitted'],
          ['Processing', 'Your request is being processed'],
          ['Completed', 'The payout has been made'],
          ['Rejected', 'The request was not approved'],
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'You can only have one withdrawal request active at a time. If you need to change it, cancel the pending request first.',
      },
    ],
  },

  // ───────────────────────── More Seller Tools ─────────────────────────

  'other-tools': {
    title: 'More Seller Tools',
    description: 'Reviews, enquiries, ads, invoices, and reports.',
    content: [
      {
        type: 'lead',
        text: 'Beyond products and orders, your dashboard includes a few more tools to help you run your store.',
      },
      {
        type: 'list',
        items: [
          '**Reviews** — see the reviews customers have left on your products and store',
          '**Enquiries** — respond to customer questions and order-related queries',
          '**Ads** — create sponsored product or store campaigns to increase visibility',
          '**Invoices** — upload and manage your invoices',
          '**Reports** — view an account statement summarizing your activity',
        ],
      },
    ],
  },

  // ───────────────────────── Help & Reference ─────────────────────────

  help: {
    title: 'Help & Reference',
    description: 'Statuses, common problems, and frequently asked questions.',
    content: [
      { type: 'lead', text: 'A quick reference for every status you\'ll see, plus answers to the most common questions.' },

      { type: 'heading', id: 'statuses-rules', text: 'Statuses & Rules' },
      { type: 'paragraph', text: 'Your seller profile verification:' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [
          ['Pending / Under Review', 'Being reviewed, dashboard locked'],
          ['Approved', 'Verified, dashboard unlocked'],
          ['Revision Required', 'A specific change is needed — reason shown'],
          ['Rejected', 'Not approved — reason shown, with a way to contact support'],
        ],
      },
      { type: 'paragraph', text: 'Order fulfillment:' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [
          ['Pending, Processing, Shipment Created, Shipping, Shipped, Delivered, On Hold, Cancelled', 'Progress of an order being fulfilled'],
        ],
      },
      { type: 'paragraph', text: 'Returns:' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [['Requested, Shipped, Approved, Rejected', 'Progress of a return request']],
      },
      { type: 'paragraph', text: 'Earnings & withdrawals:' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [
          ['Pending Release, Available, Withdrawn', 'Stage of an earning from a delivered order'],
          ['Pending, Processing, Completed, Rejected', 'Stage of a withdrawal request'],
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'You must be 18+ to register, and your seller dashboard stays locked until your profile is Approved.',
      },

      { type: 'heading', id: 'common-problems', text: 'Common Problems' },
      {
        type: 'faq',
        items: [
          {
            q: 'My profile has been Pending for a while — what\'s happening?',
            a: 'Profile review typically takes 12 to 24 hours. If it takes longer, check your status — it may have moved to Revision Required, which shows a specific reason and what to fix.',
          },
          {
            q: 'I can\'t reactivate one of my products',
            a: 'This happens if the category your product belongs to has been deactivated by CTI. The product will be reactivatable again once that category is active.',
          },
          {
            q: 'I can\'t mark an order as Shipped or Delivered',
            a: 'You need to create a shipment for the order first — this is required before either of those statuses can be set.',
          },
          {
            q: 'My withdrawal request won\'t go through',
            a: 'Make sure your bank account details are saved on your profile, and that you don\'t already have another withdrawal request pending — only one can be active at a time.',
          },
          {
            q: 'I don\'t see the category or brand I need',
            a: 'Categories, subcategories, and brands are managed by CTI, not by individual sellers — you can only choose from the existing list.',
          },
          {
            q: 'My profile was rejected',
            a: 'A rejected profile shows the reason and a way to contact support for further help.',
          },
        ],
      },

      { type: 'heading', id: 'faq', text: 'Frequently Asked Questions' },
      {
        type: 'faq',
        items: [
          {
            q: 'What commission does CTI take?',
            a: 'CTI adds a platform fee of 10% on top of the price you set for each product variant. You always receive the price you originally set.',
          },
          {
            q: 'How long until my earnings are available to withdraw?',
            a: 'Earnings are held for 20 days after an order is delivered, then become available for withdrawal.',
          },
          {
            q: 'Do I need approval before I can add products?',
            a: 'Yes — your seller profile must be Approved before your dashboard unlocks. After that, products you add go live immediately with no separate approval step.',
          },
          {
            q: 'Can I create my own product categories or brands?',
            a: 'No, categories, subcategories, and brands are managed by CTI. As a seller, you choose from the existing list when adding a product.',
          },
          {
            q: 'How many images can I add to a product?',
            a: 'Up to 5 images and up to 3 videos per product, with at least 1 image required.',
          },
          {
            q: 'How do I get paid?',
            a: 'Once you have an available balance in your wallet, request a withdrawal — it\'s paid out to the bank account on your profile.',
          },
          {
            q: 'Can I indicate that I sell refurbished devices?',
            a: 'Yes — the Business Information step of your profile includes an option to indicate whether you also sell refurbished devices.',
          },
        ],
      },
    ],
  },
};
