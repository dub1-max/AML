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
    pdf.setFontSize(16);
    pdf.text("Screening Hit Details", 26, 30);
    
    // Add table headers
    const tableTop = 36;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(26, tableTop, pageWidth - 52, 7, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Hit Details", 28, tableTop + 5);
    pdf.text("Keyword", 87, tableTop + 5);
    pdf.text("Source", 142, tableTop + 5);
    pdf.text("Score", 182, tableTop + 5);
    pdf.text("Hit Determination", pageWidth - 68, tableTop + 5);
    pdf.text("Comments", pageWidth - 28, tableTop + 5);
    
    // Add Audit section
    let currentY = tableTop + 15;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Audit", 26, currentY);
    
    // Audit table
    currentY += 5;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(26, currentY, pageWidth - 52, 7, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Date", 28, currentY + 5);
    pdf.text("Actioned By", 72, currentY + 5);
    pdf.text("Action", 162, currentY + 5);
    
    // Add audit data
    currentY += 7;
    pdf.setTextColor(0, 0, 0);
    const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, ' ');
    pdf.text(today, 28, currentY + 5);
    pdf.text("RESPECT CORPORATE SERVICES PROVIDER LLC", 72, currentY + 5);
    pdf.text("Registered new customer into the system.", 162, currentY + 5);
    
    // Add second row
    currentY += 7;
    pdf.text(today, 28, currentY + 5);
    pdf.text("System User", 72, currentY + 5);
    pdf.text("Name Screening has been approved", 162, currentY + 5);
    
    // Add Sanction Lists section
    currentY += 15;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(26, currentY, pageWidth - 52, 95, 'F');
    
    // Add sanction list entries
    currentY += 10;
    const lists = [
        { name: "HMT", desc: "– His Majesty's Treasury, UK, Financial sanctions targets; list of all asset freeze targets" },
        { name: "EU", desc: "– Consolidated list of persons, groups and entities subject to European Union financial sanctions" },
        { name: "OFAC", desc: "– US Treasury, Office of Foreign Assets Control, Specially Designated Nationals And Blocked Persons List (SDN)" },
        { name: "UN", desc: "– United Nations Security Council Consolidated Sanction list" },
        { name: "MOI", desc: "– Qatari unified record of persons and entities designated on Sanction List" },
        { name: "NACTA", desc: "– Pakistani National Counter Terrorism Authority Sanction List" },
        { name: "UAE Local Terrorist", desc: "– List produced by UAE Executive Office for Control & Non Proliferation" }
    ];
    
    lists.forEach(list => {
        pdf.setFontSize(10);
        pdf.text(`${list.name} ${list.desc}`, 32, currentY);
        currentY += 6;
    });
    
    // Customer Information section
    currentY += 20;
    pdf.setFontSize(16);
    pdf.text("Customer Information", 26, currentY);
    
    // Customer info table
    currentY += 10;
    const addInfoRow = (label: string, value: string) => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(26, currentY - 4, pageWidth - 52, 7, 'F');
        
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(label, 28, currentY);
        
        pdf.setTextColor(0, 0, 0);
        const valueX = 100; // Fixed position for values
        pdf.text(value || 'N/A', valueX, currentY);
        
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
    pdf.setFontSize(16);
    pdf.text("Key Findings", 26, currentY);
    
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