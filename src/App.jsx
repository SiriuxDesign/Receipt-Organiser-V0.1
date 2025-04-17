import React, { useState, useCallback } from 'react'

const personalCategories = [
  'Food & Groceries',
  'Rent & Mortgage',
  'Utilities',
  'Phone & Internet',
  'Transport',
  'Health & Medical',
  'Education Fees',
  'Childcare',
  'Insurance',
  'Entertainment',
  'Subscriptions',
  'Clothing & Shopping',
  'Travel & Holidays',
  'Gifts & Donations',
  'Fitness & Wellness',
  'Pet Expenses',
  'Home Maintenance'
]

const workExpenseCategories = [
  'Home Office Expenses',
  'Phone & Internet',
  'Work-Related Travel',
  'Uniforms & Protective Clothing',
  'Self-Education or Training',
  'Tools & Equipment',
  'Union or Membership Fees',
  'Work-Related Subscriptions',
  'Parking & Tolls',
  'Stationery & Office Supplies',
  'Laptop or Computer',
  'Professional Development'
]

const businessCategories = [
  'Advertising & Marketing',
  'Business Insurance',
  'Website & Hosting Fees',
  'Software Subscriptions',
  'Contractor & Staff Wages',
  'Superannuation Contributions',
  'Business Travel & Accommodation',
  'Rent & Utilities',
  'Accounting & Legal Fees',
  'Office Equipment & Furniture',
  'Vehicle Expenses',
  'Bank Fees & Interest',
  'Stock or Inventory Purchases',
  'Training & Seminars',
  'Business Licences & Permits',
  'BAS or ATO Payments',
  'Client Gifts & Entertainment'
]

const investmentCategories = [
  'Shares & Brokerage Fees',
  'Investment Property Expenses',
  'Interest on Investment Loans',
  'Financial Adviser Fees',
  'Capital Gains Tax Records',
  'Rental Property Management Fees',
  'Maintenance & Repairs',
  'Depreciation Reports',
  'Strata Fees',
  'Council Rates & Water Charges',
  'Investment Research Tools',
  'Dividends & Distribution Statements',
  'Bank Fees',
  'Tax Agent Fees'
]

const defaultCategories = ['Food & Dining', 'Transportation', 'Utilities', 'Entertainment', 'Other']
const types = ['Personal', 'Work Expense', 'Business', 'Investment']

