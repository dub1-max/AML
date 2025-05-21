import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SearchResult } from '../types';

export const generateCustomerPDF = async (person: SearchResult) => {
    // Create a PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Set fonts
    pdf.setFont("helvetica");
    
    // Add logo
    // Add logo placeholder and company name
    pdf.setTextColor(85, 37, 131); // Purple color for IDENFO
    pdf.setFontSize(32);
    pdf.text("IDENFO", pageWidth - 60, 20);
    pdf.setTextColor(245, 188, 0); // Yellow/gold color
    pdf.setFontSize(24);
    pdf.text("direct", pageWidth - 33, 20);
    pdf.setTextColor(0, 0, 0); // Reset to black
    
    // Add Screening Hit Details section
    pdf.setFontSize(16);
    pdf.text("Screening Hit Details", 14, 40);
    
    // Add table headers
    const tableTop = 45;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(14, tableTop, pageWidth - 28, 7, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Hit Details", 16, tableTop + 5);
    pdf.text("Keyword", 75, tableTop + 5);
    pdf.text("Source", 130, tableTop + 5);
    pdf.text("Score", 170, tableTop + 5);
    pdf.text("Hit Determination", 190, tableTop + 5);
    pdf.text("Comments", pageWidth - 16, tableTop + 5, { align: 'right' });
    
    // Add Audit section
    let currentY = tableTop + 15;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Audit", 14, currentY);
    
    // Audit table
    currentY += 5;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(14, currentY, pageWidth - 28, 7, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Date", 16, currentY + 5);
    pdf.text("Actioned By", 60, currentY + 5);
    pdf.text("Action", 150, currentY + 5);
    
    // Add audit data
    currentY += 7;
    pdf.setTextColor(0, 0, 0);
    const today = new Date().toISOString().split('T')[0].replace(/-/g, ' ');
    pdf.text(today, 16, currentY + 5);
    pdf.text("RESPECT CORPORATE SERVICES PROVIDER LLC", 60, currentY + 5);
    pdf.text("Registered new customer into the system.", 150, currentY + 5);
    
    // Add second row
    currentY += 7;
    pdf.text(today, 16, currentY + 5);
    pdf.text("System User", 60, currentY + 5);
    pdf.text("Name Screening has been approved", 150, currentY + 5);
    
    // Add Sanction Lists section
    currentY += 15;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(14, currentY, pageWidth - 28, 95, 'F');
    
    // Add sanction list entries - these are the categories
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
        pdf.text(`${list.name} ${list.desc}`, 20, currentY);
        currentY += 6;
    });
    
    // Customer Information section
    currentY += 20;
    pdf.setFontSize(16);
    pdf.text("Customer Information", 14, currentY);
    
    // Customer info table
    currentY += 10;
    const addInfoRow = (label: string, value: string, labelX: number, valueX: number) => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(14, currentY - 4, pageWidth - 28, 7, 'F');
        
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(label, labelX, currentY);
        
        pdf.setTextColor(0, 0, 0);
        pdf.text(value || 'N/A', valueX, currentY);
        
        currentY += 7;
    };
    
    // Create rows with proper alignment
    addInfoRow("Idenfo Id", person.id.toString(), 16, 100);
    addInfoRow("Full Name", person.name, 16, 100);
    addInfoRow("Country of Residence", person.country || "N/A", 16, 100);
    addInfoRow("Resident Status", "Resident Expat", 16, 100);
    addInfoRow("Date of Birth", "N/A", 16, 100);
    addInfoRow("Nationality", person.country || "N/A", 16, 100);
    addInfoRow("Delivery Channel", "Face to Face", 16, 100);
    addInfoRow("National ID Document Number", "N/A", 16, 100);
    addInfoRow("ID Expiry Date", "N/A", 16, 100);
    
    // Display category info instead of dataset URL
    const getCategoryFromDataset = (dataset: string) => {
        if (dataset === 'onboarded') return 'Onboarded';
        if (dataset.includes('peps')) return 'PEP';
        if (dataset.includes('terrorists')) return 'Terrorist';
        if (dataset.includes('sanctions')) return 'Sanctions';
        if (dataset.includes('debarment')) return 'Debarred';
        return dataset;
    };
    
    addInfoRow("Name Screening Hit", person.dataset !== 'onboarded' ? "YES" : "NO", 16, 100);
    addInfoRow("Category", getCategoryFromDataset(person.dataset), 16, 100);
    
    // Key Findings section
    currentY += 10;
    pdf.setFontSize(16);
    pdf.text("Key Findings", 14, currentY);
    
    currentY += 10;
    addInfoRow("Total Matches", "0", 16, 100);
    addInfoRow("Resolved Matches", "0", 16, 100);
    addInfoRow("Unresolved Matches", "0", 16, 100);
    
    // Risk Ratings
    currentY += 10;
    pdf.setFontSize(16);
    pdf.text("Risk Ratings", 14, currentY);
    
    currentY += 10;
    // Risk factor matrix header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(14, currentY - 4, pageWidth - 28, 7, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Risk factor matrix", 16, currentY);
    pdf.text("Score", 150, currentY);
    pdf.text("Level", 180, currentY);
    
    currentY += 7;
    
    // Risk factors data
    const riskFactors = [
        { name: "Country of Residence", score: 5, level: "medium" },
        { name: "Delivery Channel", score: 0, level: "low" },
        { name: "Industry", score: 0, level: "low" },
        { name: "Nationality", score: 0, level: "low" },
        { name: "Product", score: 0, level: "low" },
        { name: "PEP", score: 0, level: "low" },
        { name: "Document Verification", score: 0, level: "low" },
        { name: "Base Rating", score: 5, level: "low" }
    ];
    
    riskFactors.forEach(factor => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(14, currentY - 4, pageWidth - 28, 7, 'F');
        
        pdf.setTextColor(0, 0, 0);
        pdf.text(factor.name, 16, currentY);
        pdf.text(factor.score.toString(), 150, currentY);
        pdf.text(factor.level, 180, currentY);
        
        currentY += 7;
    });
    
    // Risk factor override section
    currentY += 7;
    pdf.setFillColor(240, 240, 240);
    pdf.rect(14, currentY - 4, pageWidth - 28, 7, 'F');
    
    pdf.setTextColor(100, 100, 100);
    pdf.text("Risk factor override", 16, currentY);
    pdf.text("Override To", 150, currentY);
    pdf.text("Level", 180, currentY);
    
    currentY += 7;
    
    // Override factors data
    const overrideFactors = [
        { name: "Suspicious Transaction Report filed", override: "N/A", level: "low" },
        { name: "Non Resident", override: "N/A", level: "low" },
        { name: "Residence Country is Sanctioned", override: "N/A", level: "low" },
        { name: "Nationality Country is Sanctioned", override: "N/A", level: "low" },
        { name: "Contact No. Code Country is Sanctioned", override: "N/A", level: "low" },
        { name: "Sanction Hit", override: "N/A", level: "low" },
        { name: "PEP", override: "N/A", level: "low" },
        { name: "Special Interest Hit", override: "N/A", level: "low" },
        { name: "Document Verification", override: "N/A", level: "low" },
        { name: "Adverse Media Hit", override: "N/A", level: "low" },
        { name: "Overall Rating", override: "low", level: "low" }
    ];
    
    overrideFactors.forEach(factor => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(14, currentY - 4, pageWidth - 28, 7, 'F');
        
        pdf.setTextColor(0, 0, 0);
        pdf.text(factor.name, 16, currentY);
        pdf.text(factor.override, 150, currentY);
        pdf.text(factor.level, 180, currentY);
        
        currentY += 7;
    });
    
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