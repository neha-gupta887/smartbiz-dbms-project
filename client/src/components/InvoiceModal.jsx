import React from 'react';
import { Printer, X, CheckCircle } from 'lucide-react';

export default function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle color="#10b981" size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Sale Completed</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Printable Thermal Receipt */}
          <div className="invoice-paper">
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>SMARTBIZ RETAIL MART</div>
              <div style={{ fontSize: '0.75rem', color: '#555' }}>Central Mall, Tech Hub, Phase-II</div>
              <div style={{ fontSize: '0.75rem', color: '#555' }}>GSTIN: 07AABCS1429B1Z8 | Ph: 9876543200</div>
            </div>

            <div className="invoice-divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span>Bill No: <b>{invoice.invoice_number}</b></span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px' }}>
              <span>Cashier: Biller #2</span>
              <span>Status: <b style={{ textTransform: 'uppercase' }}>{invoice.payment_status}</b></span>
            </div>

            <div className="invoice-divider" />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontWeight: 700, fontSize: '0.75rem', marginBottom: '6px' }}>
              <span>Item</span>
              <span style={{ textAlign: 'center' }}>Qty</span>
              <span style={{ textAlign: 'right' }}>Amt (₹)</span>
            </div>

            <div className="invoice-divider" style={{ margin: '4px 0 8px 0' }} />

            {/* If invoice has items array or summary */}
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span>{item.product_name || `Product #${item.product_id}`}</span>
                  <span style={{ textAlign: 'center' }}>{item.quantity}</span>
                  <span style={{ textAlign: 'right' }}>{(item.unit_price * item.quantity).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.75rem', color: '#555', fontStyle: 'italic', marginBottom: '4px' }}>
                Items recorded in database.
              </div>
            )}

            <div className="invoice-divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span>Subtotal:</span>
              <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            {Number(invoice.tax_amount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span>GST / Tax:</span>
                <span>+₹{Number(invoice.tax_amount).toFixed(2)}</span>
              </div>
            )}
            {Number(invoice.discount_amount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: '#10b981' }}>
                <span>Discount:</span>
                <span>-₹{Number(invoice.discount_amount).toFixed(2)}</span>
              </div>
            )}

            <div className="invoice-divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800 }}>
              <span>NET PAYABLE:</span>
              <span>₹{Number(invoice.net_payable).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '6px' }}>
              <span>Amount Paid:</span>
              <span>₹{Number(invoice.paid_amount || invoice.net_payable).toFixed(2)}</span>
            </div>

            {invoice.due_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, marginTop: '4px' }}>
                <span>Balance Due (Ledger):</span>
                <span>₹{Number(invoice.due_amount).toFixed(2)}</span>
              </div>
            )}

            <div className="invoice-divider" />
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#666', marginTop: '10px' }}>
              *** Thank You for Shopping with Us! ***<br />
              Powered by SmartBiz DBMS Relational Engine
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
