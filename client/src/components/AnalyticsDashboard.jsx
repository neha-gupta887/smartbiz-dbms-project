import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertCircle, 
  Package, 
  CreditCard, 
  PieChart, 
  DollarSign, 
  ArrowUpRight,
  Receipt
} from 'lucide-react';

export default function AnalyticsDashboard({ refreshTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [refreshTrigger]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/dashboard');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
        <TrendingUp size={40} style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 12px auto' }} />
        <p style={{ fontWeight: 600 }}>Loading business data......</p>
      </div>
    );
  }

  return (
    <div>
      {/* 4 Primary KPI Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-label">Gross Sales Revenue</div>
            <div className="stat-val">₹{Number(data.total_revenue).toFixed(2)}</div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> Across {data.total_orders} total orders
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <Package size={24} />
          </div>
          <div>
            <div className="stat-label">Live Inventory Value</div>
            <div className="stat-val">₹{Number(data.inventory_value).toFixed(2)}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              {data.total_stock_units} units in {data.total_products} items
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div className="stat-label">Customer Debt (Khata Due)</div>
            <div className="stat-val" style={{ color: data.customer_debt > 0 ? '#ef4444' : '#1e293b' }}>
              ₹{Number(data.customer_debt).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600, marginTop: '2px' }}>
              Pending receivables to collect
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: data.low_stock_count > 0 ? '#fffbeb' : '#f1f5f9', color: data.low_stock_count > 0 ? '#f59e0b' : '#64748b' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="stat-label">Low Stock Alerts</div>
            <div className="stat-val" style={{ color: data.low_stock_count > 0 ? '#f59e0b' : '#1e293b' }}>
              {data.low_stock_count} Items
            </div>
            <div style={{ fontSize: '0.72rem', color: data.low_stock_count > 0 ? '#f59e0b' : '#10b981', fontWeight: 600, marginTop: '2px' }}>
              {data.low_stock_count > 0 ? 'Requires vendor reorder' : 'All stock levels healthy'}
            </div>
          </div>
        </div>
      </div>

      {/* Mid Section: Top Products & Category Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Top Selling Products */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} color="#4f46e5" /> Top 5 Best-Selling Products by Revenue
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Units Sold</th>
                  <th style={{ textAlign: 'right' }}>Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {data.top_products.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No sales data yet</td></tr>
                ) : (
                  data.top_products.map((tp, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{tp.product_name}</td>
                      <td><span className="badge badge-info">{tp.category_name}</span></td>
                      <td style={{ fontWeight: 700 }}>{tp.units_sold} units</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#4f46e5' }}>₹{Number(tp.revenue).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#0ea5e9" /> Revenue by Payment Mode
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data.payment_modes.map((pm, idx) => {
              const pct = data.total_revenue > 0 ? ((pm.total_collected / data.total_revenue) * 100).toFixed(1) : 0;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{pm.payment_mode} ({pm.txn_count} Txns)</span>
                    <span style={{ fontWeight: 700 }}>₹{Number(pm.total_collected).toFixed(2)} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(5, pct))}%`,
                        height: '100%',
                        background: pm.payment_mode === 'UPI' ? '#4f46e5' : pm.payment_mode === 'CASH' ? '#10b981' : '#0ea5e9',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Invoices */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Receipt size={18} color="#10b981" /> Recent Sales Transactions
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date & Time</th>
                <th>Customer Name</th>
                <th>Net Payable</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders.map(o => (
                <tr key={o.order_id}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#4f46e5' }}>{o.invoice_number}</td>
                  <td>{new Date(o.order_date).toLocaleString()}</td>
                  <td>{o.customer_name}</td>
                  <td style={{ fontWeight: 700 }}>₹{Number(o.net_payable).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${o.payment_status === 'PAID' ? 'badge-success' : o.payment_status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>
                      {o.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
