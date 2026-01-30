"use client";

import React from "react";

function PrivacyPolicy() {
  const sections = [
    {
      title: "Who are we?",
      content: (
        <p>
          CTI (collectively referred to as “we”, “our” or “us”) is committed to
          safeguarding the security of your personal data and respecting the
          privacy of users (“you” or “your”) accessing our websites and related
          applications (collectively, the “Platform”).
        </p>
      ),
    },
    {
      title: "What is this privacy notice for?",
      content: (
        <>
          <p>
            We may handle your personal data in connection with your use of the
            Platform. This privacy notice (together with our Terms and
            Conditions) sets out our collection and sharing practices, the uses
            to which personal data is put, the ways in which we protect it in
            accordance with the data protection laws and your privacy rights.
          </p>
          <p className="mt-2 font-medium">This Statement applies when you:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Visit our website or mobile platforms.</li>
            <li>Use our internet-based offerings and services.</li>
            <li>Communicate with us via email, phone, or social media.</li>
          </ul>
        </>
      ),
    },
    {
      title: "Data we collect",
      content: (
        <>
          <p>
            We collect information directly from you (via forms or services you
            access) and indirectly via your use of the services.
          </p>
          <p className="mt-2 font-medium">Directly collected information:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Name, Contact details, Email ID.</li>
            <li>IMEI and Device details for repair services.</li>
            <li>Communications with our personnel.</li>
            <li>Feedback and survey responses.</li>
          </ul>
          <p className="mt-4 font-medium">Automatically collected information:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>IP addresses, Device details, and browser types.</li>
            <li>Usage patterns and domain names.</li>
          </ul>
        </>
      ),
    },
    {
      title: "Use of Personal Data",
      content: (
        <>
          <p>We use your Personal Data for the following purposes:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>
              <strong>Administering Services:</strong> To manage, promote, and
              improve our Platform.
            </li>
            <li>
              <strong>User Registration:</strong> To administer your account and
              verify your identity.
            </li>
            <li>
              <strong>Support Requests:</strong> To fulfill your queries and
              communicate with you.
            </li>
            <li>
              <strong>Security:</strong> To protect the safety and security of
              our users and systems.
            </li>
            <li>
              <strong>Marketing:</strong> To send updates and promotional
              material (with your consent).
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "Disclosure of your Information",
      content: (
        <p>
          We may share Personal Data with contracted service providers (hosting,
          payment processing, analytics) only as necessary to provide services.
          We may also share data in the event of a merger or acquisition, or
          when required by law to respond to legal requests.
        </p>
      ),
    },
    {
      title: "Your Rights",
      content: (
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Right to access your personal data held by us.</li>
          <li>Right to rectify inaccurate information.</li>
          <li>Right to erase data (under certain conditions).</li>
          <li>Right to restrict or object to processing.</li>
          <li>Right to withdraw consent at any time.</li>
        </ul>
      ),
    },
    {
      title: "Security",
      content: (
        <p>
          We use industry-standard encryption (SSL) and physical/electronic
          safeguards to protect your data. While we work dedicatedly to protect
          your information, no system is 100% impenetrable.
        </p>
      ),
    },
    {
      title: "Cookies & Tracking Technologies",
      content: (
        <>
          <p>
            We use cookies, web beacons, local storage and similar technologies
            to enhance your experience, remember preferences, analyze traffic
            and serve personalized content. Cookies help us deliver features
            like keeping you signed in, storing language preferences and
            measuring campaign performance.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Essential cookies: required for the site to operate correctly.</li>
            <li>Analytics cookies: help us understand usage and improve the site.</li>
            <li>Marketing cookies: used to deliver relevant ads and offers.</li>
          </ul>
          <p className="mt-2">
            You can manage or disable cookies from your browser settings, but
            disabling some cookies may reduce functionality.
          </p>
        </>
      ),
    },
    {
      title: "Data Retention",
      content: (
        <>
          <p>
            We retain personal data only as long as necessary to provide
            services, comply with legal obligations, resolve disputes, and
            enforce our agreements. Retention periods vary by data type and
            processing purpose.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Account data: retained while your account is active and for a period thereafter to comply with legal obligations.</li>
            <li>Support and transactional records: retained for business and tax reasons (commonly 3–7 years depending on jurisdiction).</li>
            <li>Marketing preferences: retained until you opt out or withdraw consent.</li>
          </ul>
        </>
      ),
    },
    {
      title: "Children and Minors",
      content: (
        <>
          <p>
            Our Platform is intended for adult users and business customers.
            We do not knowingly collect personal data from children under the
            age of 13 (or age of majority in your jurisdiction). If you
            believe a child has provided us with personal data, contact us and
            we will take steps to remove it.
          </p>
        </>
      ),
    },
    {
      title: "Changes to this Policy",
      content: (
        <>
          <p>
            We may update this Privacy Policy to reflect changes to our
            practices, legal requirements, or business operations. When we make
            material changes, we will provide notice on the Platform and
            update the "Last Updated" date at the top of this page.
          </p>
          <p className="mt-2">
            We encourage you to review this policy periodically to stay
            informed about our privacy practices.
          </p>
        </>
      ),
    },
    {
      title: "Warranty & Repair — Important Notes",
      content: (
        <>
          <h3 className="text-lg font-semibold">How can I claim my warranty?</h3>
          <p>
            To claim your warranty, contact our support team via email or visit
            an authorized service centre. Provide your order ID or proof of
            purchase and the device for inspection. Our technicians will
            evaluate the issue and advise whether the repair or replacement is
            covered under warranty.
          </p>

          <p className="mt-3 font-medium">To claim your warranty, you need to:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Original proof of purchase or order ID.</li>
            <li>Device serial number / IMEI and model details.</li>
            <li>Clear photos or a short description of the issue.</li>
            <li>Device available for physical inspection (remove cases/accessories).</li>
            <li>Claim submitted within the applicable warranty period.</li>
          </ul>

          <p className="mt-3 font-medium">The warranty is not applicable under the following scenarios :</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Physical damage (cracks, dents) caused by drops or impacts.</li>
            <li>Water or liquid ingress and corrosion damage.</li>
            <li>Unauthorized repairs, modifications or third-party parts.</li>
            <li>Tampered, removed or altered serial/warranty labels and seals.</li>
            <li>Cosmetic damage that does not affect device functionality.</li>
            <li>Software issues caused by third‑party apps, rooting or OS changes.</li>
            <li>Consumable parts (e.g., batteries) beyond their expected lifespan unless explicitly covered.</li>
          </ul>

          <p className="mt-3 font-medium">Our warranty also does not cover the outcome of a repair if certain pre-repair conditions exist, including:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Pre-existing internal corrosion or residue from prior liquid exposure.</li>
            <li>Evidence that previous third‑party repairs have altered the fault.</li>
            <li>Missing components, connectors or screws prior to arriving for repair.</li>
            <li>Severe deformation, burns or other damage that prevents a safe repair.</li>
            <li>Use of incompatible or non‑standard replacement parts.</li>
          </ul>

          <p className="mt-3 font-medium">Please note:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Always back up your data before submitting a device for repair; we are not responsible for data loss.</li>
            <li>Warranty remedies may include repair, replacement or refund at our discretion and in accordance with your purchase terms.</li>
            <li>Warranty periods and specific exclusions are defined in your purchase documentation.</li>
            <li>If a warranty claim is declined, we will provide the reason and available next steps.</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="prose prose-blue max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
          Privacy Policy
        </h1>
        
        <p className="text-gray-600 mb-8 italic">
          Last Updated: January 2026
        </p>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm">
                  {index + 1}
                </span>
                {section.title}
              </h2>
              <div className="text-gray-600 leading-relaxed ml-10">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 p-6 bg-primary-50 rounded-lg border border-primary-100">
          <h3 className="text-lg font-bold text-primary-900 mb-2">
            Questions?
          </h3>
          <p className="text-primary-800">
            If you have any questions about this Privacy Policy, please contact
            us at <a href="mailto:privacy@cti.com" className="font-semibold underline">privacy@cti.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
