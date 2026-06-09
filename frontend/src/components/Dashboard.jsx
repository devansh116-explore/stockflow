import React from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, TrendingDown } from 'lucide-react';
import StatCard from './StatCard';

export default function Dashboard({ summary, products }) {
  const lowStockItems = products.filter((p) => p.quantity < 5);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Overview</h2>
        <p className="panel-subtitle">Real-time inventory and order metrics</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Products" value={summary.total_products} icon={Package} accent="#6366f1" />
        <StatCard title="Total Customers" value={summary.total_customers} icon={Users} accent="#0ea5e9" />
        <StatCard title="Total Orders" value={summary.total_orders} icon={ShoppingCart} accent="#10b981" />
        <StatCard
          title="Low Stock"
          value={summary.low_stock_products}
          icon={AlertTriangle}
          accent={summary.low_stock_products > 0 ? '#f59e0b' : '#10b981'}
        />
      </div>

      {lowStockItems.length > 0 && (
        <div className="low-stock-section">
          <div className="section-title-row">
            <TrendingDown size={18} className="icon-warning" />
            <h3 className="section-title">Low Stock Alerts</h3>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td><span className="badge badge--grey font-mono">{p.sku}</span></td>
                    <td className="font-mono">₹{Number(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge--red' : 'badge--yellow'}`}>
                        {p.quantity === 0 ? 'Out of stock' : `${p.quantity} left`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lowStockItems.length === 0 && summary.total_products > 0 && (
        <div className="empty-state empty-state--success">
          <Package size={32} />
          <p>All products are well stocked!</p>
        </div>
      )}
    </div>
  );
}
