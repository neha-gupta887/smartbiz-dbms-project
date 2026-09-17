import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  Database, 
  UserCheck, 
  AlertTriangle 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, userRole, setUserRole, lowStockCount }) {
  const navItems = [
    { id: 'pos', label: 'POS Billing', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null },
    { id: 'customers', label: 'Customer Khata', icon: Users },
    { id: 'suppliers', label: 'Suppliers & Purchases', icon: Truck },
    { id: 'dashboard', label: 'Sales & Analytics', icon: LayoutDashboard },
    { id: 'sql', label: 'DBMS SQL Playground', icon: Database, isSpecial: true },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-section">
        <div className="brand-logo">
          <Database size={22} />
        </div>
        <div>
          <div className="brand-title">SmartBiz</div>
          <div className="brand-subtitle">DBMS Retail Engine</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''} ${item.isSpecial ? 'special-tab' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Role Switcher */}
      <div className="sidebar-footer">
        <div className="user-pill">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={16} color="#94a3b8" />
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {userRole === 'ADMIN' ? 'Rajesh (Admin)' : 'Pooja (Cashier)'}
            </div>
          </div>
          <span className={`role-tag ${userRole === 'ADMIN' ? 'role-admin' : 'role-cashier'}`}>
            {userRole}
          </span>
        </div>
        <button
          onClick={() => setUserRole(userRole === 'ADMIN' ? 'CASHIER' : 'ADMIN')}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', marginTop: '10px', fontSize: '0.75rem' }}
        >
          Switch to {userRole === 'ADMIN' ? 'Cashier Mode' : 'Admin Mode'}
        </button>
      </div>
    </aside>
  );
}
