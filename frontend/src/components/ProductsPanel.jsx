import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import { createProduct, updateProduct, deleteProduct } from '../services/api';
import Modal from './Modal';

function validate(data) {
  const errors = {};
  if (!data.name || data.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.';
  if (!data.sku || data.sku.trim().length < 2) errors.sku = 'SKU must be at least 2 characters.';
  if (!data.price || isNaN(data.price) || Number(data.price) <= 0) errors.price = 'Price must be a positive number.';
  if (data.quantity === '' || isNaN(data.quantity) || Number(data.quantity) < 0) errors.quantity = 'Quantity cannot be negative.';
  return errors;
}

export default function ProductsPanel({ products, onRefresh, onNotify }) {
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});
    setSubmitting(true);
    try {
      await createProduct({
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
      });
      setForm({ name: '', sku: '', price: '', quantity: '' });
      onNotify('success', 'Product added successfully.');
      onRefresh();
    } catch (err) {
      onNotify('error', err.response?.data?.detail || 'Failed to add product.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setEditForm({ name: product.name, sku: product.sku, price: product.price, quantity: product.quantity });
    setEditErrors({});
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const errors = validate(editForm);
    if (Object.keys(errors).length > 0) { setEditErrors(errors); return; }
    setEditErrors({});
    try {
      await updateProduct(editProduct.id, {
        name: editForm.name.trim(),
        sku: editForm.sku.trim(),
        price: Number(editForm.price),
        quantity: Number(editForm.quantity),
      });
      setEditProduct(null);
      onNotify('success', 'Product updated successfully.');
      onRefresh();
    } catch (err) {
      onNotify('error', err.response?.data?.detail || 'Failed to update product.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setConfirmDeleteId(null);
      onNotify('success', 'Product deleted.');
      onRefresh();
    } catch (err) {
      onNotify('error', err.response?.data?.detail || 'Failed to delete product.');
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Products</h2>
        <p className="panel-subtitle">Manage your product catalogue and inventory levels</p>
      </div>

      {/* Add Product Form */}
      <div className="card">
        <h3 className="card-title"><Plus size={16} /> Add New Product</h3>
        <form onSubmit={handleAdd} className="form-grid" noValidate>
          <div className="form-group">
            <label htmlFor="prod-name">Product Name</label>
            <input id="prod-name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Wireless Keyboard" className={formErrors.name ? 'input-error' : ''} />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="prod-sku">SKU / Code</label>
            <input id="prod-sku" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. WK-001" className={formErrors.sku ? 'input-error' : ''} />
            {formErrors.sku && <span className="field-error">{formErrors.sku}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="prod-price">Price (₹)</label>
            <input id="prod-price" name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} placeholder="0.00" className={formErrors.price ? 'input-error' : ''} />
            {formErrors.price && <span className="field-error">{formErrors.price}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="prod-qty">Quantity in Stock</label>
            <input id="prod-qty" name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} placeholder="0" className={formErrors.quantity ? 'input-error' : ''} />
            {formErrors.quantity && <span className="field-error">{formErrors.quantity}</span>}
          </div>
          <button type="submit" className="btn btn--primary form-submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>

      {/* Products List */}
      <div className="card">
        <h3 className="card-title"><Package size={16} /> All Products ({products.length})</h3>
        {products.length === 0 ? (
          <div className="empty-state">
            <Package size={40} />
            <p>No products yet. Add one above.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td><span className="badge badge--grey font-mono">{p.sku}</span></td>
                    <td className="font-mono">₹{Number(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge--red' : p.quantity < 5 ? 'badge--yellow' : 'badge--green'}`}>
                        {p.quantity === 0
                          ? 'Out of stock'
                          : p.quantity < 5
                          ? <><AlertTriangle size={12} /> {p.quantity} low</>
                          : p.quantity}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="btn btn--icon" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button className="btn btn--icon btn--danger" onClick={() => setConfirmDeleteId(p.id)} aria-label={`Delete ${p.name}`} title="Delete">
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

      {/* Edit Modal */}
      {editProduct && (
        <Modal title={`Edit — ${editProduct.name}`} onClose={() => setEditProduct(null)}>
          <form onSubmit={handleEditSave} className="form-grid" noValidate>
            <div className="form-group">
              <label htmlFor="edit-prod-name">Product Name</label>
              <input id="edit-prod-name" name="name" value={editForm.name} onChange={handleEditChange} className={editErrors.name ? 'input-error' : ''} />
              {editErrors.name && <span className="field-error">{editErrors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="edit-prod-sku">SKU / Code</label>
              <input id="edit-prod-sku" name="sku" value={editForm.sku} onChange={handleEditChange} className={editErrors.sku ? 'input-error' : ''} />
              {editErrors.sku && <span className="field-error">{editErrors.sku}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="edit-prod-price">Price (₹)</label>
              <input id="edit-prod-price" name="price" type="number" step="0.01" min="0.01" value={editForm.price} onChange={handleEditChange} className={editErrors.price ? 'input-error' : ''} />
              {editErrors.price && <span className="field-error">{editErrors.price}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="edit-prod-qty">Quantity in Stock</label>
              <input id="edit-prod-qty" name="quantity" type="number" min="0" value={editForm.quantity} onChange={handleEditChange} className={editErrors.quantity ? 'input-error' : ''} />
              {editErrors.quantity && <span className="field-error">{editErrors.quantity}</span>}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setEditProduct(null)}>Cancel</button>
              <button type="submit" className="btn btn--primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {confirmDeleteId !== null && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDeleteId(null)}>
          <p className="confirm-text">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn btn--ghost" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
            <button className="btn btn--red" onClick={() => handleDelete(confirmDeleteId)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
