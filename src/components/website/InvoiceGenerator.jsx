'use client';
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Icon } from '@iconify/react';
import moment from 'moment';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/helper/currencyFormatter';

export default function InvoiceGenerator({ order, className }) {
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      const orderId = order.orderId || order.orderNo || 'N/A';
      const orderDate = order.createdAt ? moment(order.createdAt).format('MMMM Do YYYY, h:mm a') : 'N/A';
      const paymentMethod = order.paymentMethod?.toUpperCase() || 'N/A';
      const paymentStatus = order.paymentStatus || 'N/A';
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Primary color
      doc.text("INVOICE", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(`Order ID: ${orderId}`, 14, 32);
      doc.text(`Date: ${orderDate}`, 14, 38);
      doc.text(`Payment Method: ${paymentMethod}`, 14, 44);
      doc.text(`Payment Status: ${paymentStatus}`, 14, 50);

      // Seller Details (if multiple sellers, join them)
      const sellerNames = [...new Set(order.items?.map(i => i.sellerId?.businessName || i.sellerId?.name || 'Unknown Seller'))].filter(Boolean).join(', ');
      if (sellerNames) {
        doc.text(`Seller(s): ${sellerNames}`, 14, 56);
      }
      
      // Billed / Shipped To
      const addr = order.shippingAddress || {};
      const fullAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}, ${addr.country || ''}`.replace(/^, | , | $/g, '').trim();
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Billed / Shipped To:", 120, 32);
      
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(`Name: ${addr.fullName || 'N/A'}`, 120, 38);
      doc.text(`Phone: ${addr.phoneNumber || 'N/A'}`, 120, 44);
      doc.text(`Email: ${addr.emailAddress || 'N/A'}`, 120, 50);
      
      const addressLines = doc.splitTextToSize(`Address: ${fullAddress}`, 80);
      doc.text(addressLines, 120, 56);

      // Items Table
      const tableColumn = ["Item", "Seller", "Qty", "Price", "Total"];
      const tableRows = [];

      let subtotal = 0;
      order.items?.forEach(item => {
        const title = item.productId?.title || item.productId?.name || 'Item';
        const seller = item.sellerId?.businessName || item.sellerId?.name || 'Store';
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const total = price * qty;
        subtotal += total;

        tableRows.push([
          title,
          seller,
          qty.toString(),
          formatCurrency(price),
          formatCurrency(total)
        ]);
      });

      doc.autoTable({
        startY: 70,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9 },
        margin: { top: 70 }
      });

      const finalY = doc.lastAutoTable.finalY || 70;

      // Totals
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 140, finalY + 10);
      doc.text(`Shipping Cost: ${formatCurrency(order.shippingCost || 0)}`, 140, finalY + 16);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const totalAmount = order.totalAmount || (subtotal + (order.shippingCost || 0));
      doc.text(`Total Amount: ${formatCurrency(totalAmount)}`, 140, finalY + 26);

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for shopping with CTI!", 14, finalY + 45);

      doc.save(`Invoice_${orderId}.pdf`);
      toast.success("Invoice generated successfully!");
    } catch (error) {
      console.error('Invoice generation error:', error);
      toast.error("Failed to generate invoice");
    }
  };

  return (
    <button
      onClick={generatePDF}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors border border-primary-200 ${className || ''}`}
    >
      <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4" />
      Download Invoice
    </button>
  );
}
