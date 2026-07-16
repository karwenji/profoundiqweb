// Report export utilities for PDF, Excel, and Word formats

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx'

// Export to PDF
export function exportToPDF(title: string, data: any[], filename: string = 'report.pdf') {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(18)
  doc.text(title, 14, 20)
  doc.setFontSize(10)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
  
  // Extract headers and rows
  if (data.length > 0) {
    const headers = Object.keys(data[0]).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    )
    const rows = data.map(item => Object.values(item) as (string | number)[])
    
    autoTable(doc, {
      head: [headers],
      body: rows as any,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 133, 244] },
    })
  }
  
  doc.save(filename)
}

// Export to Excel
export function exportToExcel(data: any[], filename: string = 'report.xlsx', sheetName: string = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

// Export to Word
export async function exportToWord(title: string, data: any[], filename: string = 'report.docx') {
  const headers = Object.keys(data[0] || {}).map(key => 
    key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
  )
  
  const tableRows = [
    new TableRow({
      children: headers.map(header => 
        new TableCell({
          children: [new Paragraph({ text: header, bold: true })],
          width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
        })
      ),
    }),
    ...data.map(item => 
      new TableRow({
        children: Object.values(item).map(value => 
          new TableCell({
            children: [new Paragraph(String(value))],
          })
        ),
      })
    ),
  ]
  
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: title,
          heading: 'Heading1',
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Generated on: ${new Date().toLocaleDateString()}`,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' }), // Spacer
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      ],
    }],
  })
  
  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Helper to get current date string
export function getReportDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
