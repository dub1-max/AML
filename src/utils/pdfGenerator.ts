import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SearchResult } from '../types';

export const generateCustomerPDF = async (person: SearchResult) => {
    // Create a PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Set fonts
    pdf.setFont("helvetica");
    
    // Add title
    pdf.setFontSize(22);
    pdf.text("Customer Information Report", pageWidth / 2, 20, { align: 'center' });
    
    // Add generation date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    pdf.text(`Report Generated: ${today}`, pageWidth / 2, 26, { align: 'center' });
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    // Add customer information section
    pdf.setFontSize(16);
    pdf.text("Customer Information", 14, 40);
    
    pdf.setDrawColor(220, 220, 220);
    pdf.line(14, 42, pageWidth - 14, 42);
    
    // Customer data
    pdf.setFontSize(10);
    const startY = 50;
    const colWidth = 40;
    const rowHeight = 7;
    let currentY = startY;
    
    const addRow = (label: string, value: string) => {
        // Draw background for row
        pdf.setFillColor(245, 245, 245);
        pdf.rect(14, currentY - 4, pageWidth - 28, rowHeight, 'F');
        
        // Draw label and value
        pdf.setFont("helvetica", "bold");
        pdf.text(label, 16, currentY);
        pdf.setFont("helvetica", "normal");
        pdf.text(value || 'N/A', 16 + colWidth, currentY);
        
        currentY += rowHeight;
    };
    
    addRow("Full Name:", person.name);
    addRow("ID:", person.id.toString());
    addRow("Type:", person.type);
    addRow("Country:", person.country);
    addRow("Nationality:", person.country);
    addRow("Identifiers:", person.identifiers);
    addRow("Dataset:", person.dataset);
    
    currentY += 5;
    
    // Add screening hit details section
    pdf.setFontSize(16);
    pdf.text("Screening Hit Details", 14, currentY + 5);
    
    pdf.setDrawColor(220, 220, 220);
    pdf.line(14, currentY + 7, pageWidth - 14, currentY + 7);
    
    currentY += 15;
    
    // Add blacklist status
    pdf.setFontSize(12);
    pdf.text("Blacklist Status:", 16, currentY);
    
    const isBlacklisted = person.dataset !== 'onboarded';
    if (isBlacklisted) {
        pdf.setTextColor(200, 0, 0);
        pdf.text("BLACKLISTED", 16 + colWidth, currentY);
    } else {
        pdf.setTextColor(0, 150, 0);
        pdf.text("NOT BLACKLISTED", 16 + colWidth, currentY);
    }
    
    pdf.setTextColor(0, 0, 0);
    currentY += 10;
    
    // Add risk assessment section
    pdf.setFontSize(16);
    pdf.text("Risk Assessment", 14, currentY + 5);
    
    pdf.setDrawColor(220, 220, 220);
    pdf.line(14, currentY + 7, pageWidth - 14, currentY + 7);
    
    currentY += 15;
    
    // Risk level
    pdf.setFontSize(12);
    pdf.text("Risk Level:", 16, currentY);
    
    let riskText: string;
    let riskColor: [number, number, number];
    
    if (person.riskLevel >= 85) {
        riskText = "HIGH";
        riskColor = [200, 0, 0];
    } else if (person.riskLevel >= 60) {
        riskText = "MEDIUM";
        riskColor = [200, 150, 0];
    } else {
        riskText = "LOW";
        riskColor = [0, 150, 0];
    }
    
    pdf.setTextColor(...riskColor);
    pdf.text(`${riskText} (${person.riskLevel}%)`, 16 + colWidth, currentY);
    pdf.setTextColor(0, 0, 0);
    
    currentY += 10;
    
    // Add sanctions information if applicable
    if (person.sanctions && person.sanctions.length > 0) {
        pdf.setFontSize(16);
        pdf.text("Sanctions Information", 14, currentY + 5);
        
        pdf.setDrawColor(220, 220, 220);
        pdf.line(14, currentY + 7, pageWidth - 14, currentY + 7);
        
        currentY += 15;
        
        pdf.setFontSize(10);
        person.sanctions.forEach((sanction, index) => {
            pdf.text(`• ${sanction}`, 16, currentY);
            currentY += 6;
        });
    }
    
    // Add disclaimer at the bottom
    const disclaimer = "This report is generated automatically for AML compliance purposes. This document contains confidential information and should be handled accordingly.";
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    
    const splitDisclaimer = pdf.splitTextToSize(disclaimer, pageWidth - 40);
    pdf.text(splitDisclaimer, pageWidth / 2, 280, { align: 'center' });
    
    // Save PDF with person's name
    const fileName = `Customer_Report_${person.name.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
}; 