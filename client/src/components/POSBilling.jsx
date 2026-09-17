import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  CreditCard, 
  Check, 
  AlertCircle,
  QrCode,
  Banknote,
  BookOpen,
  Receipt,
  History,
  Printer
} from 'lucide-react';
import InvoiceModal from './InvoiceModal';

export default function POSBilling({ onSaleComplete, refreshTrigger, userRole }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [taxRate, setTaxRate] = useState(5); // 5% default
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [customPaidAmount, setCustomPaidAmount] = useState('');
  const [txnRef, setTxnRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Invoice Receipt Modal
  const [completedInvoice, setCompletedInvoice] = useState(null);

  // Recent Invoice History
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [customPaidAmountVisible, setCustomPaidAmountVisible] = useState(false);

  // Load Products, Categories, Customers
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCustomers();
    fetchRecentInvoices();
  }, [refreshTrigger]);

  const fetchRecentInvoices = async () => {
    try {
      const res = await fetch('/api/orders?limit=10');
      const json = await res.json();
      if (json.success) setRecentInvoices(json.data);
    } catch (err) {
      console.error('Error fetching recent invoices:', err);
    }
  };

  const handleReprintInvoice = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const json = await res.json();
      if (json.success) {
        setCompletedInvoice(json.data);
      }
    } catch (err) {
      alert('Error loading invoice: ' + err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const json = await res.json();
      if (json.success) setCustomers(json.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  // Add to Cart
  const addToCart = (product) => {
    if (product.current_stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        if (existing.quantity >= product.current_stock) {
          alert(`Cannot add more. Only ${product.current_stock} items in stock!`);
          return prev;
        }
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Update Quantity
  const updateQty = (productId, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.current_stock) {
              alert(`Cannot exceed available stock of ${item.current_stock}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Remove Item
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  // Clear Cart
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomPaidAmount('');
    setTxnRef('');
    setErrorMessage('');
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
  const taxAmount = (subtotal * Number(taxRate)) / 100;
  const netPayable = Math.max(0, subtotal + taxAmount - Number(discount || 0));

  const selectedCustomer = customers.find(c => c.customer_id === Number(selectedCustomerId));

  // Handle Checkout
  const handleCheckout = async () => {
    setErrorMessage('');
    if (cart.length === 0) {
      setErrorMessage('Cart is empty. Please add items to proceed.');
      return;
    }

    let paid = netPayable;
    if (paymentMode === 'CREDIT') {
      paid = 0;
    } else if (customPaidAmount !== '' && Number(customPaidAmount) < netPayable) {
      paid = Number(customPaidAmount);
    }

    if ((paid < netPayable || paymentMode === 'CREDIT') && !selectedCustomerId) {
      setErrorMessage('Credit / Partial payment requires selecting a registered customer to record ledger balance.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer_id: selectedCustomerId ? Number(selectedCustomerId) : null,
        cashier_id: 2,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.selling_price
        })),
        tax_rate: Number(taxRate),
        discount_amount: Number(discount || 0),
        payment_mode: paymentMode,
        paid_amount: paid,
        transaction_ref: txnRef || (paymentMode === 'UPI' ? 'UPI-POS-APP' : 'CASH-COUNTER')
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Checkout failed');
      }

      // Attach current cart items for the receipt view
      setCompletedInvoice({
        ...json.data,
        items: [...cart]
      });

      // Reset cart and refresh parent
      clearCart();
      fetchProducts();
      fetchCustomers();
      fetchRecentInvoices();
      if (onSaleComplete) onSaleComplete();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category_id === Number(selectedCategory);
    const matchesSearch = p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pos-layout">
      {/* Recent Invoice History Overlay */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setShowHistory(false)}>
          <div style={{ width: '420px', background: 'white', height: '100%', overflowY: 'auto', padding: '20px', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><History size={18} color="#4f46e5" /> Recent Invoices</div>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            {recentInvoices.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>No recent invoices</p>
            ) : (
              recentInvoices.map(inv => (
                <div key={inv.order_id} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Invoice #{inv.order_id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.customer_name || 'Walk-in'} • {new Date(inv.created_at).toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Mode: {inv.payment_mode}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.9rem' }}>₹{Number(inv.net_amount).toFixed(2)}</div>
                      <span className={`badge ${inv.payment_status === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>{inv.payment_status}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleReprintInvoice(inv.order_id); setShowHistory(false); }}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '8px', fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    <Printer size={12} /> Reprint Receipt
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Left Column: Product Picker */}
      <div className="pos-catalog">
        {/* Search & Category Filter Bar */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search product name or barcode/SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
            style={{ width: '220px' }}
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>
        </div>

        {/* Product Cards Grid */}
        <div className="pos-grid">
          {filteredProducts.map(p => {
            const isOutOfStock = p.current_stock <= 0;
            const isLow = p.current_stock <= p.reorder_level && !isOutOfStock;

            return (
              <div
                key={p.product_id}
                onClick={() => !isOutOfStock && addToCart(p)}
                className={`product-pos-card ${isOutOfStock ? 'out-of-stock' : ''}`}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{p.sku_code}</span>
                    {isOutOfStock ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : isLow ? (
                      <span className="badge badge-warning">Low: {p.current_stock}</span>
                    ) : (
                      <span className="badge badge-success">Stock: {p.current_stock}</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1e293b', lineHeight: 1.3 }}>
                    {p.product_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    {p.category_name}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#4f46e5' }}>
                    ₹{p.selling_price.toFixed(2)}
                  </div>
                  <button
                    disabled={isOutOfStock}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '4px 8px', borderRadius: '6px' }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Dynamic Cart & Billing Terminal */}
      <div className="pos-cart">
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} color="#4f46e5" />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Active Order</span>
            <span className="badge badge-info">{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setShowHistory(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <History size={14} /> History
            </button>
            {cart.length > 0 && (
              <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                Clear
              </button>
            )}
          </div>
        </div>
        {/* Cashier Info Bar */}
        <div style={{ padding: '6px 20px', background: '#eef2ff', borderBottom: '1px solid #c7d2fe', fontSize: '0.75rem', color: '#4338ca', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>🧾 POS Terminal — {userRole === 'admin' ? 'Admin Cashier' : 'Cashier'}</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>

        {/* Customer Selector */}
        <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <User size={15} color="#64748b" />
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Customer / Khata Account</label>
          </div>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
          >
            <option value="">Walk-in Customer (Anonymous / Instant Paid)</option>
            {customers.map(c => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.full_name} ({c.phone}) — Debt: ₹{c.outstanding_balance.toFixed(2)} / Limit: ₹{c.credit_limit}
              </option>
            ))}
          </select>

          {selectedCustomer && (
            <div style={{ fontSize: '0.75rem', marginTop: '6px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>Existing Debt: <b style={{ color: selectedCustomer.outstanding_balance > 0 ? '#ef4444' : '#10b981' }}>₹{selectedCustomer.outstanding_balance.toFixed(2)}</b></span>
              <span>Available Credit: <b>₹{(selectedCustomer.credit_limit - selectedCustomer.outstanding_balance).toFixed(2)}</b></span>
            </div>
          )}
        </div>

        {/* Cart Item Rows */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 10px' }}>
              <ShoppingCart size={40} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cart is empty</p>
              <p style={{ fontSize: '0.75rem' }}>Click products from catalog to start billing</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="cart-item">
                <div style={{ flexGrow: 1, paddingRight: '10px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.product_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>₹{item.selling_price.toFixed(2)} / {item.unit}</div>
                </div>

                <div className="qty-control">
                  <button onClick={() => updateQty(item.product_id, -1)} className="qty-btn"><Minus size={12} /></button>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.product_id, 1)} className="qty-btn"><Plus size={12} /></button>
                </div>

                <div style={{ width: '70px', textAlign: 'right', fontWeight: 700, fontSize: '0.9rem' }}>
                  ₹{(item.selling_price * item.quantity).toFixed(2)}
                </div>

                <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px', color: '#ef4444' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Payment Controls */}
        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row" style={{ alignItems: 'center' }}>
            <span>GST / Tax Rate</span>
            <select
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
            >
              <option value="0">0% (Exempt)</option>
              <option value="5">5% (Standard)</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
            </select>
          </div>

          <div className="summary-row" style={{ alignItems: 'center' }}>
            <span>Discount (₹)</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              style={{ width: '80px', padding: '2px 8px', textAlign: 'right', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
            />
          </div>

          <div className="summary-row summary-total">
            <span>Net Payable</span>
            <span style={{ color: '#4f46e5' }}>₹{netPayable.toFixed(2)}</span>
          </div>

          {/* Partial Payment Field */}
          {paymentMode !== 'CREDIT' && paymentMode !== 'CASH' && (
            <div className="summary-row" style={{ alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '0.75rem' }}>Amount Paid (₹)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={netPayable.toFixed(2)}
                value={customPaidAmount}
                onChange={(e) => setCustomPaidAmount(e.target.value)}
                style={{ width: '90px', padding: '2px 8px', textAlign: 'right', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
              />
            </div>
          )}

          {/* Payment Method Selector */}
          <div style={{ marginTop: '12px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Payment Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote },
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'CREDIT', label: 'Khata / Credit', icon: BookOpen },
              ].map(m => {
                const Icon = m.icon;
                const isSelected = paymentMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMode(m.id)}
                    type="button"
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: isSelected ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      background: isSelected ? '#eef2ff' : 'white',
                      color: isSelected ? '#4f46e5' : '#475569',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Icon size={14} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{ marginTop: '10px', padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Complete Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={isSubmitting || cart.length === 0}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '14px', padding: '12px', fontSize: '0.95rem' }}
          >
            {isSubmitting ? 'Processing Transaction...' : `Complete Sale & Print Bill (₹${netPayable.toFixed(2)})`}
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <InvoiceModal
        invoice={completedInvoice}
        onClose={() => setCompletedInvoice(null)}
      />
    </div>
  );
}

