import { useState } from 'react'

export function FinanceInsertCard({ doc, profile, onSave, loading, user, unlocked, ready }) {
  const [form, setForm] = useState({
    type: 'deposit',
    amount: '',
    label: '',
    comment: '',
    month: new Date().toISOString().slice(0, 7),
  })

  const handleAdd = async () => {
    if (!user || !unlocked || !ready || loading) return
    const amount = parseFloat(form.amount) || 0
    if (!amount || !form.label) {
      alert('Amount and label required')
      return
    }
    await onSave({
      ...form,
      amount,
      ownerId: profile === 'him' ? 'maha' : 'momo',
      createdAt: new Date().toISOString(),
    })
    setForm({ ...form, amount: '', label: '', comment: '', type: 'deposit' })
  }

  return (
    <div className="card insert-card">
      <div className="card-header">
        <h3>Add Financial Entry</h3>
      </div>
      <div className="card-body">
        <div className="form-row">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="input"
          >
            <option value="deposit">Deposit</option>
            <option value="expense">Expense</option>
            <option value="saving">Saving</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="input"
          />
        </div>
        <div className="form-row">
          <input
            placeholder="Label (Rent, Food, etc)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="input"
          />
          <input
            type="month"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            className="input"
          />
        </div>
        <textarea
          placeholder="Comment (optional)"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          className="input"
          rows="2"
        />
        <button
          onClick={handleAdd}
          disabled={loading || !user || !unlocked || !ready}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : 'Add Entry'}
        </button>
      </div>
    </div>
  )
}
