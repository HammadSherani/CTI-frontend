// Content for the Refurbish documentation module, keyed by slug.
// Written for CTI customers (non-technical). Every fact here reflects
// the actual, currently-live Refurbish module — nothing is invented.
// Refurbished listings are entirely managed by the CTI team, so this
// module is customer-facing only (buying, and selling your own device
// to CTI) — there is no "become a refurbish seller" flow.
export const refurbishPages = {
  // ───────────────────────── Buying ─────────────────────────

  buying: {
    title: 'Buying Refurbished Devices',
    description: 'Browsing, saving, and purchasing refurbished devices on CTI.',
    content: [
      {
        type: 'lead',
        text: 'CTI\'s Refurbish section lets you buy quality-checked, pre-owned devices at a lower price than brand new. Every refurbished listing is added and maintained by the CTI team.',
      },

      { type: 'heading', id: 'browsing', text: 'Browsing & Filtering' },
      {
        type: 'paragraph',
        text: 'You can browse refurbished devices by category and brand, and narrow results using filters.',
      },
      {
        type: 'list',
        items: [
          'Filter by category and brand',
          'Filter by price range',
          'Filter by condition, storage, and RAM (the exact labels available depend on what\'s currently listed)',
          'Sort results and search by keyword',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'Condition, storage, and RAM labels are set individually on each listing, so always check the specific details on a product page rather than assuming a fixed set of options.',
      },

      { type: 'heading', id: 'product-details', text: 'Product Details' },
      {
        type: 'paragraph',
        text: 'Each refurbished product can have multiple versions (variants) — for example, different storage sizes or colors — each with its own price, stock, and photos. A product\'s price is shown as the price for whichever version you select.',
      },

      { type: 'heading', id: 'wishlist', text: 'Wishlist' },
      {
        type: 'paragraph',
        text: 'Save a refurbished device to your wishlist by tapping the heart icon on its listing. Your wishlist is available from your account and keeps your saved items in one place.',
      },

      { type: 'heading', id: 'cart', text: 'Cart' },
      {
        type: 'paragraph',
        text: 'Add a refurbished device to your cart to buy it. Refurbished items appear in their own section of your cart, separate from regular marketplace products.',
      },
      {
        type: 'list',
        items: [
          'Add a specific version (variant) of a product, with the quantity you want',
          'Update the quantity or remove an item at any time',
          'Refurbished items checkout together with, but separately grouped from, your regular cart items',
        ],
      },

      { type: 'heading', id: 'checkout', text: 'Checkout & Payment' },
      {
        type: 'paragraph',
        text: 'When you check out a refurbished purchase, you\'ll provide a shipping address and choose a payment method. Card payments are processed through a secure payment gateway.',
      },
      { type: 'link', label: 'Browse Refurbished Devices', href: '/refurbish' },
    ],
  },

  // ───────────────────────── Orders & Returns ─────────────────────────

  orders: {
    title: 'Orders & Returns',
    description: 'Tracking, cancelling, and returning a refurbished order.',
    content: [
      {
        type: 'lead',
        text: 'Refurbished orders have their own order history and tracking, kept separate from your regular marketplace orders.',
      },

      { type: 'heading', id: 'viewing-orders', text: 'Viewing Your Orders' },
      {
        type: 'paragraph',
        text: 'Your Orders page has a tab for refurbished orders, separate from your regular marketplace orders. Open an order to see its items, shipping details, and status.',
      },

      { type: 'heading', id: 'order-status', text: 'Order Status' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [
          ['Pending', 'Order placed, not yet processed'],
          ['Processing', 'Your order is being prepared'],
          ['Shipping', 'A shipment has been created and is on its way'],
          ['Shipped', 'Your order has been handed off for delivery'],
          ['Delivered', 'You\'ve received your order'],
          ['Cancelled', 'The order was cancelled'],
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'You can cancel a refurbished order yourself before it has been shipped. Once it\'s shipped or delivered, it can no longer be cancelled.',
      },

      { type: 'heading', id: 'returns', text: 'Requesting a Return' },
      {
        type: 'paragraph',
        text: 'If there\'s a problem with a refurbished order, you can request a return once it\'s been delivered — choose the item(s), quantity, and reason for the return.',
      },
      {
        type: 'table',
        headers: ['Return status', 'Meaning'],
        rows: [
          ['Requested', 'Your return request has been submitted'],
          ['Shipped', 'You\'ve sent the item back'],
          ['Approved', 'Your return has been accepted and marked as refunded'],
          ['Rejected', 'Your return request was declined, with a reason shown'],
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'You can only have one active return request per order at a time.',
      },
    ],
  },

  // ───────────────────────── Selling ─────────────────────────

  selling: {
    title: 'Selling Your Device',
    description: 'How to sell your old device to CTI, and how offers work.',
    content: [
      {
        type: 'lead',
        text: 'Besides buying, you can sell your own old device (phone, laptop, or other gadget) directly to CTI. The platform reviews your submission and sends you a price offer — there\'s no instant, automatic price.',
      },

      { type: 'heading', id: 'submitting-your-device', text: 'Submitting Your Device' },
      {
        type: 'steps',
        items: [
          {
            title: '1. Choose your device',
            text: 'Select your device\'s category, then its brand, then its exact model.',
          },
          {
            title: '2. Choose its specifications',
            text: 'Pick the specific version of your device — for example, its storage size — from the options available for that model.',
          },
          {
            title: '3. Answer condition questions',
            text: 'Answer a short set of multiple-choice questions about your device\'s condition (these vary by device category).',
          },
          {
            title: '4. Upload photos and videos',
            text: 'Upload up to 10 photos and up to 3 videos showing your device\'s actual condition — this helps CTI assess it accurately.',
          },
          {
            title: '5. Enter your contact and payout details',
            text: 'Provide your name, email, phone number, address, Turkish ID number, and IBAN (bank account) so CTI can pay you if you accept an offer.',
          },
          {
            title: '6. Submit',
            text: 'You\'ll receive a tracking ID for your submission and a confirmation screen.',
          },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'You don\'t need an account to submit — you can sell as a guest using your email. If you register later with the same email, your submission history will show up under your account.',
      },
      { type: 'link', label: 'Sell Your Device', href: '/sell-devices' },

      { type: 'heading', id: 'tracking-your-request', text: 'Tracking Your Request' },
      {
        type: 'paragraph',
        text: 'You can track the status of everything you\'ve submitted from your account.',
      },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [
          ['Pending', 'Your submission is waiting to be reviewed'],
          ['Reviewed', 'CTI has reviewed your device and sent you an offer'],
          ['Accepted', 'You\'ve accepted the offer'],
          ['Rejected', 'You\'ve declined the offer'],
          ['Completed', 'The sale has been completed'],
        ],
      },
      { type: 'link', label: 'View My Sell Requests', href: '/my-sell-requests' },

      { type: 'heading', id: 'offers', text: 'Receiving & Responding to an Offer' },
      {
        type: 'paragraph',
        text: 'Once CTI reviews your submission, you\'ll receive an offer with a price, an estimated value, and any notes or conditions attached to it. Each offer has an expiry date, so respond promptly.',
      },
      {
        type: 'steps',
        items: [
          { title: 'Review the offer', text: 'Check the offered price, notes, and any conditions.' },
          {
            title: 'Accept or decline',
            text: 'Accept the offer to proceed with the sale, or decline it if it doesn\'t work for you.',
          },
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'You can also start a chat about your offer directly from your sell requests page.',
      },
    ],
  },

  // ───────────────────────── Help & Reference ─────────────────────────

  help: {
    title: 'Help & Reference',
    description: 'Statuses at a glance, plus frequently asked questions.',
    content: [
      { type: 'lead', text: 'A quick reference for every status you\'ll see, plus answers to common questions.' },

      { type: 'heading', id: 'statuses', text: 'Statuses' },
      { type: 'paragraph', text: 'Refurbished orders:' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [['Pending, Processing, Shipping, Shipped, Delivered, Cancelled', 'Progress of a refurbished order']],
      },
      { type: 'paragraph', text: 'Returns:' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [['Requested, Shipped, Approved, Rejected', 'Progress of a return request']],
      },
      { type: 'paragraph', text: 'Sell requests:' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [['Pending, Reviewed, Accepted, Rejected, Completed', 'Progress of your device sell submission']],
      },
      { type: 'paragraph', text: 'Offers:' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [['Pending, Accepted, Rejected', 'Whether you\'ve responded to an offer yet']],
      },

      { type: 'heading', id: 'faq', text: 'Frequently Asked Questions' },
      {
        type: 'faq',
        items: [
          {
            q: 'Do I get an instant price when I submit my device?',
            a: 'No — CTI reviews the photos, videos, and details you submit, then sends you a customized offer. There\'s no automatic instant quote.',
          },
          {
            q: 'Do I need an account to sell my device?',
            a: 'No, you can submit as a guest. If you later register using the same email, your submission history will appear under your account.',
          },
          {
            q: 'How many photos and videos can I upload when selling a device?',
            a: 'Up to 10 photos and up to 3 videos.',
          },
          {
            q: 'What information do I need to provide to sell a device?',
            a: 'Your name, email, phone number, address, Turkish ID number, and IBAN, along with details and photos of the device itself.',
          },
          {
            q: 'Can I cancel a refurbished order?',
            a: 'Yes, as long as it hasn\'t been shipped yet. Once it\'s shipped or delivered, it can no longer be cancelled.',
          },
          {
            q: 'What does "condition" mean on a refurbished listing?',
            a: 'It describes the physical/functional state of that specific device, set individually by CTI for each listing — check the details on the product page rather than assuming a standard set of grades.',
          },
          {
            q: 'Can I sell refurbished devices as a seller on CTI?',
            a: 'No — refurbished listings are managed directly by CTI. If you want to sell products as a seller, see the Seller documentation instead.',
          },
        ],
      },
    ],
  },
};
