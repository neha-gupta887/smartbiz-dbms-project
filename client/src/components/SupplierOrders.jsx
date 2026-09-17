import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  PackagePlus, 
  Trash2, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  X, 
  CheckCircle,
  Eye
} from 'lucide-react';

export default function SupplierOrders({ onSupplierRestock }) {
  const [suppliers, setSuppliers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);

  // Modals
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Purchase Detail Modal
  const [purchaseDetail, setPurchaseDetail] = useState(null);
  const [isPurchaseDetailOpen, setIsPurchaseDetailOpen] = useState(false);

  // Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    gstin: '',
    address: ''
  });

  // Purchase Inward Form
  const [purchaseForm, setPurchaseForm] = useState({
    supplier_id: '',
    invoice_no: '',
    items: [{ product_id: '', quantity: 10, unit_cost: 0 }]
  });

  useEffect(() => {
    loadSuppliers();
    loadPurchases();
    loadProducts();
  }, []);

  const loadSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const json = await res.json();
      if (json.success) {
        setSuppliers(json.data);
        if (json.data.length > 0 && !purchaseForm.supplier_id) {
          setPurchaseForm(prev => ({ ...prev, supplier_id: json.data[0].supplier_id }));
        }
      }
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  };

  const loadPurchases = async () => {
    try {
      const res = await fetch('/api/purchases');
      const json = await res.json();
      if (json.success) setPurchases(json.data);
    } catch (err) {
      console.error('Error loading purchases:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const viewPurchaseDetail = async (purchaseId) => {
    try {
      const res = await fetch(`/api/purchases/${purchaseId}`);
      const json = await res.json();
      if (json.success) {
        setPurchaseDetail(json.data);
        setIsPurchaseDetailOpen(true);
      }
    } catch (err) {
      alert('Error loading purchase details: ' + err.message);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddSupplierOpen(false);
        setSupplierForm({ company_name: '', contact_person: '', phone: '', email: '', gstin: '', address: '' });
        loadSuppliers();
      }
    } catch (err) {
      alert('Error creating supplier: ' + err.message);
    }
  };

  // Add Item Line to Purchase
  const addPurchaseItem = () => {
    setPurchaseForm(prev => ({
      ...prev,
      items: [...prev.items, { product_id: products[0]?.product_id || '', quantity: 10, unit_cost: products[0]?.cost_price || 0 }]
    }));
  };

  const removePurchaseItem = (index) => {
    setPurchaseForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updatePurchaseItem = (index, field, value) => {
    setPurchaseForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Auto-populate default cost if product changed
      if (field === 'product_id') {
        const prod = products.find(p => p.product_id === Number(value));
        if (prod) newItems[index].unit_cost = prod.cost_price;
      }

      return { ...prev, items: newItems };
    });
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier_id: Number(purchaseForm.supplier_id),
          invoice_no: purchaseForm.invoice_no || `PO-${Date.now().toString().slice(-4)}`,
          user_id: 1,
          items: purchaseForm.items.map(i => ({
            product_id: Number(i.product_id),
            quantity: Number(i.quantity),
            unit_cost: Number(i.unit_cost)
          }))
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to place purchase order');
      }

      setIsPurchaseModalOpen(false);
      setPurchaseForm({
        supplier_id: suppliers[0]?.supplier_id || '',
        invoice_no: '',
        items: [{ product_id: products[0]?.product_id || '', quantity: 10, unit_cost: products[0]?.cost_price || 0 }]
      });

      loadPurchases();
      loadProducts();
      if (onSupplierRestock) onSupplierRestock();
      alert('Purchase Order processed successfully! Inventory stock has been automatically updated via SQL triggers.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const purchaseSubtotal = purchaseForm.items.reduce((s, i) => s + (Number(i.quantity || 0) * Number(i.unit_cost || 0)), 0);

  return (
    <div>
      {/* Top Header & Actions */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>Vendor & Inward Restock Management</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Track wholesale suppliers and record inventory restock purchase orders</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsAddSupplierOpen(true)} className="btn btn-secondary">
              <Building2 size={16} /> Add Supplier
            </button>
            <button
              onClick={() => {
                if (products.length > 0) {
                  setPurchaseForm({
                    supplier_id: suppliers[0]?.supplier_id || '',
                    invoice_no: `VEND-INV-${Math.floor(1000 + Math.random() * 9000)}`,
                    items: [{ product_id: products[0].product_id, quantity: 10, unit_cost: products[0].cost_price }]
                  });
                }
                setIsPurchaseModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <PackagePlus size={16} /> Inward Stock Purchase
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {suppliers.map(s => (
          <div key={s.supplier_id} className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{s.company_name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>Contact: {s.contact_person || 'N/A'}</div>
              </div>
              <span className="badge badge-info">{s.total_purchases} Orders</span>
            </div>

            <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {s.phone}</div>
              {s.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {s.email}</div>}
              {s.gstin && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={12} /> GSTIN: {s.gstin}</div>}
            </div>

            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: '#64748b' }}>Total Supplied:</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>₹{Number(s.total_purchased_value || 0).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Inward Purchase Orders History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>
          Recent Inward Purchase Orders (Restock History)
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Supplier Company</th>
                <th>Invoice / Bill No</th>
                <th>Date Received</th>
                <th>Purchased By</th>
                <th>Total Value</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No purchase orders recorded yet.</td></tr>
              ) : (
                purchases.map(p => (
                  <tr key={p.purchase_id}>
                    <td style={{ fontWeight: 700 }}>#{p.purchase_id}</td>
                    <td style={{ fontWeight: 600 }}>{p.supplier_name}</td>
                    <td><span style={{ fontFamily: 'monospace', color: '#4f46e5' }}>{p.invoice_no}</span></td>
                    <td>{new Date(p.purchase_date).toLocaleDateString()}</td>
                    <td>{p.created_by_name}</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(p.total_amount).toFixed(2)}</td>
                    <td><span className="badge badge-success">{p.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => viewPurchaseDetail(p.purchase_id)}
                        className="btn btn-secondary btn-sm"
                        title="View Purchase Details"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Order Detail Modal */}
      {isPurchaseDetailOpen && purchaseDetail && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Purchase Order Receipt</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>PO #{purchaseDetail.purchase_id} — {purchaseDetail.invoice_no}</p>
              </div>
              <button onClick={() => setIsPurchaseDetailOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Supplier Info */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>Supplier</div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{purchaseDetail.supplier_name}</div>
                    {purchaseDetail.contact_person && <div style={{ color: '#64748b' }}>Attn: {purchaseDetail.contact_person}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', marginTop: '2px' }}><Phone size={11} />{purchaseDetail.supplier_phone}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>Order Details</div>
                    <div style={{ color: '#1e293b' }}>Date: <b>{new Date(purchaseDetail.purchase_date).toLocaleDateString()}</b></div>
                    <div style={{ color: '#1e293b' }}>Received By: <b>{purchaseDetail.created_by_name}</b></div>
                    {purchaseDetail.supplier_gstin && <div style={{ color: '#64748b' }}>GSTIN: {purchaseDetail.supplier_gstin}</div>}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#334155' }}>
                Restocked Items ({purchaseDetail.items?.length || 0} SKUs)
              </div>
              <div className="table-responsive" style={{ maxHeight: '250px' }}>
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>SKU Code</th>
                      <th>Product Name</th>
                      <th>Unit</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Unit Cost</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseDetail.items?.map(item => (
                      <tr key={item.purchase_item_id}>
                        <td style={{ fontFamily: 'monospace', color: '#4f46e5', fontWeight: 700 }}>{item.sku_code}</td>
                        <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                        <td>{item.unit}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₹{Number(item.unit_cost).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600, fontSize: '0.8rem' }}>
                  <CheckCircle size={16} />
                  Stock updated via SQL Trigger (trg_add_stock_after_purchase)
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Total: <span style={{ color: '#4f46e5' }}>₹{Number(purchaseDetail.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsPurchaseDetailOpen(false)} className="btn btn-secondary">Close</button>
              <button onClick={() => window.print()} className="btn btn-primary">Print Receipt</button>
            </div>
          </div>
        </div>
      )}

      {/* Inward Purchase Order Modal */}
      {isPurchaseModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inward Restock Purchase Order</h3>
              <button onClick={() => setIsPurchaseModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePurchase}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Select Supplier *</label>
                    <select
                      value={purchaseForm.supplier_id}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier_id: e.target.value })}
                      className="form-select"
                      required
                    >
                      {suppliers.map(s => (
                        <option key={s.supplier_id} value={s.supplier_id}>{s.company_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Supplier Bill / Invoice #</label>
                    <input
                      type="text"
                      placeholder="e.g. BILL-9021"
                      value={purchaseForm.invoice_no}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, invoice_no: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Restock Items (Will increment stock automatically)</label>
                  <button type="button" onClick={addPurchaseItem} className="btn btn-secondary btn-sm">
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                {/* Items Dynamic Rows */}
                <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', background: '#f8fafc' }}>
                  {purchaseForm.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 32px', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <select
                        value={item.product_id}
                        onChange={(e) => updatePurchaseItem(idx, 'product_id', e.target.value)}
                        className="form-select"
                        required
                        style={{ fontSize: '0.8rem' }}
                      >
                        {products.map(p => (
                          <option key={p.product_id} value={p.product_id}>
                            {p.product_name} (Current Stock: {p.current_stock})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updatePurchaseItem(idx, 'quantity', e.target.value)}
                        className="form-input"
                        required
                        style={{ fontSize: '0.8rem' }}
                      />

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Cost Price"
                        value={item.unit_cost}
                        onChange={(e) => updatePurchaseItem(idx, 'unit_cost', e.target.value)}
                        className="form-input"
                        required
                        style={{ fontSize: '0.8rem' }}
                      />

                      {purchaseForm.items.length > 1 && (
                        <button type="button" onClick={() => removePurchaseItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '1rem', fontWeight: 800 }}>
                  Total Inward Cost: <span style={{ color: '#4f46e5' }}>₹{purchaseSubtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Receive Stock & Update Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add New Wholesale Supplier</h3>
              <button onClick={() => setIsAddSupplierOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSupplier}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Company / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Tech Wholesale"
                    value={supplierForm.company_name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, company_name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Malhotra"
                    value={supplierForm.contact_person}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="9876543210"
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">GSTIN / Tax ID</label>
                    <input
                      type="text"
                      placeholder="07AAAAA0000A1Z5"
                      value={supplierForm.gstin}
                      onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="orders@vendor.com"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Warehouse Address</label>
                  <textarea
                    rows="2"
                    placeholder="City, State, Pin Code..."
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsAddSupplierOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
