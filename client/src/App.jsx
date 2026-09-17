import React, { useState, useEffect, useCallback } from 'react';

import Navbar from './components/Navbar';
import SmartBizHome from './components/SmartBizHome';

import POSBilling from './components/POSBilling';
import InventoryManager from './components/InventoryManager';
import CustomerLedger from './components/CustomerLedger';
import SupplierOrders from './components/SupplierOrders';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SqlPlayground from './components/SqlPlayground';

import { RefreshCw, LogOut } from 'lucide-react';

function App() {
  // =========================================================
  // APP STATE
  // =========================================================

  const [activeTab, setActiveTab] = useState('pos');

  const [userRole, setUserRole] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [lowStockCount, setLowStockCount] = useState(0);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isRefreshing, setIsRefreshing] = useState(false);


  // =========================================================
  // REFRESH DATA
  // =========================================================

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);


  // =========================================================
  // FETCH LOW STOCK COUNT
  // Runs in background so login/dashboard is not blocked
  // =========================================================

  const fetchLowStock = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch('/api/analytics/low-stock');

      if (!response.ok) {
        console.log('Low stock API response:', response.status);
        return;
      }

      const data = await response.json();

      if (data?.success && Array.isArray(data.data)) {
        setLowStockCount(data.data.length);
      }

    } catch (error) {
      console.log('Could not fetch low stock count:', error);
    }
  }, [isLoggedIn]);


  // =========================================================
  // BACKGROUND LOW STOCK FETCH
  // Small delay prevents API call from competing with
  // initial dashboard rendering
  // =========================================================

  useEffect(() => {
    if (!isLoggedIn) return;

    const timer = setTimeout(() => {
      fetchLowStock();
    }, 300);

    return () => clearTimeout(timer);

  }, [isLoggedIn, refreshTrigger, fetchLowStock]);


  // =========================================================
  // DEMO LOGIN
  // =========================================================

  const handleDemoLogin = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);

    // Admin opens Analytics Dashboard
    if (role === 'ADMIN') {
      setActiveTab('dashboard');
    }

    // Cashier opens POS
    else {
      setActiveTab('pos');
    }
  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setActiveTab('pos');
    setLowStockCount(0);
    setIsRefreshing(false);
  };


  // =========================================================
  // REFRESH HANDLER
  // =========================================================

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    triggerRefresh();

    // Small visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };


  // =========================================================
  // LANDING PAGE
  // =========================================================

  if (!isLoggedIn) {
    return (
      <SmartBizHome
        onLogin={handleDemoLogin}
      />
    );
  }


  // =========================================================
  // TAB TITLE + SUBTITLE
  // =========================================================

  const getTabTitle = () => {

    switch (activeTab) {

      case 'pos':
        return {
          title: 'Point of Sale (POS) Billing',
          subtitle:
            'Fast and efficient billing, sales and payment management'
        };

      case 'inventory':
        return {
          title: 'Inventory & Stock Catalog',
          subtitle:
            'Manage products, pricing, stock levels and reorder limits'
        };

      case 'customers':
        return {
          title: 'Customer Ledger (Khata & Dues)',
          subtitle:
            'Manage customer credit, outstanding balances and payments'
        };

      case 'suppliers':
        return {
          title: 'Wholesale Suppliers & Inward Stock',
          subtitle:
            'Manage suppliers, purchase orders and incoming inventory'
        };

      case 'dashboard':
        return {
          title: 'Executive Sales & Analytics Dashboard',
          subtitle:
            'Real-time revenue metrics, inventory valuation and payment insights'
        };

      case 'sql':
        return {
          title: 'Live DBMS SQL Playground & Viva Explorer',
          subtitle:
            'Execute and demonstrate JOINs, GROUP BY, HAVING and Subqueries'
        };

      default:
        return {
          title: 'SmartBiz Business Management System',
          subtitle:
            'Smart Business Management System'
        };
    }
  };


  const { title, subtitle } = getTabTitle();


  // =========================================================
  // RENDER ACTIVE CONTENT
  // =========================================================

  const renderContent = () => {

    switch (activeTab) {

      case 'pos':
        return (
          <POSBilling
            onSaleComplete={triggerRefresh}
          />
        );

      case 'inventory':
        return (
          <InventoryManager
            refreshTrigger={refreshTrigger}
          />
        );

      case 'customers':
        return (
          <CustomerLedger
            refreshTrigger={refreshTrigger}
          />
        );

      case 'suppliers':
        return (
          <SupplierOrders
            refreshTrigger={refreshTrigger}
          />
        );

      case 'dashboard':
        return (
          <AnalyticsDashboard
            refreshTrigger={refreshTrigger}
          />
        );

      case 'sql':
        return (
          <SqlPlayground
            refreshTrigger={refreshTrigger}
          />
        );

      default:
        return (
          <POSBilling
            onSaleComplete={triggerRefresh}
          />
        );
    }
  };


  // =========================================================
  // MAIN APP
  // =========================================================

  return (
    <div className="app-container">

      {/* =====================================================
          NAVBAR / SIDEBAR
          ===================================================== */}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        lowStockCount={lowStockCount}
      />


      {/* =====================================================
          MAIN WRAPPER
          ===================================================== */}

      <div className="main-wrapper">

        {/* ===================================================
            TOP BAR
            =================================================== */}

        <header className="topbar">

          {/* Page Heading */}

          <div className="page-title-group">

            <h1>
              {title}
            </h1>

            <p>
              {subtitle}
            </p>

          </div>


          {/* =================================================
              TOP BAR ACTIONS
              ================================================= */}

          <div className="topbar-actions">

            {/* ROLE BADGE */}

            <span
              style={{
                padding: '7px 13px',
                borderRadius: '999px',

                background:
                  userRole === 'ADMIN'
                    ? '#eef2ff'
                    : '#ecfeff',

                color:
                  userRole === 'ADMIN'
                    ? '#4f46e5'
                    : '#0891b2',

                fontWeight: 700,
                fontSize: '12px'
              }}
            >
              {userRole === 'ADMIN'
                ? 'Admin Demo'
                : 'Cashier Demo'}
            </span>


            {/* REFRESH BUTTON */}

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh data"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: isRefreshing
                  ? 'not-allowed'
                  : 'pointer',
                opacity: isRefreshing ? 0.7 : 1
              }}
            >

              <RefreshCw
                size={15}
                style={{
                  animation: isRefreshing
                    ? 'smartbiz-spin 0.8s linear infinite'
                    : 'none'
                }}
              />

              {isRefreshing
                ? 'Refreshing...'
                : 'Refresh Data'}

            </button>


            {/* DATABASE STATUS */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b'
              }}
            >

              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'inline-block'
                }}
              />

              Database Active

            </div>


            {/* LOGOUT */}

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
              title="Return to SmartBiz home"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >

              <LogOut size={15} />

              Logout

            </button>

          </div>

        </header>


        {/* ===================================================
            MAIN CONTENT
            =================================================== */}

        <main className="content-body">

          {renderContent()}

        </main>

      </div>


      {/* =====================================================
          REFRESH ICON ANIMATION
          ===================================================== */}

      <style>
        {`
          @keyframes smartbiz-spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

    </div>
  );
}

export default App;