import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  BookOpen, 
  CreditCard, 
  UserCheck, 
  History, 
  X, 
  CheckCircle2, 
  Phone, 
  Mail 
} from 'lucide-react';

export default function CustomerLedger({ onCustomerChange }) {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '', credit_limit: '5000' });
  const [formError, setFormError] = useState('');

  // Pay Balance Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('CASH');
  const [txnRef, setTxnRef] = useState('');

  // History Drawer Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const json = await res.json();
      if (json.success) setCustomers(json.data);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          credit_limit: Number(formData.credit_limit || 5000)
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create customer');
      }

      setIsAddModalOpen(false);
      setFormData({ full_name: '', phone: '', email: '', credit_limit: '5000' });
      loadCustomers();
      if (onCustomerChange) onCustomerChange();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const openPayModal = (customer) => {
    setSelectedCustomer(customer);
    setPayAmount(customer.outstanding_balance.toString());
    setPayMode('CASH');
    setTxnRef('');
    setIsPayModalOpen(true);
  };

  const handlePayBalance = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    try {
      const res = await fetch(`/api/customers/${selectedCustomer.customer_id}/pay-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(payAmount),
          payment_mode: payMode,
          transaction_ref: txnRef || 'KHATA_PAYMENT',
          received_by: 2
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to record payment');
      }

      setIsPayModalOpen(false);
      loadCustomers();
      if (onCustomerChange) onCustomerChange();
    } catch (err) {
      alert('Error recording payment: ' + err.message);
    }
  };

  const viewCustomerHistory = async (customerId) => {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const json = await res.json();
      if (json.success) {
        setHistoryData(json.data);
        setIsHistoryOpen(true);
      }
    } catch (err) {
      alert('Error fetching customer history: ' + err.message);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0);

  return (
    <div>
      {/* Khata Summary Stats Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Khata Debt (Receivable)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>₹{totalOutstanding.toFixed(2)}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Registered Accounts</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>{customers.length} Accounts</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '340px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Register New Customer
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Details</th>
                <th>Orders Placed</th>
                <th>Lifetime Spend</th>
                <th>Credit Limit</th>
                <th>Outstanding Balance</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No customer records found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => {
                  const hasDebt = c.outstanding_balance > 0;
                  return (
                    <tr key={c.customer_id}>
                      <td style={{ fontWeight: 700, color: '#1e293b' }}>
                        {c.full_name}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} color="#64748b" /> {c.phone}</span>
                          {c.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}><Mail size={12} /> {c.email}</span>}
                        </div>
                      </td>
                      <td>{c.total_orders || 0} Bills</td>
                      <td style={{ fontWeight: 600 }}>₹{(c.lifetime_spent || 0).toFixed(2)}</td>
                      <td>₹{c.credit_limit.toFixed(2)}</td>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: hasDebt ? '#ef4444' : '#10b981' }}>
                          ₹{c.outstanding_balance.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        {hasDebt ? (
                          <span className="badge badge-danger">Payment Due</span>
                        ) : (
                          <span className="badge badge-success">All Clear</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {hasDebt && (
                            <button
                              onClick={() => openPayModal(c)}
                              className="btn btn-success btn-sm"
                            >
                              <CreditCard size={14} /> Settle Due
                            </button>
                          )}
                          <button
                            onClick={() => viewCustomerHistory(c.customer_id)}
                            className="btn btn-secondary btn-sm"
                            title="View Statement & Invoices"
                          >
                            <History size={14} /> Statement
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Register New Customer</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCustomer}>
              <div className="modal-body">
                {formError && (
                  <div style={{ marginBottom: '14px', padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#ef4444', fontSize: '0.8rem' }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Credit Limit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                    className="form-input"
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Maximum allowable debt balance before credit sales are blocked.</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Due / Pay Balance Modal */}
      {isPayModalOpen && selectedCustomer && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Record Khata Settlement</h3>
              <button onClick={() => setIsPayModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePayBalance}>
              <div className="modal-body">
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{selectedCustomer.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Phone: {selectedCustomer.phone}</div>
                  <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                    Current Due Balance: <b style={{ color: '#ef4444' }}>₹{selectedCustomer.outstanding_balance.toFixed(2)}</b>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={selectedCustomer.outstanding_balance}
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Mode *</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    className="form-select"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CARD">Debit / Credit Card</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reference / Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI Ref / Cash receipt"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsPayModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-success">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Statement Drawer */}
      {isHistoryOpen && historyData && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Account Statement</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{historyData.full_name} ({historyData.phone})</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>Order History</h4>
              <div className="table-responsive" style={{ maxHeight: '180px', marginBottom: '20px' }}>
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Date</th>
                      <th>Net Payable</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.orders.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No sales recorded</td></tr>
                    ) : (
                      historyData.orders.map(o => (
                        <tr key={o.order_id}>
                          <td style={{ fontWeight: 600 }}>{o.invoice_number}</td>
                          <td>{new Date(o.order_date).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 700 }}>₹{o.net_payable.toFixed(2)}</td>
                          <td><span className={`badge ${o.payment_status === 'PAID' ? 'badge-success' : 'badge-danger'}`}>{o.payment_status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', color: '#1e293b' }}>Payment Settlements</h4>
              <div className="table-responsive" style={{ maxHeight: '180px' }}>
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.payments.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>No payments recorded</td></tr>
                    ) : (
                      historyData.payments.map(p => (
                        <tr key={p.payment_id}>
                          <td>#{p.payment_id}</td>
                          <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 700, color: '#10b981' }}>+₹{p.amount.toFixed(2)}</td>
                          <td><span className="badge badge-info">{p.payment_mode}</span></td>
                          <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.transaction_ref || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsHistoryOpen(false)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
