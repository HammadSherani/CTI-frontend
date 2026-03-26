"use client";

import React from "react";
import { Icon } from '@iconify/react';

function TermsModal({ isOpen, onClose }) {
  const sections = [
    {
      title: "Agreement to Terms",
      content: (
        <p>
          By accessing or using the CTI platform, you agree to be bound by these
          Terms and Conditions. If you do not agree with any part of these
          terms, you must not use our services.
        </p>
      ),
    },
    {
      title: "CTI is a marketplace venue",
      content: (
        <>
          <p>
            CTI operates as a venue that connects customers with service
            providers and sellers. We do not become a party to transactions
            between buyers and sellers and are not responsible for the acts or
            omissions of third-party service providers unless otherwise stated.
          </p>
          <p className="mt-2">
            Service providers and sellers using our platform are independent
            businesses and are responsible for their own listings, pricing,
            warranties, and fulfilment.
          </p>
        </>
      ),
    },
    {
      title: "Permitted Use and Compliance with Laws",
      content: (
        <>
          <p>
            You may use CTI only for lawful purposes and in compliance with all
            applicable laws, rules, and regulations. You agree not to use the
            platform to post, transmit, or store material that is illegal,
            harmful, defamatory, infringing, obscene, or otherwise
            objectionable.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Comply with all export, import and sanctions laws.</li>
            <li>Not to impersonate another person or misrepresent your affiliation with any person or entity.</li>
            <li>Not to engage in fraudulent activity or attempts to manipulate ratings, reviews or pricing.</li>
          </ul>
        </>
      ),
    },
    {
      title: "CTI Services and Third Party Services and Sites",
      content: (
        <>
          <p>
            CTI may provide services directly and may also link to or integrate
            with services offered by third parties. Third-party services and
            sites are governed by their own terms and privacy policies.
          </p>
          <p className="mt-2">
            We are not responsible for the practices, content, or security of
            third-party sites and do not endorse or guarantee their products.
          </p>
        </>
      ),
    },
    {
      title: "Copyright and trademarks",
      content: (
        <>
          <p>
            All intellectual property rights in the platform, including
            copyrights and trademarks, are either owned by CTI or used under
            licence. You may not copy, reproduce, distribute, or create
            derivative works from our content without prior written consent.
          </p>
          <p className="mt-2">
            If you believe your intellectual property rights have been
            infringed, please contact our Grievance Officer with the relevant
            information so we can investigate promptly.
          </p>
        </>
      ),
    },
    {
      title: "Privacy and Passwords",
      content: (
        <>
          <p>
            Our <a href="/privacy-policy" className="font-semibold underline">Privacy Policy</a> explains how we collect and use personal data.
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Notify us immediately of any unauthorized use of your account.</li>
            <li>Choose strong passwords and keep them secure.</li>
            <li>We may suspend or disable accounts to protect security.</li>
          </ul>
        </>
      ),
    },
    {
      title: "Membership",
      content: (
        <>
          <p>
            To access certain features of the platform you may need to create
            an account. Membership eligibility, verification and account
            termination policies are at CTI’s discretion and governed by these
            Terms.
          </p>
          <p className="mt-2">
            You agree to provide accurate information and update your account
            as needed. CTI reserves the right to refuse service, remove
            content, or cancel accounts that violate our policies.
          </p>
        </>
      ),
    },
    {
      title: "Inactive Accounts",
      content: (
        <>
          <p>
            Accounts that remain inactive for an extended period may be flagged
            and subject to deactivation. We will attempt to notify you at the
            registered email before any deactivation, but we are not required
            to except where local law provides otherwise.
          </p>
          <p className="mt-2">
            You may reactivate an inactive account by following the steps in
            our account recovery process, subject to verification procedures.
          </p>
        </>
      ),
    },
    {
      title: "Warranty Exclusions and Limitations of Liability",
      content: (
        <>
          <p>
            Except where explicitly stated, CTI and third-party service
            providers make no warranties regarding products or services sold
            through the platform. Warranties provided by individual sellers or
            manufacturers remain their responsibility.
          </p>
          <p className="mt-2">
            Our liability to you for any claim arising out of or in connection
            with these Terms will be limited to the amount you paid for the
            specific service giving rise to the claim, except where liability
            cannot be limited by law.
          </p>
        </>
      ),
    },
    {
      title: "Applicable Law, Jurisdiction, Compliance",
      content: (
        <>
          <p>
            These Terms are governed by the laws of the jurisdiction where CTI
            operates, and you agree to submit to the exclusive jurisdiction of
            the courts in that jurisdiction for any disputes, unless local law
            provides otherwise.
          </p>
          <p className="mt-2">
            You are responsible for complying with local laws relating to the
            use of the platform and any purchases you make via the platform.
          </p>
        </>
      ),
    },
    {
      title: "Miscellaneous Provisions",
      content: (
        <>
          <p>
            If any provision of these Terms is found to be invalid or
            unenforceable, the remaining provisions will continue in full
            force. We may assign our rights under these Terms to a third
            party, and any waiver of a provision will be effective only if in
            writing.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Severability, assignment, and entire agreement clauses.</li>
            <li>CTI may update these Terms; material changes will be notified.</li>
          </ul>
        </>
      ),
    },
    {
      title: "Grievance Officer",
      content: (
        <>
          <p>
            For any complaints or concerns regarding these Terms or our
            practices, please contact our Grievance Officer:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Name: Grievance Officer</li>
            <li>Email: <span className="font-semibold">grievance@cti.com</span></li>
            <li>Response Time: We aim to acknowledge and respond within 7 working days.</li>
          </ul>
        </>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <Icon icon="mdi:close" className="text-2xl text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-6 md:p-8">
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-8 italic">
              Last Updated: March 2026
            </p>

            <div className="space-y-10">
              {sections.map((section, index) => (
                <section key={index}>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold">
                      {index + 1}
                    </span>
                    {section.title}
                  </h3>
                  <div className="text-gray-600 leading-relaxed ml-11">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 p-6 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-orange-800 text-sm text-center">
                These terms are governed by the laws of your jurisdiction. For any legal inquiries, contact{' '}
                <span className="font-bold">legal@cti.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;