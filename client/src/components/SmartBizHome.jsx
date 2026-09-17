import React, { useState } from 'react';

import {
  ArrowRight,
  Package,
  Users,
  Truck,
  ShoppingCart,
  BarChart3,
  Database,
  ShieldCheck,
  Zap,
  CheckCircle2,
  LayoutDashboard,
  X
} from 'lucide-react';

function SmartBizHome({ onLogin }) {
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Open role selection
  const openRoleSelector = () => {
    setShowRoleSelector(true);
  };

  // Close role selection
  const closeRoleSelector = () => {
    setShowRoleSelector(false);
  };

  // Demo login
  const handleDemoLogin = (role) => {
    setShowRoleSelector(false);
    onLogin(role);
  };

  return (
    <div className="smartbiz-home">

      {/* ================= NAVBAR ================= */}
      <nav className="smartbiz-navbar">

        {/* Logo */}
        <div className="smartbiz-logo">

          <div className="smartbiz-logo-icon">
            <Database size={22} />
          </div>

          <div>
            <div className="smartbiz-logo-text">
              SmartBiz
            </div>

            <div className="smartbiz-logo-subtitle">
              Business Management
            </div>
          </div>

        </div>

        {/* Navigation Links */}
        <div className="smartbiz-nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#features">
            Features
          </a>

          <a href="#solutions">
            Solutions
          </a>

          <a href="#about">
            About
          </a>

        </div>

        {/* Demo Login */}
        <button
          className="smartbiz-nav-button"
          onClick={openRoleSelector}
        >
          Demo Login
          <ArrowRight size={17} />
        </button>

      </nav>


      {/* ================= HERO SECTION ================= */}
      <section
        className="smartbiz-hero"
        id="home"
      >

        <div className="smartbiz-hero-content">

          {/* Badge */}
          <div className="smartbiz-badge">
            <Zap size={15} />
            Smart Business Management System
          </div>


          {/* Heading */}
          <h1>
            Manage Your Business.
            <br />

            <span>
              Smarter. Faster.
            </span>
          </h1>


          {/* Description */}
          <p>
            SmartBiz brings sales, inventory, customers,
            suppliers and analytics together in one
            powerful business management platform.
          </p>


          {/* Buttons */}
          <div className="smartbiz-hero-buttons">

            <button
              className="smartbiz-primary-button"
              onClick={openRoleSelector}
            >
              Get Started
              <ArrowRight size={18} />
            </button>


            <a
              href="#features"
              className="smartbiz-secondary-button"
            >
              Explore Features
            </a>

          </div>


          {/* Trust Row */}
          <div className="smartbiz-trust-row">

            <div>
              <CheckCircle2 size={17} />
              Easy to Use
            </div>

            <div>
              <CheckCircle2 size={17} />
              Real-Time Data
            </div>

            <div>
              <CheckCircle2 size={17} />
              Secure
            </div>

          </div>

        </div>


        {/* ================= DASHBOARD PREVIEW ================= */}
        <div className="smartbiz-dashboard-preview">

          <div className="smartbiz-preview-window">

            {/* Browser Header */}
            <div className="smartbiz-preview-header">

              <div className="smartbiz-window-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="smartbiz-preview-url">
                smartbiz.local/dashboard
              </div>

            </div>


            {/* Dashboard */}
            <div className="smartbiz-preview-dashboard">

              {/* Sidebar */}
              <div className="smartbiz-preview-sidebar">

                <div className="smartbiz-preview-brand">
                  <Database size={15} />
                  SmartBiz
                </div>

                <div className="smartbiz-preview-nav active">
                  <LayoutDashboardIcon />
                  Dashboard
                </div>

                <div className="smartbiz-preview-nav">
                  <ShoppingCart size={14} />
                  Sales
                </div>

                <div className="smartbiz-preview-nav">
                  <Package size={14} />
                  Inventory
                </div>

                <div className="smartbiz-preview-nav">
                  <Users size={14} />
                  Customers
                </div>

                <div className="smartbiz-preview-nav">
                  <Truck size={14} />
                  Suppliers
                </div>

              </div>


              {/* Preview Main */}
              <div className="smartbiz-preview-main">

                <div className="smartbiz-preview-title">
                  <div>
                    <h3>Business Overview</h3>
                    <span>
                      Here's what's happening today
                    </span>
                  </div>

                  <div className="smartbiz-preview-date">
                    Today
                  </div>
                </div>


                {/* Stats */}
                <div className="smartbiz-preview-stats">

                  <PreviewStat
                    title="Total Sales"
                    value="₹48,250"
                    growth="+12.5%"
                  />

                  <PreviewStat
                    title="Orders"
                    value="126"
                    growth="+8.2%"
                  />

                  <PreviewStat
                    title="Customers"
                    value="842"
                    growth="+5.4%"
                  />

                </div>


                {/* Chart */}
                <div className="smartbiz-preview-chart">

                  <div className="chart-heading">
                    <span>Sales Overview</span>
                    <span>This Week</span>
                  </div>

                  <div className="chart-bars">

                    <div style={{ height: '38%' }}></div>
                    <div style={{ height: '55%' }}></div>
                    <div style={{ height: '46%' }}></div>
                    <div style={{ height: '72%' }}></div>
                    <div style={{ height: '62%' }}></div>
                    <div style={{ height: '88%' }}></div>
                    <div style={{ height: '76%' }}></div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section
        className="smartbiz-features"
        id="features"
      >

        <div className="smartbiz-section-heading">

          <span>
            POWERFUL FEATURES
          </span>

          <h2>
            Everything Your Business Needs
          </h2>

          <p>
            Manage your complete business workflow
            from one simple and powerful platform.
          </p>

        </div>


        <div className="smartbiz-feature-grid">

          <FeatureCard
            icon={<ShoppingCart />}
            title="Sales & POS"
            description="Create bills, manage transactions and handle daily sales efficiently."
          />

          <FeatureCard
            icon={<Package />}
            title="Inventory"
            description="Track products, stock levels and low-stock items in real time."
          />

          <FeatureCard
            icon={<Users />}
            title="Customers"
            description="Manage customer information, payments and outstanding dues."
          />

          <FeatureCard
            icon={<Truck />}
            title="Suppliers"
            description="Track suppliers and manage wholesale stock purchases."
          />

          <FeatureCard
            icon={<BarChart3 />}
            title="Analytics"
            description="Understand your business performance through useful insights."
          />

          <FeatureCard
            icon={<Database />}
            title="SQL Explorer"
            description="Explore your database and demonstrate DBMS concepts interactively."
          />

        </div>

      </section>


      {/* ================= SOLUTIONS ================= */}
      <section
        className="smartbiz-solutions"
        id="solutions"
      >

        <div className="smartbiz-solution-content">

          <div className="smartbiz-solution-text">

            <span>
              BUILT FOR MODERN BUSINESSES
            </span>

            <h2>
              One Platform.
              <br />
              Complete Control.
            </h2>

            <p>
              SmartBiz connects every important part
              of your business workflow so you can spend
              less time managing data and more time
              growing your business.
            </p>


            <div className="smartbiz-check-list">

              <div>
                <CheckCircle2 size={19} />
                Centralized business data
              </div>

              <div>
                <CheckCircle2 size={19} />
                Faster billing and sales management
              </div>

              <div>
                <CheckCircle2 size={19} />
                Better inventory visibility
              </div>

              <div>
                <CheckCircle2 size={19} />
                Data-driven business insights
              </div>

            </div>

          </div>


          {/* Solution Card */}
          <div className="smartbiz-solution-card">

            <div className="solution-card-icon">
              <ShieldCheck size={30} />
            </div>

            <h3>
              Simple. Secure. Smart.
            </h3>

            <p>
              Designed with a clean interface and
              structured database architecture to make
              business management easier.
            </p>


            <div className="solution-mini-stats">

              <div>
                <strong>6+</strong>
                <span>Modules</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Digital</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>Access</span>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= ABOUT ================= */}
      <section
        className="smartbiz-about"
        id="about"
      >

        <div className="smartbiz-section-heading">

          <span>
            ABOUT SMARTBIZ
          </span>

          <h2>
            Built to Simplify Business Management
          </h2>

          <p>
            SmartBiz is a DBMS-powered business management
            solution designed to bring essential business
            operations together in one platform.
          </p>

        </div>


        <div className="smartbiz-about-stats">

          <div>
            <strong>6+</strong>
            <span>Business Modules</span>
          </div>

          <div>
            <strong>1</strong>
            <span>Unified Platform</span>
          </div>

          <div>
            <strong>100%</strong>
            <span>Digital Workflow</span>
          </div>

          <div>
            <strong>∞</strong>
            <span>Possibilities</span>
          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="smartbiz-cta">

        <div>

          <div className="smartbiz-cta-icon">
            <Zap size={25} />
          </div>

          <h2>
            Ready to Manage Your Business Smarter?
          </h2>

          <p>
            Explore SmartBiz through our interactive demo.
          </p>

          <button
            className="smartbiz-primary-button"
            onClick={openRoleSelector}
          >
            Try SmartBiz Demo
            <ArrowRight size={18} />
          </button>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="smartbiz-footer">

        <div className="smartbiz-footer-brand">

          <div className="smartbiz-logo">

            <div className="smartbiz-logo-icon">
              <Database size={20} />
            </div>

            <div>
              <div className="smartbiz-logo-text">
                SmartBiz
              </div>

              <div className="smartbiz-logo-subtitle">
                Business Management
              </div>
            </div>

          </div>

          <p>
            Smart management. Better business.
          </p>

        </div>


        <div className="smartbiz-footer-links">

          <a href="#home">
            Home
          </a>

          <a href="#features">
            Features
          </a>

          <a href="#solutions">
            Solutions
          </a>

          <a href="#about">
            About
          </a>

        </div>


        <div className="smartbiz-footer-copy">
          © 2026 SmartBiz. DBMS Project.
        </div>

      </footer>


      {/* ================= ROLE SELECTOR MODAL ================= */}
      {showRoleSelector && (

        <div
          className="smartbiz-role-overlay"
          onClick={closeRoleSelector}
        >

          <div
            className="smartbiz-role-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Close */}
            <button
              className="smartbiz-role-close"
              onClick={closeRoleSelector}
            >
              <X size={20} />
            </button>


            {/* Heading */}
            <div className="smartbiz-role-header">

              <div className="smartbiz-role-icon">
                <Database size={25} />
              </div>

              <h2>
                Choose Your Demo
              </h2>

              <p>
                Select a role to explore SmartBiz.
                No password required.
              </p>

            </div>


            {/* Role Cards */}
            <div className="smartbiz-role-cards">

              {/* Admin */}
              <button
                className="smartbiz-role-card"
                onClick={() => handleDemoLogin('ADMIN')}
              >

                <div className="smartbiz-role-card-icon admin-icon">
                  <ShieldCheck size={28} />
                </div>

                <div className="smartbiz-role-card-content">

                  <div className="role-card-title-row">
                    <h3>
                      Admin
                    </h3>

                    <span>
                      DEMO
                    </span>
                  </div>

                  <p>
                    Full access to business management,
                    inventory, suppliers, analytics and SQL.
                  </p>

                  <div className="role-card-access">
                    <CheckCircle2 size={15} />
                    Full Business Access
                  </div>

                </div>

                <ArrowRight size={20} />

              </button>


              {/* Cashier */}
              <button
                className="smartbiz-role-card"
                onClick={() => handleDemoLogin('CASHIER')}
              >

                <div className="smartbiz-role-card-icon cashier-icon">
                  <ShoppingCart size={28} />
                </div>

                <div className="smartbiz-role-card-content">

                  <div className="role-card-title-row">

                    <h3>
                      Cashier
                    </h3>

                    <span>
                      DEMO
                    </span>

                  </div>

                  <p>
                    Handle POS billing, sales, customers
                    and customer payments.
                  </p>

                  <div className="role-card-access">
                    <CheckCircle2 size={15} />
                    Sales & POS Access
                  </div>

                </div>

                <ArrowRight size={20} />

              </button>

            </div>


            <div className="smartbiz-demo-note">
              <ShieldCheck size={15} />
              Demo access — no email or password required.
            </div>

          </div>

        </div>

      )}

    </div>
  );
}


/* ================= FEATURE CARD ================= */

function FeatureCard({
  icon,
  title,
  description
}) {

  return (
    <div className="smartbiz-feature-card">

      <div className="smartbiz-feature-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

      <div className="feature-arrow">
        <ArrowRight size={17} />
      </div>

    </div>
  );
}


/* ================= PREVIEW STAT ================= */

function PreviewStat({
  title,
  value,
  growth
}) {

  return (
    <div className="smartbiz-preview-stat">

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {growth}
      </small>

    </div>
  );
}


/* ================= DASHBOARD ICON ================= */

function LayoutDashboardIcon() {

  return (
    <LayoutDashboard
      size={14}
    />
  );
}


export default SmartBizHome;