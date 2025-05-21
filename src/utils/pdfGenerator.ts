import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SearchResult } from '../types';

export const generateCustomerPDF = async (person: SearchResult) => {
    // Create a PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Set fonts
    pdf.setFont("helvetica");
    
    // Screening Hit Details header
    pdf.setFontSize(14);
    pdf.text("Screening Hit Details", 20, 30);
    
    // Add table headers
    const tableTop = 36;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, tableTop, pageWidth - 40, 7, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Hit Details", 22, tableTop + 5);
    pdf.text("Keyword", 80, tableTop + 5);
    pdf.text("Source", 135, tableTop + 5);
    pdf.text("Hit Determination", 175, tableTop + 5);
    pdf.text("Comments", pageWidth - 30, tableTop + 5);
    
    // Skip directly to Customer Information section
    let currentY = tableTop + 15;
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Customer Information", 20, currentY);
    
    // Customer info table
    currentY += 10;
    const addInfoRow = (label: string, value: string) => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, currentY - 4, pageWidth - 40, 7, 'F');
        
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(label, 22, currentY);
        
        pdf.setTextColor(0, 0, 0);
        pdf.text(value || 'N/A', 80, currentY);
        
        currentY += 7;
    };
    
    // Create rows with actual customer data
    addInfoRow("Idenfo Id", person.id.toString());
    addInfoRow("Full Name", person.name);
    addInfoRow("Country of Residence", person.country || "N/A");
    addInfoRow("Resident Status", "Resident Expat");
    addInfoRow("Date of Birth", "N/A");
    addInfoRow("Nationality", person.country || "N/A");
    addInfoRow("Delivery Channel", "Face to Face");
    addInfoRow("National ID Document Number", "N/A");
    addInfoRow("ID Expiry Date", "N/A");
    
    // Display category info
    const getCategoryFromDataset = (dataset: string) => {
        if (dataset === 'onboarded') return 'Onboarded';
        if (dataset.includes('peps')) return 'PEP';
        if (dataset.includes('terrorists')) return 'Terrorist';
        if (dataset.includes('sanctions')) return 'Sanctions';
        if (dataset.includes('debarment')) return 'Debarred';
        return dataset;
    };
    
    addInfoRow("Name Screening Hit", person.dataset !== 'onboarded' ? "YES" : "NO");
    addInfoRow("Category", getCategoryFromDataset(person.dataset));
    
    // Key Findings section
    currentY += 10;
    pdf.setFontSize(14);
    pdf.text("Key Findings", 20, currentY);
    
    currentY += 10;
    addInfoRow("Total Matches", "0");
    addInfoRow("Resolved Matches", "0");
    addInfoRow("Unresolved Matches", "0");
    
    // Add disclaimer at the bottom
    const disclaimer = "This report is generated automatically for AML compliance purposes. This document contains confidential information and should be handled accordingly.";
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    
    const splitDisclaimer = pdf.splitTextToSize(disclaimer, pageWidth - 60);
    pdf.text(splitDisclaimer, pageWidth / 2, 280, { align: 'center' });
    
    // Save PDF with person's name
    const fileName = `Customer_Report_${person.name.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
}; 