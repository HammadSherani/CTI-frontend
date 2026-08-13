// Content for the Repairman documentation module, keyed by slug.
// Written for CTI customers and repairmen (non-technical). Every fact
// here reflects the actual, currently-live repair-service module —
// nothing is invented. Covers both sides of the marketplace: customers
// hiring a repairman, and repairmen finding/completing jobs.
export const repairmanPages = {
  // ───────────────────────── Repairman Basics ─────────────────────────

  repairman: {
    title: 'Repairman Basics',
    description: 'What the repair-service marketplace is, and how to become a repairman.',
    content: [
      {
        type: 'lead',
        text: 'CTI\'s repair-service marketplace connects customers who need something repaired with repairmen who can do it. Repairmen get their own account to browse jobs, submit offers, and manage the repairs they take on.',
      },

      { type: 'heading', id: 'how-it-works', text: 'How It Works' },
      {
        type: 'paragraph',
        text: 'There are two ways a customer and a repairman connect: the customer posts a repair job that repairmen bid on with offers, or the customer browses repairman profiles directly and requests a price quotation over chat. Both ways end with a paid booking that the repairman works through to completion.',
      },

      { type: 'heading', id: 'becoming-a-repairman', text: 'Becoming a Repairman' },
      {
        type: 'steps',
        items: [
          {
            title: '1. Register',
            text: 'Sign up and choose Repair Specialist as your account type, then verify your email with the OTP code sent to you.',
          },
          {
            title: '2. Complete Your Profile',
            text: 'Fill in your personal details, shop details, years of experience, specializations, working days and hours, and upload the required documents: profile photo, national ID/passport, shop photo, and a utility bill or shop proof.',
          },
          {
            title: '3. Get Approved',
            text: 'Your account stays pending until CTI reviews and approves your profile. Once approved, you can browse and bid on jobs.',
          },
        ],
      },
      {
        type: 'table',
        headers: ['Status', 'What it means'],
        rows: [
          ['Pending / Under Review', 'Your profile has been submitted and is being reviewed.'],
          ['Approved', 'You\'re verified — you can browse and bid on jobs.'],
          ['Revision Required', 'CTI needs you to update something specific. A reason is shown.'],
          ['Rejected', 'Your profile was not approved. A reason is shown.'],
        ],
      },
      { type: 'link', label: 'Register as a Repairman', href: '/auth/register' },

      { type: 'heading', id: 'requirements', text: 'Requirements' },
      {
        type: 'list',
        items: [
          'Your full name, national ID/citizen number, and date of birth',
          'A mobile number',
          'Your tax number',
          'Your shop name and years of experience',
          'Your specializations',
          'Your working days and working hours',
          'A profile photo, national ID/passport scan, shop photo, and a utility bill or shop proof',
        ],
      },
    ],
  },

  // ───────────────────────── Hiring a Repairman ─────────────────────────

  hiring: {
    title: 'Hiring a Repairman',
    description: 'How to get something repaired, from posting a job to confirming it\'s done.',
    content: [
      {
        type: 'lead',
        text: 'If you need something repaired — an AC, an appliance, a phone, or anything else — there are two ways to get connected with a repairman.',
      },
      {
        type: 'list',
        items: [
          '**Post a Repair Job** — describe what needs repairing, and repairmen submit offers with their price and terms; you review and choose one.',
          '**Browse Repairmen Directly** — browse repairman profiles, start a chat with one you like, and ask for a quotation. The repairman sends you a price quote directly in the chat.',
        ],
      },

      { type: 'heading', id: 'posting-a-job', text: 'Posting a Repair Job' },
      {
        type: 'steps',
        items: [
          {
            title: '1. Describe the problem',
            text: 'Give your job a title and description, and select the service(s) you need.',
          },
          {
            title: '2. Add device details (if relevant)',
            text: 'Brand, model, color, purchase year, and warranty status.',
          },
          {
            title: '3. Set your budget and urgency',
            text: 'A budget range, and how urgent the repair is (low, medium, high, or urgent).',
          },
          {
            title: '4. Choose how you want it done',
            text: 'Pickup, drop-off, or both, plus your preferred date/time and location.',
          },
          {
            title: '5. Add photos (optional) and submit',
            text: 'Photos of the issue help repairmen quote more accurately.',
          },
        ],
      },
      { type: 'link', label: 'Post a Repair Job', href: '/my-account/add-job' },

      { type: 'heading', id: 'receiving-offers', text: 'Receiving & Reviewing Offers' },
      {
        type: 'paragraph',
        text: 'Once your job is posted, nearby repairmen are notified and can submit offers with their price, estimated repair time, warranty terms, and any parts required. Compare the offers you receive before choosing one.',
      },

      { type: 'heading', id: 'accepting-an-offer', text: 'Paying & Accepting an Offer' },
      {
        type: 'callout',
        tone: 'warning',
        text: 'Before you can accept an offer, you need to complete payment for it.',
      },
      {
        type: 'paragraph',
        text: 'After payment is completed, accept the offer. This creates your booking, moves your job to booked status, and automatically declines the other offers on that job.',
      },

      { type: 'heading', id: 'tracking-the-repair', text: 'Tracking the Repair' },
      {
        type: 'paragraph',
        text: 'Once booked, the repairman starts the job and updates its status as work progresses (e.g. parts needed, quality check, completed, delivered). You\'re notified at every update.',
      },

      { type: 'heading', id: 'confirming-completion', text: 'Confirming Completion' },
      {
        type: 'paragraph',
        text: 'Once the repair is completed and delivered, confirm/close the job from your account. This is what releases your payment to the repairman.',
      },
    ],
  },

  // ───────────────────────── Finding & Completing Jobs ─────────────────────────

  jobs: {
    title: 'Finding & Completing Jobs',
    description: 'How repairmen find jobs, submit offers, and complete repairs.',
    content: [
      {
        type: 'lead',
        text: 'Once your repairman profile is approved, here\'s how you find work and get paid for it.',
      },

      { type: 'heading', id: 'browsing-the-job-board', text: 'Browsing the Job Board' },
      {
        type: 'paragraph',
        text: 'Browse open repair jobs, filterable by city/state and search. Each job shows the customer\'s requirements, budget, and location.',
      },
      { type: 'link', label: 'Open the Job Board', href: '/repair-man/job-board' },

      { type: 'heading', id: 'submitting-an-offer', text: 'Submitting a Proposal (Offer)' },
      {
        type: 'paragraph',
        text: 'Submit an offer on a job with your price, estimated repair time, warranty terms, services included, and any parts required.',
      },
      {
        type: 'callout',
        tone: 'tip',
        text: 'Each job only accepts a limited number of offers, so respond promptly to jobs you\'re interested in.',
      },

      { type: 'heading', id: 'getting-selected', text: 'Getting Selected' },
      {
        type: 'paragraph',
        text: 'If the customer accepts your offer (after paying for it), it becomes an accepted offer and a booking is created. Any other offers on that same job are automatically declined.',
      },

      { type: 'heading', id: 'completing-the-job', text: 'Completing the Job' },
      {
        type: 'paragraph',
        text: 'Start the job once it\'s booked, then update its status as you progress. The customer is notified at every update. Once the customer confirms/closes the job, your earning for it is released to your wallet.',
      },

      { type: 'heading', id: 'service-catalog', text: 'Your Service Catalog' },
      {
        type: 'paragraph',
        text: 'Separate from bidding on job postings, you can list your own services in your Service Catalog. This lets customers browsing your profile directly see exactly what you offer, at what price, and for which devices.',
      },
      {
        type: 'list',
        items: [
          'Service title and description of what it covers',
          'Device brand (e.g. Apple, Samsung) and model (e.g. iPhone 13, Galaxy S21)',
          'Service type: home (you go to the customer), shop (customer comes to you), or pickup',
          'Pricing: base price, plus optional parts estimate and service charges',
          'The city where the service is available',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        text: 'After you submit a service to your catalog, it starts as pending. CTI reviews it, and only approved services are visible to customers browsing your profile.',
      },
      { type: 'link', label: 'View My Service Catalog', href: '/repair-man/service-catalog' },
    ],
  },

  // ───────────────────────── Earnings & Payments ─────────────────────────

  earnings: {
    title: 'Earnings & Payments',
    description: 'Commission, your wallet, and requesting a withdrawal.',
    content: [
      {
        type: 'lead',
        text: 'Here\'s how you get paid for the repairs you complete.',
      },

      { type: 'heading', id: 'commission', text: 'Platform Commission' },
      {
        type: 'paragraph',
        text: 'CTI takes a commission (5%) on completed repair jobs before releasing the rest to your wallet.',
      },

      { type: 'heading', id: 'how-earnings-work', text: 'How Earnings Work' },
      {
        type: 'steps',
        items: [
          { title: 'Job completed & confirmed', text: 'Once the customer confirms/closes the job, your earning for it is created.' },
          { title: 'Released to your wallet', text: 'Your earning (minus commission) is released to your wallet.' },
          { title: 'Request a withdrawal', text: 'Withdraw your available balance to your registered bank account.' },
        ],
      },

      { type: 'heading', id: 'withdrawals', text: 'Withdrawals' },
      {
        type: 'paragraph',
        text: 'Withdrawals are paid out to the bank details on your profile.',
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'You need your payment/bank details completed on your profile before you can request a withdrawal.',
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
      { type: 'paragraph', text: 'Repair jobs:' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [
          ['Open', 'Posted and accepting offers'],
          ['Offers Received', 'At least one offer has been submitted'],
          ['Booked', 'An offer has been accepted and paid for'],
          ['In Progress', 'The repairman has started the work'],
          ['Completed', 'The repair is done'],
          ['Cancelled', 'The job was cancelled'],
        ],
      },
      { type: 'paragraph', text: 'Offers:' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [
          ['Pending', 'Submitted, awaiting the customer\'s decision'],
          ['Accepted', 'The customer chose this offer'],
          ['Rejected', 'The customer chose a different offer, or declined it'],
          ['Withdrawn', 'The repairman withdrew the offer'],
        ],
      },
      { type: 'paragraph', text: 'Booking progress (after an offer is accepted):' },
      {
        type: 'table',
        headers: ['Status', 'Meaning'],
        rows: [
          ['Confirmed / Scheduled', 'The booking is set up and scheduled'],
          ['In Progress', 'The repairman is working on it'],
          ['Parts Needed', 'The repairman needs a part before continuing'],
          ['Quality Check', 'The repair is being reviewed before handover'],
          ['Completed / Delivered', 'The repair is finished and handed back'],
          ['Closed', 'The customer confirmed completion and payment was released'],
        ],
      },

      { type: 'heading', id: 'faq', text: 'Frequently Asked Questions' },
      {
        type: 'faq',
        items: [
          {
            q: 'Do I need to pay before my offer is accepted?',
            a: 'As the customer, yes — payment for the chosen offer must be completed before you can accept it.',
          },
          {
            q: 'What happens to the other offers once I accept one?',
            a: 'They\'re automatically declined.',
          },
          {
            q: 'How does a repairman get paid?',
            a: 'Once the customer confirms/closes a completed job, the repairman\'s earning (minus CTI\'s commission) is released to their wallet, which they can then withdraw to their bank account.',
          },
          {
            q: 'How much commission does CTI take on repair jobs?',
            a: 'A 5% commission on completed jobs.',
          },
          {
            q: 'Can a repairman post their own repair jobs?',
            a: 'No — posting a repair job is a customer action. Repairmen find work by browsing the job board and submitting offers, or by being contacted directly through their profile.',
          },
          {
            q: 'What\'s the difference between the job board and a repairman\'s service catalog?',
            a: 'The job board is where customers post jobs for any repairman to bid on. A service catalog is a repairman\'s own list of services shown on their profile, for customers who want to hire them directly.',
          },
          {
            q: 'How can I become a repairman?',
            a: 'Register and choose Repair Specialist as your account type, then complete your profile — your account stays pending until CTI approves it.',
          },
        ],
      },
    ],
  },
};
