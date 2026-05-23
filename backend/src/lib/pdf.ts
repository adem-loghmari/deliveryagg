import React from 'react'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#111' },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1d4ed8', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#6b7280' },
  section: { marginBottom: 16 },
  label: { fontSize: 8, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 10 },
  table: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', padding: '6 10', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  tableRow: { flexDirection: 'row', padding: '6 10', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  col: { flex: 1, fontSize: 9 },
  colWide: { flex: 2, fontSize: 9 },
  total: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  totalText: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  footer: { marginTop: 32, fontSize: 8, color: '#9ca3af', textAlign: 'center' },
})

interface InvoiceData {
  id: string
  month: number
  year: number
  status: string
  generatedAt: string
  totalAmount: number
  business: { name: string; contactName: string; phone: string }
  lines: Array<{ type: string; rate: number; order: { id: string; recipientName: string; governorate: string } }>
}

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const doc = React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.title }, 'DeliveryAgg'),
        React.createElement(Text, { style: styles.subtitle }, 'Delivery Rate Aggregation Platform'),
      ),
      React.createElement(View, { style: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 } },
        React.createElement(View, null,
          React.createElement(Text, { style: styles.label }, 'Billed to'),
          React.createElement(Text, { style: styles.value }, data.business.name),
          React.createElement(Text, { style: { ...styles.value, color: '#6b7280' } }, data.business.contactName),
          React.createElement(Text, { style: { ...styles.value, color: '#6b7280' } }, data.business.phone),
        ),
        React.createElement(View, { style: { alignItems: 'flex-end' } },
          React.createElement(Text, { style: styles.label }, 'Invoice'),
          React.createElement(Text, { style: styles.value }, data.id.slice(0, 12).toUpperCase()),
          React.createElement(Text, { style: styles.label }, 'Period'),
          React.createElement(Text, { style: styles.value }, `${MONTHS[data.month]} ${data.year}`),
          React.createElement(Text, { style: styles.label }, 'Status'),
          React.createElement(Text, { style: { ...styles.value, color: data.status === 'PAID' ? '#16a34a' : '#d97706' } }, data.status),
        ),
      ),
      React.createElement(View, { style: styles.table },
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(Text, { style: { ...styles.colWide, fontFamily: 'Helvetica-Bold' } }, 'Recipient'),
          React.createElement(Text, { style: { ...styles.col, fontFamily: 'Helvetica-Bold' } }, 'Location'),
          React.createElement(Text, { style: { ...styles.col, fontFamily: 'Helvetica-Bold' } }, 'Type'),
          React.createElement(Text, { style: { ...styles.col, fontFamily: 'Helvetica-Bold', textAlign: 'right' } }, 'Rate (TND)'),
        ),
        ...data.lines.map((line, i) =>
          React.createElement(View, { key: i, style: styles.tableRow },
            React.createElement(Text, { style: styles.colWide }, line.order.recipientName),
            React.createElement(Text, { style: { ...styles.col, color: '#6b7280' } }, line.order.governorate),
            React.createElement(Text, { style: styles.col }, line.type),
            React.createElement(Text, { style: { ...styles.col, textAlign: 'right' } }, line.rate.toFixed(3)),
          )
        ),
      ),
      React.createElement(View, { style: styles.total },
        React.createElement(Text, { style: styles.totalText }, `Total: ${data.totalAmount.toFixed(3)} TND`),
      ),
      React.createElement(Text, { style: styles.footer }, 'DeliveryAgg · noreply@deliveryagg.tn'),
    )
  )
  return renderToBuffer(doc) as Promise<Buffer>
}
