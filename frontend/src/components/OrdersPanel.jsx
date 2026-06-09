import React, { useState } from 'react';
import { Plus, ShoppingCart, ChevronRight, Trash2 } from 'lucide-react';
import { createOrder, deleteOrder } from '../services/api';
import Modal from './Modal';

function validate(data) {
  const errors = {};
  if (!data.customer_id) errors.customer_id = 'Please select a customer.';
  if (!data.product_id) errors.product_id = 'Please select a product.';
  if (!data.quantity || isNaN(data.quantity) || Number(data.quantity) < 1) errors.quantity = 'Quantity must be at least 1.';
  return errors;
}

export default function OrdersPanel({ orders, products, customers, onRefresh, onNotify }) {
  const [form, setForm] = useState({ customer_id: '', product_id: '', quantity: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    setSubmitting(true);
    try {
      await createOrder({
        customer_id: Number(form.customer_id),
        items: [{ product_id: Number(form.product_id), quantity: Number(form.quantity) }],
      });
      setForm({ customer_id: '', product_id: '', quantity: '' });
      onNotify('success', 'Order placed successfully. Inventory updated.');
      onRefresh();
    } catch (err) {
      onNotify('error', err.response?.data?.detail || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id);
      setConfirmDeleteId(null);
      if (detailOrder?.id === id) setDetailOrder(null);
      onNotify('success', 'Order deleted.');
      onRefresh();
    } catch (err) {
      onNotify('error', err.response?.data?.detail || 'Failed to delete order.');
    }
  };

  const getCustomerName = (id) => customers.find((c) => c.id === id)?.full_name || `Customer #${id}`;
  const getProductName = (id) => products.find((p) => p.id === id)?.name || `Product #${id}`;

  const statusColor = (s) => ({ COMPLETED: 'badge--green', PENDING: 'badge--yellow', CANCELLED: 'badge--red' }[s] || 'badge--grey');

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Orders</h2>
        <p className="panel-subtitle">Create and track customer orders</p>
      </div>

      {/* Create Order Form */}
      <div className="card">
        <h3 className="card-title"><Plus size={16} /> Create New Order</h3>
        <form onSubmit={handleCreate} className="form-grid" noValidate>
          <div className="form-group">
            <label htmlFor="order-customer">Customer</label>
            <select id="order-customer" name="customer_id" value={form.customer_id} onChange={handleChange} className={formErrors.customer_id ? 'input-error' : ''}>
              <option value="">Select a customer…</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
            </select>
            {formErrors.customer_id && <span className="field-error">{formErrors.customer_id}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="order-product">Product</label>
            <select id="order-product" name="product_id" value={form.product_id} onChange={handleChange} className={formErrors.product_id ? 'input-error' : ''}>
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                  {p.name} — ₹{Number(p.price).toFixed(2)} — {p.quantity === 0 ? 'Out of stock' : `${p.quantity} in stock`}
                </option>
              ))}
            </select>
            {formErrors.product_id && <span className="field-error">{formErrors.product_id}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="order-qty">Quantity</label>
            <input id="order-qty" name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} placeholder="1" className={formErrors.quantity ? 'input-error' : ''} />
            {formErrors.quantity && <span className="field-error">{formErrors.quantity}</span>}
          </div>
          <button type="submit" className="btn btn--primary form-submit" disabled={submitting || customers.length === 0 || products.length === 0}>
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
        {(customers.length === 0 || products.length === 0) && (
          <p className="hint-text">You need at least one customer and one product before creating an order.</p>
        )}
      </div>

      {/* Orders List */}
      <div className="card">
        <h3 className="card-title"><ShoppingCart size={16} /> All Orders ({orders.length})</h3>
        {orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={40} />
            <p>No orders yet. Create one above.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="clickable-row" onClick={() => setDetailOrder(o)}>
                    <td className="font-medium font-mono">#{o.id}</td>
                    <td>{getCustomerName(o.customer_id)}</td>
                    <td>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                    <td className="font-mono">₹{Number(o.total_amount).toFixed(2)}</td>
                    <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                    <td className="action-cell" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn--icon" onClick={() => setDetailOrder(o)} title="View details" aria-label="View order details">
                        <ChevronRight size={15} />
                      </button>
                      <button className="btn btn--icon btn--danger" onClick={() => setConfirmDeleteId(o.id)} title="Delete order" aria-label={`Delete order #${o.id}`}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {detailOrder && (
        <Modal title={`Order #${detailOrder.id} Details`} onClose={() => setDetailOrder(null)}>
          <div className="order-detail">
            <div className="detail-meta">
              <div className="detail-meta-item">
                <span className="detail-label">Customer</span>
                <span className="detail-value">{getCustomerName(detailOrder.customer_id)}</span>
              </div>
              <div className="detail-meta-item">
                <span className="detail-label">Status</span>
                <span className={`badge ${statusColor(detailOrder.status)}`}>{detailOrder.status}</span>
              </div>
              <div className="detail-meta-item">
                <span className="detail-label">Order Total</span>
                <span className="detail-value font-bold font-mono">₹{Number(detailOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <h4 className="order-items-title">Line Items</h4>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td>{getProductName(item.product_id)}</td>
                      <td>{item.quantity}</td>
                      <td className="font-mono">₹{Number(item.unit_price).toFixed(2)}</td>
                      <td className="font-medium font-mono">₹{Number(item.line_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button className="btn btn--ghost" onClick={() => setDetailOrder(null)}>Close</button>
              <button className="btn btn--red" onClick={() => { setDetailOrder(null); setConfirmDeleteId(detailOrder.id); }}>
                Delete Order
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {confirmDeleteId !== null && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDeleteId(null)}>
          <p className="confirm-text">Are you sure you want to delete Order #{confirmDeleteId}? This cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn btn--ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            <button className="btn btn--red" onClick={() => handleDelete(confirmDeleteId)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
