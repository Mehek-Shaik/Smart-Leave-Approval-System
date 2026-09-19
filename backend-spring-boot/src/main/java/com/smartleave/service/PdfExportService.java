package com.smartleave.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.smartleave.entity.Leave;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfExportService {

    public byte[] generateLeaveHistoryPdf(List<Leave> leaves) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.WHITE);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(203, 213, 225));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(30, 41, 59));
            Font boldCellFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(15, 23, 42));

            // Header Banner
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);

            PdfPCell bannerCell = new PdfPCell();
            bannerCell.setBackgroundColor(new Color(15, 23, 42)); // slate-900
            bannerCell.setPadding(14);
            bannerCell.setBorder(Rectangle.NO_BORDER);

            Paragraph title = new Paragraph("SMART LEAVE APPROVAL SYSTEM", titleFont);
            Paragraph subtitle = new Paragraph("Institutional Leave History & Campus Out-Pass Audit Report", subtitleFont);
            bannerCell.addElement(title);
            bannerCell.addElement(subtitle);
            headerTable.addCell(bannerCell);
            document.add(headerTable);

            document.add(new Paragraph(" ")); // Spacing

            // Summary Table
            long approvedCount = leaves.stream().filter(l -> "APPROVED".equalsIgnoreCase(String.valueOf(l.getOverallStatus()))).count();
            long pendingCount = leaves.stream().filter(l -> "PENDING".equalsIgnoreCase(String.valueOf(l.getOverallStatus()))).count();
            long rejectedCount = leaves.stream().filter(l -> "REJECTED".equalsIgnoreCase(String.valueOf(l.getOverallStatus()))).count();
            long verifiedCount = leaves.stream().filter(l -> Boolean.TRUE.equals(l.getSecurityVerified())).count();

            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{1, 1, 1, 1});

            addSummaryCell(summaryTable, "APPROVED LEAVES", String.valueOf(approvedCount), new Color(16, 185, 129));
            addSummaryCell(summaryTable, "IN PROGRESS", String.valueOf(pendingCount), new Color(245, 158, 11));
            addSummaryCell(summaryTable, "REJECTED", String.valueOf(rejectedCount), new Color(239, 68, 68));
            addSummaryCell(summaryTable, "EXIT CLEARED", String.valueOf(verifiedCount), new Color(59, 130, 246));

            document.add(summaryTable);
            document.add(new Paragraph(" "));

            // Main Records Table
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.2f, 2.5f, 1.8f, 2.2f, 1.8f, 2.5f});

            // Table Headers
            String[] headers = {"Student & Roll", "Leave Window & Type", "Mentor / Parent", "Incharge / HOD", "Status", "Gate Clearance"};
            for (String h : headers) {
                PdfPCell hCell = new PdfPCell(new Phrase(h, headerFont));
                hCell.setBackgroundColor(new Color(30, 41, 59));
                hCell.setPadding(8);
                hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(hCell);
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

            for (Leave leave : leaves) {
                // Student info
                PdfPCell studentCell = new PdfPCell();
                studentCell.setPadding(6);
                studentCell.addElement(new Paragraph(leave.getStudentName() != null ? leave.getStudentName() : "Student", boldCellFont));
                studentCell.addElement(new Paragraph("Roll: " + (leave.getStudentRollNumber() != null ? leave.getStudentRollNumber() : "N/A"), cellFont));
                studentCell.addElement(new Paragraph("Dept: " + (leave.getDepartment() != null ? leave.getDepartment() : "N/A"), cellFont));
                table.addCell(studentCell);

                // Window & Type
                PdfPCell windowCell = new PdfPCell();
                windowCell.setPadding(6);
                String from = leave.getFromDate() != null ? leave.getFromDate().format(formatter) : "N/A";
                String to = leave.getToDate() != null ? leave.getToDate().format(formatter) : "N/A";
                windowCell.addElement(new Paragraph(from + " - " + to, boldCellFont));
                windowCell.addElement(new Paragraph("Type: " + (leave.getLeaveType() != null ? leave.getLeaveType() : "CASUAL"), cellFont));
                table.addCell(windowCell);

                // Mentor & Parent
                PdfPCell stage1Cell = new PdfPCell();
                stage1Cell.setPadding(6);
                stage1Cell.addElement(new Paragraph("Mentor: " + (leave.getMentorStatus() != null ? leave.getMentorStatus() : "PENDING"), cellFont));
                stage1Cell.addElement(new Paragraph("Parent: " + (leave.getParentStatus() != null ? leave.getParentStatus() : "PENDING"), cellFont));
                table.addCell(stage1Cell);

                // Class Incharge & HOD
                PdfPCell stage2Cell = new PdfPCell();
                stage2Cell.setPadding(6);
                stage2Cell.addElement(new Paragraph("Incharge: " + (leave.getClassInchargeStatus() != null ? leave.getClassInchargeStatus() : "PENDING"), cellFont));
                stage2Cell.addElement(new Paragraph("HOD: " + (leave.getHodStatus() != null ? leave.getHodStatus() : "PENDING"), cellFont));
                table.addCell(stage2Cell);

                // Overall Status
                PdfPCell statusCell = new PdfPCell();
                statusCell.setPadding(6);
                String statusStr = leave.getOverallStatus() != null ? leave.getOverallStatus().toString() : "PENDING";
                Font statusFont = "APPROVED".equalsIgnoreCase(statusStr)
                        ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(5, 150, 105))
                        : "REJECTED".equalsIgnoreCase(statusStr)
                        ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(225, 29, 72))
                        : FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(217, 119, 6));
                statusCell.addElement(new Paragraph(statusStr, statusFont));
                table.addCell(statusCell);

                // Gate clearance
                PdfPCell gateCell = new PdfPCell();
                gateCell.setPadding(6);
                if (Boolean.TRUE.equals(leave.getSecurityVerified())) {
                    gateCell.addElement(new Paragraph("EXIT CLEARED", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(5, 150, 105))));
                    gateCell.addElement(new Paragraph("Gate: " + (leave.getSecurityGate() != null ? leave.getSecurityGate() : "Main Gate"), cellFont));
                } else if ("APPROVED".equalsIgnoreCase(statusStr)) {
                    gateCell.addElement(new Paragraph("OTP Issued", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(79, 70, 229))));
                    gateCell.addElement(new Paragraph("Awaiting Departure", cellFont));
                } else {
                    gateCell.addElement(new Paragraph("Not Authorized", FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(148, 163, 184))));
                }
                table.addCell(gateCell);
            }

            document.add(table);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while generating PDF", e);
        }

        return out.toByteArray();
    }

    private void addSummaryCell(PdfPTable table, String title, String count, Color color) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(8);
        cell.setBackgroundColor(new Color(248, 250, 252));
        cell.setBorderColor(new Color(226, 232, 240));

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(100, 116, 139));
        Font countFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, color);

        cell.addElement(new Paragraph(title, titleFont));
        cell.addElement(new Paragraph(count, countFont));
        table.addCell(cell);
    }
}
