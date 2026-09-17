import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import POSBilling from './components/POSBilling';
import InventoryManager from './components/InventoryManager';
import CustomerLedger from './components/CustomerLedger';
import SupplierOrders from './components/SupplierOrders';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SqlPlayground from './components/SqlPlayground';

import {
  RefreshCw,
  ShieldCheck,
  UserRound,
  LogOut,
  Store
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');

  // Demo login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [lowStockCount, setLowStockCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ---------------- REFRESH DATABASE ----------------

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchLowStock();
    }
  }, [refreshTrigger, isLoggedIn]);

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

  // ---------------- DEMO LOGIN ----------------

  const handleDemoLogin = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);

    // Admin opens Analytics Dashboard
    if (role === 'ADMIN') {
      setActiveTab('dashboard');
    }

    // Cashier opens POS
    if (role === 'CASHIER') {
      setActiveTab('pos');
    }
  };

  // ---------------- LOGOUT ----------------

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setActiveTab('pos');
  };

  // =========================================================
  // HOME / DEMO ROLE SELECTION
  // =========================================================

  if (!isLoggedIn) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #ecfdf5 0%, #f8fafc 50%, #d1fae5 100%)',
          padding: '30px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1100px',
            minHeight: '620px',
            background: '#ffffff',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 25px 70px rgba(15, 23, 42, 0.15)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr'
          }}
        >

          {/* =================================================
              LEFT BRANDING SECTION
          ================================================= */}

          <div
            style={{
              background:
                'linear-gradient(145deg, #064e3b, #047857, #10b981)',
              color: '#ffffff',
              padding: '60px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >

            {/* Logo */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px'
              }}
            >
              <Store size={32} />
            </div>

            {/* Brand */}
            <h1
              style={{
                fontSize: '58px',
                margin: '0 0 8px',
                fontWeight: 800,
                letterSpacing: '-2px'
              }}
            >
              Smart
              <span style={{ color: '#a7f3d0' }}>Biz</span>
            </h1>

            <h2
              style={{
                fontSize: '23px',
                margin: '0 0 20px',
                fontWeight: 600
              }}
            >
              Smart Business Management System
            </h2>

            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.7,
                color: '#d1fae5',
                maxWidth: '450px',
                margin: 0
              }}
            >
              A centralized DBMS-based platform designed to manage
              products, customers, suppliers, sales and business
              analytics efficiently.
            </p>

            {/* Feature Pills */}
            <div
              style={{
                marginTop: '38px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              {[
                'Inventory',
                'Sales',
                'Customers',
                'Suppliers',
                'Analytics'
              ].map(item => (
                <span
                  key={item}
                  style={{
                    padding: '9px 15px',
                    borderRadius: '30px',
                    background: 'rgba(255,255,255,0.13)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  ✓ {item}
                </span>
              ))}
            </div>

            {/* Tagline */}
            <p
              style={{
                marginTop: '45px',
                marginBottom: 0,
                color: '#a7f3d0',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '1px'
              }}
            >
              MANAGE TODAY • BUILD TOMORROW
            </p>

          </div>

          {/* =================================================
              RIGHT ROLE SELECTION SECTION
          ================================================= */}

          <div
            style={{
              padding: '60px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: '#ffffff'
            }}
          >

            {/* Heading */}
            <div style={{ marginBottom: '35px' }}>

              <p
                style={{
                  color: '#059669',
                  fontWeight: 800,
                  fontSize: '12px',
                  letterSpacing: '1.5px',
                  margin: '0 0 10px'
                }}
              >
                WELCOME TO SMARTBIZ
              </p>

              <h2
                style={{
                  fontSize: '34px',
                  margin: 0,
                  color: '#0f172a',
                  fontWeight: 800
                }}
              >
                Choose Your Role
              </h2>

              <p
                style={{
                  color: '#64748b',
                  marginTop: '10px',
                  marginBottom: 0,
                  fontSize: '15px'
                }}
              >
                Select a demo account to access SmartBiz.
              </p>

            </div>

            {/* =================================================
                ADMIN DEMO
            ================================================= */}

            <button
              onClick={() => handleDemoLogin('ADMIN')}
              style={{
                width: '100%',
                padding: '24px',
                marginBottom: '18px',
                borderRadius: '20px',
                border: '1px solid #a7f3d0',
                background: '#f0fdf4',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 12px 25px rgba(5, 150, 105, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >

              <div
                style={{
                  width: '60px',
                  height: '60px',
                  flexShrink: 0,
                  borderRadius: '17px',
                  background: '#047857',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={30} />
              </div>

              <div style={{ flex: 1 }}>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: '#064e3b',
                      fontSize: '20px',
                      fontWeight: 800
                    }}
                  >
                    Admin
                  </h3>

                  <span
                    style={{
                      padding: '4px 9px',
                      borderRadius: '20px',
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '10px',
                      fontWeight: 800
                    }}
                  >
                    DEMO
                  </span>
                </div>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#64748b',
                    fontSize: '14px'
                  }}
                >
                  Full business management access
                </p>

              </div>

              <span
                style={{
                  color: '#047857',
                  fontSize: '24px',
                  fontWeight: 700
                }}
              >
                →
              </span>

            </button>

            {/* =================================================
                CASHIER DEMO
            ================================================= */}

            <button
              onClick={() => handleDemoLogin('CASHIER')}
              style={{
                width: '100%',
                padding: '24px',
                borderRadius: '20px',
                border: '1px solid #ccfbf1',
                background: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 12px 25px rgba(15, 118, 110, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >

              <div
                style={{
                  width: '60px',
                  height: '60px',
                  flexShrink: 0,
                  borderRadius: '17px',
                  background: '#0f766e',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UserRound size={30} />
              </div>

              <div style={{ flex: 1 }}>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: '#0f172a',
                      fontSize: '20px',
                      fontWeight: 800
                    }}
                  >
                    Cashier
                  </h3>

                  <span
                    style={{
                      padding: '4px 9px',
                      borderRadius: '20px',
                      background: '#ccfbf1',
                      color: '#0f766e',
                      fontSize: '10px',
                      fontWeight: 800
                    }}
                  >
                    DEMO
                  </span>
                </div>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#64748b',
                    fontSize: '14px'
                  }}
                >
                  POS, sales and customer access
                </p>

              </div>

              <span
                style={{
                  color: '#0f766e',
                  fontSize: '24px',
                  fontWeight: 700
                }}
              >
                →
              </span>

            </button>

            {/* Footer */}
            <p
              style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '12px',
                marginTop: '35px',
                marginBottom: 0
              }}
            >
              Demo access • No password required
            </p>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  const getTabTitle = () => {
    switch (activeTab) {
      case 'pos':
        return {
          title: 'Point of Sale (POS) Billing',
          subtitle:
            'Fast barcode & product checkout with multi-payment tender'
        };

      case 'inventory':
        return {
          title: 'Inventory & Stock Catalog',
          subtitle:
            'Product pricing, margins, reorder limits, and categorizations'
        };

      case 'customers':
        return {
          title: 'Customer Ledger (Khata & Dues)',
          subtitle:
            'Manage customer credit limits, outstanding balances, and settlement'
        };

      case 'suppliers':
        return {
          title: 'Wholesale Suppliers & Inward Stock',
          subtitle:
            'Manage vendor procurement and automated restock purchase orders'
        };

      case 'dashboard':
        return {
          title: 'Executive Sales & Analytics Dashboard',
          subtitle:
            'Real-time revenue metrics, inventory valuation, and payment share'
        };

      case 'sql':
        return {
          title: 'Live DBMS SQL Playground & Viva Explorer',
          subtitle:
            'Execute and demonstrate JOINs, GROUP BY, HAVING, and Subqueries'
        };

      default:
        return {
          title: 'SmartBiz Business Management System',
          subtitle: 'DBMS Project'
        };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <div className="app-container">

      {/* Sidebar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        lowStockCount={lowStockCount}
      />

      {/* Main Area */}
      <div className="main-wrapper">

        {/* Header */}
        <header className="topbar">

          <div className="page-title-group">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="topbar-actions">

            {/* Current Role */}
            <span
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                background: '#ecfdf5',
                color: '#047857',
                fontWeight: 700,
                fontSize: '12px'
              }}
            >
              {userRole} • DEMO
            </span>

            {/* Refresh */}
            <button
              onClick={triggerRefresh}
              className="btn btn-secondary btn-sm"
              title="Refresh Data from Relational Database"
            >
              <RefreshCw size={14} />
              Refresh DB
            </button>

            {/* Database Status */}
            <div
              style={{
                fontSize: '0.8rem',
                color: '#64748b',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981'
                }}
              />

              Database Engine: Active
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Logout"
            >
              <LogOut size={14} />
              Logout
            </button>

          </div>

        </header>

        {/* Dynamic Content */}
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