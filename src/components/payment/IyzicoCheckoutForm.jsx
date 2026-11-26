'use client';
import { useEffect, useRef } from 'react';

/**
 * Renders the Iyzico hosted Checkout Form inside the page.
 * Card details and 3D Secure are entered in Iyzico's form, so card data never reaches our servers.
 *
 * `content` is the `checkoutFormContent` returned by the backend: an inline <script> that loads
 * Iyzico's bundle, which then renders into #iyzipay-checkout-form. React does not execute scripts
 * from innerHTML, so they are re-created here.
 *
 * The scripts must run exactly ONCE per form: React (StrictMode, dev) runs effects twice, and a
 * second run used to clear the container while Iyzico's bundle was still loading, leaving the
 * form stuck on its loader. So: inject once per `content`, and never tear the form down in the
 * effect cleanup — leftovers from an earlier attempt are removed before the next form is injected.
 */
export default function IyzicoCheckoutForm({ content, layout = 'responsive' }) {
    const injectedFor = useRef(null);

    useEffect(() => {
        if (!content || injectedFor.current === content) return;
        injectedFor.current = content;

        // Remove what a previous attempt left behind (inline loader + Iyzico bundle)
        document
            .querySelectorAll('script[data-iyzico-checkout], script[src*="iyzipay.com"]')
            .forEach((s) => s.remove());
        // Iyzico's loader skips itself when `iyziInit` already exists
        try {
            window.iyziInit = undefined;
            window.iyziUcsInit = undefined;
        } catch {
            // ignore
        }

        const holder = document.createElement('div');
        holder.innerHTML = content;
        holder.querySelectorAll('script').forEach((original) => {
            const script = document.createElement('script');
            Array.from(original.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
            script.setAttribute('data-iyzico-checkout', 'true');
            script.text = original.text;
            document.body.appendChild(script);
        });
    }, [content]);

    return (
        <div>
            <div id="iyzipay-checkout-form" className={`${layout} notranslate`} translate="no" />
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                Payments are processed securely by iyzico with 3D Secure. Your card details are never stored on our servers.
            </p>
        </div>
    );
}
