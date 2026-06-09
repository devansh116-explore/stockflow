import React, { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, Package, Users, ShoppingCart, Activity, Menu, X } from 'lucide-react';
import { getSummary, getProducts, getCustomers, getOrders } from './services/api';
import Dashboard from './components/Dashboard';
import ProductsPanel from './components/ProductsPanel';
import CustomersPanel from './components/CustomersPanel';
import OrdersPanel from './components/OrdersPanel';
import Notification from './components/Notification';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
];

let notifCounter = 0;

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState({ total_products: 0, total_customers: 0, total_orders: 0, low_stock_products: 0 });
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const switchTab = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const notify = useCallback((type, message) => {
    const id = ++notifCounter;
    setNotifications((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissNotif = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [s, p, c, o] = await Promise.all([getSummary(), getProducts(), getCustomers(), getOrders()]);
      setSummary(s.data);
      setProducts(p.data);
      setCustomers(c.data);
      setOrders(o.data);
      setConnectionError(false);
    } catch {
      setConnectionError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="app-shell">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon" style={{ fontSize: '20px' }}>📦</div>
          <span className="brand-name">StockFlow</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`tab-${id}`}
              className={`nav-item ${activeTab === id ? 'nav-item--active' : ''}`}
              onClick={() => switchTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className={`status-dot ${connectionError ? 'status-dot--error' : 'status-dot--ok'}`} />
          <span>{connectionError ? 'API Disconnected' : 'API Connected'}</span>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <div>
              <h1 className="topbar-title">{TABS.find((t) => t.id === activeTab)?.label}</h1>
              <p className="topbar-sub">Inventory & Order Management</p>
            </div>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={refresh} aria-label="Refresh data">
            ↻ Refresh
          </button>
        </header>

        {connectionError && (
          <div className="connection-error">
            ⚠ Cannot reach the backend API. Make sure the server is running at{' '}
            <code>{import.meta.env.VITE_API_URL || 'http://localhost:8000'}</code>.
          </div>
        )}

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
            <p>Loading data…</p>
          </div>
        ) : (
          <main className="content-area">
            {activeTab === 'dashboard' && <Dashboard summary={summary} products={products} />}
            {activeTab === 'products' && <ProductsPanel products={products} onRefresh={refresh} onNotify={notify} />}
            {activeTab === 'customers' && <CustomersPanel customers={customers} onRefresh={refresh} onNotify={notify} />}
            {activeTab === 'orders' && <OrdersPanel orders={orders} products={products} customers={customers} onRefresh={refresh} onNotify={notify} />}
          </main>
        )}
      </div>

      {/* Notification toasts */}
      <Notification notifications={notifications} onDismiss={dismissNotif} />
    </div>
  );
}
