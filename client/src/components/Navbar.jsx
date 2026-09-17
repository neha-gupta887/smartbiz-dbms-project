import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  Database,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  lowStockCount
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'pos',
      label: 'POS Billing',
      mobileLabel: 'POS',
      icon: ShoppingCart
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      mobileLabel: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null
    },
    {
      id: 'customers',
      label: 'Customer Khata',
      mobileLabel: 'Customers',
      icon: Users
    },
    {
      id: 'suppliers',
      label: 'Suppliers & Purchases',
      mobileLabel: 'Suppliers',
      icon: Truck
    },
    {
      id: 'dashboard',
      label: 'Sales & Analytics',
      mobileLabel: 'Analytics',
      icon: LayoutDashboard
    },
    {
      id: 'sql',
      label: 'DBMS SQL Playground',
      mobileLabel: 'SQL',
      icon: Database,
      isSpecial: true
    }
  ];

  const handleNavigation = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const switchRole = () => {
    setUserRole(userRole === 'ADMIN' ? 'CASHIER' : 'ADMIN');
  };

  return (
    <>
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>

        {/* =====================================================
            BRAND
        ===================================================== */}
        <div className="brand-section">

          <div className="brand-logo">
            <Database size={22} />
          </div>

          <div className="brand-text">
            <div className="brand-title">
              SmartBiz
            </div>

            <div className="brand-subtitle">
              DBMS Retail Engine
            </div>
          </div>

          {/* Mobile close button */}
          <button
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>

        </div>


        {/* =====================================================
            NAVIGATION
        ===================================================== */}
        <nav className="nav-links">

          {navItems.map((item) => {

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  nav-item
                  ${isActive ? 'active' : ''}
                  ${item.isSpecial ? 'special-tab' : ''}
                `}
              >

                <Icon size={18} />

                {/* Desktop text */}
                <span className="nav-label-desktop">
                  {item.label}
                </span>

                {/* Mobile text */}
                <span className="nav-label-mobile">
                  {item.mobileLabel}
                </span>

                {item.badge && (
                  <span className="nav-badge">
                    {item.badge}
                  </span>
                )}

              </button>
            );
          })}

        </nav>


        {/* =====================================================
            USER ROLE
        ===================================================== */}
        <div className="sidebar-footer">

          <div className="user-pill">

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: 0
              }}
            >

              <UserCheck
                size={16}
                color="#94a3b8"
              />

              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userRole === 'ADMIN'
                  ? 'Rajesh (Admin)'
                  : 'Pooja (Cashier)'}
              </div>

            </div>

            <span
              className={`
                role-tag
                ${userRole === 'ADMIN'
                  ? 'role-admin'
                  : 'role-cashier'}
              `}
            >
              {userRole}
            </span>

          </div>


          <button
            onClick={switchRole}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              marginTop: '10px',
              fontSize: '0.75rem'
            }}
          >
            Switch to{' '}
            {userRole === 'ADMIN'
              ? 'Cashier Mode'
              : 'Admin Mode'}
          </button>

        </div>

      </aside>


      {/* =======================================================
          MOBILE HEADER
      ======================================================= */}
      <div className="mobile-dashboard-header">

        <div className="mobile-dashboard-brand">

          <div className="mobile-brand-icon">
            <Database size={18} />
          </div>

          <div>
            <div className="mobile-brand-title">
              SmartBiz
            </div>

            <div className="mobile-brand-subtitle">
              {userRole === 'ADMIN'
                ? 'Admin Demo'
                : 'Cashier Demo'}
            </div>
          </div>

        </div>


        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={23} />
        </button>

      </div>


      {/* =======================================================
          MOBILE OVERLAY
      ======================================================= */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}