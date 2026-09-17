import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import POSBilling from './components/POSBilling';
import InventoryManager from './components/InventoryManager';
import CustomerLedger from './components/CustomerLedger';
import SupplierOrders from './components/SupplierOrders';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SqlPlayground from './components/SqlPlayground';
import { ShoppingCart, Package, Users, Truck, LayoutDashboard, Database, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [userRole, setUserRole] = useState('ADMIN'); // 'ADMIN' or 'CASHIER'
  const [lowStockCount, setLowStockCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Trigger global re-fetch of indicators
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    fetchLowStock();
  }, [refreshTrigger]);

  const fetchLowStock = async () => {
    try {
      const res = await fetch('/api/analytics/low-stock');
      const json = await res.json();
      if (json.success) {
        setLowStockCount(json.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch low stock count:', err);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pos':
        return { title: 'Point of Sale (POS) Billing', subtitle: 'Fast barcode & product checkout with multi-payment tender' };
      case 'inventory':
        return { title: 'Inventory & Stock Catalog', subtitle: 'Product pricing, margins, reorder limits, and categorizations' };
      case 'customers':
        return { title: 'Customer Ledger (Khata & Dues)', subtitle: 'Manage customer credit limits, outstanding balances, and settlement' };
      case 'suppliers':
        return { title: 'Wholesale Suppliers & Inward Stock', subtitle: 'Manage vendor procurement and automated restock purchase orders' };
      case 'dashboard':
        return { title: 'Executive Sales & Analytics Dashboard', subtitle: 'Real-time revenue metrics, inventory valuation, and payment share' };
      case 'sql':
        return { title: 'Live DBMS SQL Playground & Viva Explorer', subtitle: 'Execute and demonstrate JOINs, GROUP BY, HAVING, and Subqueries' };
      default:
        return { title: 'SmartBiz Business Management System', subtitle: 'DBMS Project' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <div className="app-container">
      {/* Left Sidebar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="page-title-group">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="topbar-actions">
            <button
              onClick={triggerRefresh}
              className="btn btn-secondary btn-sm"
              title="Refresh Data from Relational Database"
            >
              <RefreshCw size={14} /> Refresh DB
            </button>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              Database Engine: Active
            </div>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main className="content-body">
          {activeTab === 'pos' && (
            <POSBilling
              onSaleComplete={triggerRefresh}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager
              onInventoryChange={triggerRefresh}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerLedger
              onCustomerChange={triggerRefresh}
            />
          )}

          {activeTab === 'suppliers' && (
            <SupplierOrders
              onSupplierRestock={triggerRefresh}
            />
          )}

          {activeTab === 'dashboard' && (
            <AnalyticsDashboard
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'sql' && (
            <SqlPlayground />
          )}
        </main>
      </div>
    </div>
  );
}