function App() {
  const [date, setDate] = useState('')
  const [merchant, setMerchant] = useState('')
  const [items, setItems] = useState([{ item: '', category: '', type: '', amount: '' }])
  const [notes, setNotes] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [receipts, setReceipts] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [expandedReceipts, setExpandedReceipts] = useState([])

  const getCategoriesForType = (type) => {
    switch(type) {
      case 'Personal':
        return personalCategories
      case 'Work Expense':
        return workExpenseCategories
      case 'Business':
        return businessCategories
      case 'Investment':
        return investmentCategories
      default:
        return defaultCategories
    }
  }

  const toggleReceiptExpansion = (index) => {
    if (expandedReceipts.includes(index)) {
      setExpandedReceipts(expandedReceipts.filter(i => i !== index))
    } else {
      setExpandedReceipts([...expandedReceipts, index])
    }
  }

  const validateForm = () => {
    const errors = {}
    let isValid = true

    if (!date) {
      errors.date = 'Date is required'
      isValid = false
    }

    if (!merchant.trim()) {
      errors.merchant = 'Merchant is required'
      isValid = false
    }

    const itemErrors = items.map(item => {
      const itemError = {}
      if (!item.item.trim()) {
        itemError.item = 'Item is required'
        isValid = false
      }
      if (!item.category) {
        itemError.category = 'Category is required'
        isValid = false
      }
      if (!item.type) {
        itemError.type = 'Type is required'
        isValid = false
      }
      if (!item.amount || parseFloat(item.amount) <= 0) {
        itemError.amount = 'Valid amount is required'
        isValid = false
      }
      return itemError
    })

    if (itemErrors.some(error => Object.keys(error).length > 0)) {
      errors.items = itemErrors
    }

    setFormErrors(errors)
    return isValid
  }

  const handleAddItem = () => {
    setItems([...items, { item: '', category: '', type: '', amount: '' }])
  }

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      setItems(newItems)
      
      if (formErrors.items) {
        const newItemErrors = [...formErrors.items]
        newItemErrors.splice(index, 1)
        setFormErrors({
          ...formErrors,
          items: newItemErrors.length > 0 ? newItemErrors : undefined
        })
      }
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    
    // Reset category when type changes
    if (field === 'type') {
      newItems[index].category = ''
    }
    
    setItems(newItems)
    
    if (formErrors.items?.[index]?.[field]) {
      const newItemErrors = [...formErrors.items]
      delete newItemErrors[index][field]
      if (Object.keys(newItemErrors[index]).length === 0) {
        newItemErrors[index] = undefined
      }
      setFormErrors({
        ...formErrors,
        items: newItemErrors.some(e => e) ? newItemErrors : undefined
      })
    }
  }

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setReceipt(file)
    }
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileChange(file)
  }, [])

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    handleFileChange(file)
  }

  const handleAddReceipt = () => {
    if (!validateForm()) {
      return
    }

    const newReceipt = {
      date,
      merchant,
      items: items.map(item => ({
        ...item,
        amount: parseFloat(item.amount) || 0
      })),
      notes,
      receipt: receipt ? URL.createObjectURL(receipt) : null,
      totalAmount: totalAmount
    }
    
    if (editingIndex !== null) {
      const updatedReceipts = [...receipts]
      updatedReceipts[editingIndex] = newReceipt
      setReceipts(updatedReceipts)
      setEditingIndex(null)
    } else {
      setReceipts([...receipts, newReceipt])
    }
    
    resetForm()
  }

  const handleEditReceipt = (index) => {
    const receiptToEdit = receipts[index]
    setDate(receiptToEdit.date)
    setMerchant(receiptToEdit.merchant)
    setItems(receiptToEdit.items)
    setNotes(receiptToEdit.notes)
    setReceipt(receiptToEdit.receipt ? new File([], 'receipt.png') : null)
    setEditingIndex(index)
    setFormErrors({})
  }

  const handleDeleteReceipt = (index) => {
    const updatedReceipts = receipts.filter((_, i) => i !== index)
    setReceipts(updatedReceipts)
    setExpandedReceipts(expandedReceipts.filter(i => i !== index))
  }

  const resetForm = () => {
    setDate('')
    setMerchant('')
    setItems([{ item: '', category: '', type: '', amount: '' }])
    setNotes('')
    setReceipt(null)
    setFormErrors({})
  }

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)

  return (
    <div className="container">
      <h1>Receipt Organizer</h1>
      
      <div className="form-group">
        <label>Date</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => {
            setDate(e.target.value)
            if (formErrors.date) {
              setFormErrors({...formErrors, date: undefined})
            }
          }} 
          className={formErrors.date ? 'error' : ''}
        />
        {formErrors.date && <div className="error-message">{formErrors.date}</div>}
      </div>

      <div className="form-group">
        <label>Merchant</label>
        <input 
          type="text" 
          value={merchant} 
          onChange={(e) => {
            setMerchant(e.target.value)
            if (formErrors.merchant) {
              setFormErrors({...formErrors, merchant: undefined})
            }
          }}
          className={formErrors.merchant ? 'error' : ''}
        />
        {formErrors.merchant && <div className="error-message">{formErrors.merchant}</div>}
      </div>

      {items.map((item, index) => (
        <div key={index} className="item-container">
          <div className="item-group">
            <div className="form-group">
              <label>Item</label>
              <input
                type="text"
                value={item.item}
                onChange={(e) => handleItemChange(index, 'item', e.target.value)
                }
                className={formErrors.items?.[index]?.item ? 'error' : ''}
              />
              {formErrors.items?.[index]?.item && (
                <div className="error-message">{formErrors.items[index].item}</div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={item.type}
                  onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                  className={formErrors.items?.[index]?.type ? 'error' : ''}
                >
                  <option value="">Select type</option>
                  {types.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {formErrors.items?.[index]?.type && (
                  <div className="error-message">{formErrors.items[index].type}</div>
                )}
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={item.category}
                  onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                  className={formErrors.items?.[index]?.category ? 'error' : ''}
                  disabled={!item.type}
                >
                  <option value="">Select category</option>
                  {getCategoriesForType(item.type).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {formErrors.items?.[index]?.category && (
                  <div className="error-message">{formErrors.items[index].category}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                className={formErrors.items?.[index]?.amount ? 'error' : ''}
                min="0.01"
                step="0.01"
              />
              {formErrors.items?.[index]?.amount && (
                <div className="error-message">{formErrors.items[index].amount}</div>
              )}
            </div>
          </div>
          {items.length > 1 && (
            <button
              className="remove-button"
              onClick={() => handleRemoveItem(index)}
              title="Remove item"
            >
              ×
            </button>
          )}
        </div>
      ))}

      <button className="button" onClick={handleAddItem}>Add Another Item</button>

      <div className="notes-section">
        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="4"
            className="notes-field"
          />
        </div>
      </div>

      <div 
        className={`receipt-upload ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="receipt"
          style={{ display: 'none' }}
          onChange={handleFileInput}
          accept="image/*"
        />
        <label htmlFor="receipt">
          {receipt ? `Uploaded: ${receipt.name}` : 'Drag & Drop or Click to Upload Receipt'}
        </label>
      </div>

      <div className="total-amount">
        Total Amount: ${totalAmount.toFixed(2)}
      </div>

      <button className="button" onClick={handleAddReceipt}>
        {editingIndex !== null ? 'Update Receipt' : 'Add Receipt'}
      </button>

      {receipts.length > 0 && (
        <div className="receipts-list">
          <h2>Saved Receipts</h2>
          {receipts.map((receipt, index) => (
            <div key={index} className="saved-receipt">
              <div className="receipt-header">
                <h3>{receipt.merchant} - {new Date(receipt.date).toLocaleDateString()}</h3>
                <div className="icon-actions">
                  <button
                    className="icon-button expand-icon"
                    onClick={() => toggleReceiptExpansion(index)}
                    title={expandedReceipts.includes(index) ? 'Collapse' : 'Expand'}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d={expandedReceipts.includes(index) ? "M19 13H5v-2h14v2z" : "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"} />
                    </svg>
                  </button>
                  {receipt.receipt && (
                    <a
                      href={receipt.receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-button preview-icon"
                      title="Preview Receipt"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12 4.5C7 极.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </a>
                  )}
                  <button
                    className="icon-button edit-icon"
                    onClick={() => handleEditReceipt(index)}
                    title="Edit"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  <button
                    className="icon-button delete-icon"
                    onClick={() => handleDeleteReceipt(index)}
                    title="Delete"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M6 19c极 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p>Total: ${receipt.totalAmount.toFixed(2)}</p>
              
              {expandedReceipts.includes(index) && (
                <div className="receipt-details">
                  <div className="details-header">
                    <span>Item</span>
                    <span>Type</span>
                    <span>Category</span>
                    <span>Amount</span>
                  </div>
                  {receipt.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="receipt-item">
                      <span>{item.item}</span>
                      <span>{item.type}</span>
                      <span>{item.category}</span>
                      <span>${parseFloat(item.amount).toFixed(2)}</span>
                    </div>
                  ))}
                  {receipt.notes && (
                    <div className="receipt-notes">
                      <strong>Notes:</strong> {receipt.notes}
                    </div>
                  )}
                </div>
              )}

              {receipt.receipt && (
                <div className="receipt-preview">
                  <a
                    href={receipt.receipt}
                    download={`receipt_${index}.png`}
                    className="download-link"
                  >
                    Download Receipt
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
