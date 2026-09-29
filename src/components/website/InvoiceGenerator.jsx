'use client';
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Icon } from '@iconify/react';
import moment from 'moment';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/helper/currencyFormatter';

export default function InvoiceGenerator({ order, className }) {
  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Load CTI Logo
      const logoImg = new Image();
      logoImg.src = '/assets/logo.png';
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });
      
      // Add Logo (x, y, width, height)
      doc.addImage(logoImg, 'PNG', 14, 12, 35, 15);

      const orderId = order.orderId || order.orderNo || 'N/A';
      const orderDate = order.createdAt ? moment(order.createdAt).format('MMMM Do YYYY, h:mm a') : 'N/A';
      const paymentMethod = order.paymentMethod?.toUpperCase() || 'N/A';
      const paymentStatus = order.paymentStatus || 'N/A';
      
      // Header Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(30, 30, 30);
      doc.text("INVOICE", 196, 22, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Order ID: ${orderId}`, 196, 30, { align: 'right' });
      doc.text(`Date: ${orderDate}`, 196, 36, { align: 'right' });

      // Divider
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(14, 45, 196, 45);

      // ------------------------------------------
      // Seller Information (Top Left)
      // ------------------------------------------
      const firstSeller = order.items?.[0]?.sellerId || {};
      const sellerName = firstSeller.businessName || firstSeller.storeName || firstSeller.name || firstSeller.firstName || 'CTI Store';
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150); // Muted label
      doc.text("FROM:", 14, 55);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text(sellerName, 14, 62);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      if (firstSeller.email) doc.text(firstSeller.email, 14, 68);
      if (firstSeller.phone) doc.text(firstSeller.phone, 14, 74);

      // ------------------------------------------
      // Customer Information (Right Side)
      // ------------------------------------------
      const addr = order.shippingAddress || {};
      const fullAddress = [addr.addressLine, addr.city, addr.country].filter(Boolean).join(', ');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("BILL TO:", 120, 55);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.text(addr.fullName || 'Customer', 120, 62);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(addr.phone || addr.phoneNumber || 'N/A', 120, 68);
      
      const addressLines = doc.splitTextToSize(fullAddress || 'N/A', 75);
      doc.text(addressLines, 120, 74);

      // Items Table
      const tableColumn = ["Item Description", "Qty", "Unit Price", "Total"];
      const tableRows = [];

      let subtotal = 0;
      order.items?.forEach(item => {
        const title = item.productId?.title || item.productId?.name || 'Item';
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const total = price * qty;
        subtotal += total;

        tableRows.push([
          title,
          qty.toString(),
          formatCurrency(price),
          formatCurrency(total)
        ]);
      });

      autoTable(doc, {
        startY: 95,
        head: [tableColumn],
        body: tableRows,
        theme: 'plain',
        headStyles: { 
          fillColor: [250, 250, 250], 
          textColor: [100, 100, 100], 
          fontStyle: 'bold',
          lineWidth: 0.1,
          lineColor: [220, 220, 220]
        },
        bodyStyles: {
          textColor: [50, 50, 50],
          lineWidth: 0.1,
          lineColor: [230, 230, 230]
        },
        styles: { fontSize: 9.5, cellPadding: 6 },
        margin: { top: 95 }
      });

      const finalY = doc.lastAutoTable.finalY || 95;

      // Totals Box (Right aligned)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Subtotal`, 150, finalY + 15);
      doc.setTextColor(30, 30, 30);
      doc.text(`${formatCurrency(subtotal)}`, 196, finalY + 15, { align: 'right' });
      
      doc.setTextColor(100, 100, 100);
      doc.text(`Shipping`, 150, finalY + 22);
      doc.setTextColor(30, 30, 30);
      doc.text(`${formatCurrency(order.shippingCost || 0)}`, 196, finalY + 22, { align: 'right' });
      
      // Total divider
      doc.setDrawColor(220, 220, 220);
      doc.line(145, finalY + 28, 196, finalY + 28);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 105, 0); // Primary color pop for total
      const totalAmount = order.totalAmount || (subtotal + (order.shippingCost || 0));
      doc.text(`Total`, 150, finalY + 38);
      doc.text(`${formatCurrency(totalAmount)}`, 196, finalY + 38, { align: 'right' });

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for shopping with CTI! We appreciate your business.", 105, finalY + 45, { align: 'center' });

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
