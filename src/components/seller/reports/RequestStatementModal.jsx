import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function RequestStatementModal({ onClose, transactions, summary, currentFilter, customDate }) {
    const [statementType, setStatementType] = useState('full');
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            // Using jsPDF to generate the statement
            const doc = new jsPDF();
            
            // Branding - Primary color is usually defined in Tailwind, let's use a standard blue/indigo
            const primaryColor = [79, 70, 229]; // RGB for indigo-600 approx
            
            // Header
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text('Account Statement', 14, 25);
            
            // Date Range
            let dateStr = 'Last 30 Days';
            if (currentFilter === 'today') dateStr = 'Today';
            if (currentFilter === 'yesterday') dateStr = 'Yesterday';
            if (currentFilter === '7days') dateStr = 'Last 7 Days';
            if (currentFilter === '14days') dateStr = 'Last 14 Days';
            if (currentFilter === 'custom') dateStr = `${customDate.start || ''} to ${customDate.end || ''}`;
            
            doc.setFontSize(10);
            doc.text(`Period: ${dateStr}`, 14, 33);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 33);

            // Summary Section
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(14);
            doc.text('Financial Summary', 14, 55);
            
            doc.autoTable({
                startY: 60,
                head: [['Metric', 'Amount']],
                body: [
                    ['Total Revenue', `$${summary.totalRevenue.toFixed(2)}`],
                    ['Total Earned (Available)', `$${summary.totalEarned.toFixed(2)}`],
                    ['Total Pending (Hold)', `$${summary.totalPending.toFixed(2)}`],
                    ['Total Orders', summary.totalOrders.toString()]
                ],
                theme: 'grid',
                headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
                margin: { left: 14, right: 14 }
            });

            // Transactions Section
            const startY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.text('Transaction Details', 14, startY);

            // Filter transactions based on statement type
            let filteredTransactions = transactions;
            if (statementType === 'earnings') {
                filteredTransactions = transactions.filter(t => t.availableEarnings > 0);
            }

            const tableBody = filteredTransactions.map(t => [
                new Date(t.orderDate).toLocaleDateString(),
                t.orderNo,
                t.productNamesStr?.substring(0, 30) + (t.productNamesStr?.length > 30 ? '...' : ''),
                `$${t.orderAmount.toFixed(2)}`,
                `$${t.holdAmount.toFixed(2)}`,
                `$${t.availableEarnings.toFixed(2)}`,
                t.orderStatus
            ]);

            doc.autoTable({
                startY: startY + 5,
                head: [['Date', 'Order ID', 'Product', 'Amount', 'Hold', 'Earned', 'Status']],
                body: tableBody,
                theme: 'striped',
                headStyles: { fillColor: [100, 100, 100], textColor: [255, 255, 255] },
                styles: { fontSize: 8 },
                margin: { left: 14, right: 14 }
            });

            // Save the PDF
            doc.save(`Account_Statement_${new Date().getTime()}.pdf`);
            
            toast.success('Statement generated and downloaded successfully!');
            onClose();
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate statement PDF.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Request Statement</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <Icon icon="solar:close-circle-bold-duotone" className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5">
                    {/* Date Info */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                        <Icon icon="solar:calendar-bold-duotone" className="w-6 h-6 text-primary-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Selected Period</p>
                            <p className="text-xs text-gray-500 capitalize">
                                {currentFilter === 'custom' ? `${customDate.start || 'N/A'} to ${customDate.end || 'N/A'}` : currentFilter.replace('days', ' Days')}
                            </p>
                        </div>
                    </div>

                    {/* Statement Type */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">Statement Type</label>
                        <div className="space-y-2">
                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${statementType === 'full' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                                <input 
                                    type="radio" 
                                    name="statementType" 
                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500" 
                                    checked={statementType === 'full'}
                                    onChange={() => setStatementType('full')}
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Full Transactions</p>
                                    <p className="text-xs text-gray-500">Includes both hold and available earnings</p>
                                </div>
                            </label>
                            
                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${statementType === 'earnings' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                                <input 
                                    type="radio" 
                                    name="statementType" 
                                    className="w-4 h-4 text-primary-600 focus:ring-primary-500" 
                                    checked={statementType === 'earnings'}
                                    onChange={() => setStatementType('earnings')}
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Earnings Only</p>
                                    <p className="text-xs text-gray-500">Only includes cleared/available earnings</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        disabled={isGenerating}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                    >
                        {isGenerating ? (
                            <>
                                <Icon icon="line-md:loading-loop" className="w-4 h-4" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Icon icon="solar:download-bold-duotone" className="w-4 h-4" />
                                Generate PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
