import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Package, 
  Layers, 
  CheckCircle, 
  X 
} from 'lucide-react';

export default function InventoryManager({ onInventoryChange }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [formData, setFormData] = useState({
    sku_code: '',
    product_name: '',
    category_id: '',
    unit: 'PCS',
    cost_price: '',
    selling_price: '',
    current_stock: '',
    reorder_level: '5'
  });
  const [formError, setFormError] = useState('');

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [showLowStockOnly]);

  const loadProducts = async () => {
    try {
      const url = showLowStockOnly ? '/api/products?low_stock=true' : '/api/products';
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
        if (json.data.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: json.data[0].category_id }));
        }
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setFormData({
      sku_code: `SKU-${Date.now().toString().slice(-4)}`,
      product_name: '',
      category_id: categories[0]?.category_id || '',
      unit: 'PCS',
      cost_price: '',
      selling_price: '',
      current_stock: '10',
      reorder_level: '5'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setCurrentProductId(product.product_id);
    setFormData({
      sku_code: product.sku_code,
      product_name: product.product_name,
      category_id: product.category_id,
      unit: product.unit || 'PCS',
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      current_stock: product.current_stock,
      reorder_level: product.reorder_level
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (Number(formData.selling_price) < Number(formData.cost_price)) {
      setFormError('Selling price cannot be less than cost price (Negative Margin Error).');
      return;
    }

    try {
      const url = isEditing ? `/api/products/${currentProductId}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category_id: Number(formData.category_id),
          cost_price: Number(formData.cost_price),
          selling_price: Number(formData.selling_price),
          current_stock: Number(formData.current_stock),
          reorder_level: Number(formData.reorder_level)
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save product');
      }

      setIsModalOpen(false);
      loadProducts();
      if (onInventoryChange) onInventoryChange();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to deactivate this product from inventory?')) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadProducts();
        if (onInventoryChange) onInventoryChange();
      }
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: newCategoryName, description: newCategoryDesc })
      });
      const json = await res.json();
      if (json.success) {
        setNewCategoryName('');
        setNewCategoryDesc('');
        setIsCategoryModalOpen(false);
        loadCategories();
      }
    } catch (err) {
      alert('Error creating category: ' + err.message);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category_id === Number(selectedCategory);
    const matchesSearch = p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Top Controls Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Search & Filter */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexGrow: 1 }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by SKU or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ width: '200px' }}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>

            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`btn ${showLowStockOnly ? 'btn-danger' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              <AlertTriangle size={15} />
              {showLowStockOnly ? 'Showing Low Stock Only' : 'Filter Low Stock'}
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsCategoryModalOpen(true)} className="btn btn-secondary">
              <Layers size={16} /> New Category
            </button>
            <button onClick={openAddModal} className="btn btn-primary">
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU / Code</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Margin</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.current_stock <= p.reorder_level;
                  const margin = p.selling_price - p.cost_price;

                  return (
                    <tr key={p.product_id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#4f46e5' }}>
                        {p.sku_code}
                      </td>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>
                        {p.product_name}
                      </td>
                      <td>
                        <span className="badge badge-info">{p.category_name}</span>
                      </td>
                      <td>₹{p.cost_price.toFixed(2)}</td>
                      <td style={{ fontWeight: 700 }}>₹{p.selling_price.toFixed(2)}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>
                        +₹{margin.toFixed(2)} ({((margin / p.cost_price) * 100).toFixed(0)}%)
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.current_stock}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.unit}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>(Reorder @ {p.reorder_level})</span>
                        </div>
                      </td>
                      <td>
                        {p.current_stock <= 0 ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">Low Stock ({p.current_stock})</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(p)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Product"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.product_id)}
                            className="btn btn-danger btn-sm"
                            title="Deactivate"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {isEditing ? 'Edit Product Item' : 'Add New Product to Catalog'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ marginBottom: '14px', padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#ef4444', fontSize: '0.8rem' }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">SKU / Barcode *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku_code}
                      onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="form-select"
                      required
                    >
                      {categories.map(c => (
                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless Mouse"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Cost Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Selling Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="form-select"
                    >
                      <option value="PCS">PCS</option>
                      <option value="BOX">BOX</option>
                      <option value="KG">KG</option>
                      <option value="BTL">BTL</option>
                      <option value="PKT">PKT</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Current Initial Stock *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.current_stock}
                      onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reorder Level *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.reorder_level}
                      onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add Product Category</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Home Appliances"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Brief description of products in this category..."
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
