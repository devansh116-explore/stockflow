import React, { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { createCustomer, deleteCustomer } from '../services/api';
import Modal from './Modal';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(data) {
  const errors = {};
  if (!data.full_name || data.full_name.trim().length < 2) errors.full_name = 'Full name must be at least 2 characters.';
  if (!data.email || !validateEmail(data.email)) errors.email = 'Please enter a valid email address.';
  if (!data.phone || data.phone.trim().length < 7) errors.phone = 'Phone must be at least 7 characters.';
  return errors;
}

export default function CustomersPanel({ customers, onRefresh, onNotify }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    setSubmitting(true);
    try {
      await createCustomer({ full_name: form.full_name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      setForm({ full_name: '', email: '', phone: '' });
      onNotify('success', 'Customer added successfully.');
      onRefresh();
    } catch (err) {
      onNotify('error', err.response?.data?.detail || 'Failed to add customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      setConfirmDeleteId(null);
      onNotify('success', 'Customer deleted.');
      onRefresh();
    } catch (err) {
      onNotify('error', err.response?.data?.detail || 'Failed to delete customer.');
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Customers</h2>
        <p className="panel-subtitle">Manage your customer directory</p>
      </div>

      {/* Add Customer Form */}
      <div className="card">
        <h3 className="card-title"><Plus size={16} /> Add New Customer</h3>
        <form onSubmit={handleAdd} className="form-grid" noValidate>
          <div className="form-group">
            <label htmlFor="cust-name">Full Name</label>
            <input id="cust-name" name="full_name" value={form.full_name} onChange={handleChange} placeholder="e.g. Priya Sharma" className={formErrors.full_name ? 'input-error' : ''} />
            {formErrors.full_name && <span className="field-error">{formErrors.full_name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="cust-email">Email Address</label>
            <input id="cust-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="e.g. priya@example.com" className={formErrors.email ? 'input-error' : ''} />
            {formErrors.email && <span className="field-error">{formErrors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="cust-phone">Phone Number</label>
            <input id="cust-phone" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210" className={formErrors.phone ? 'input-error' : ''} />
            {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
          </div>
          <button type="submit" className="btn btn--primary form-submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Customer'}
          </button>
        </form>
      </div>

      {/* Customers List */}
      <div className="card">
        <h3 className="card-title"><Users size={16} /> All Customers ({customers.length})</h3>
        {customers.length === 0 ? (
          <div className="empty-state">
            <Users size={40} />
            <p>No customers yet. Add one above.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.full_name}</td>
                    <td className="text-muted">{c.email}</td>
                    <td>{c.phone}</td>
                    <td className="action-cell">
                      <button className="btn btn--icon btn--danger" onClick={() => setConfirmDeleteId(c.id)} aria-label={`Delete ${c.full_name}`} title="Delete">
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

      {/* Delete Confirm Modal */}
      {confirmDeleteId !== null && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDeleteId(null)}>
          <p className="confirm-text">Are you sure you want to delete this customer? This cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn btn--ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            <button className="btn btn--red" onClick={() => handleDelete(confirmDeleteId)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
