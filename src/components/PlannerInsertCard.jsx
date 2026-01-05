import { useState } from 'react'

export function PlannerInsertCard({ type, onSave, loading, user, unlocked, ready, profile }) {
  const [form, setForm] = useState(
    type === 'date'
      ? {
          date: new Date().toISOString().slice(0, 10),
          title: '',
          budget: '',
          note: '',
        }
      : {
          name: '',
          expectedPrice: '',
          priority: 'medium',
        }
  )

  const handleAdd = async () => {
    if (!user || !unlocked || !ready || loading) return
    if (type === 'date') {
      if (!form.title || !form.date) {
        alert('Title and date required')
        return
      }
      await onSave({
        title: form.title,
        date: form.date,
        budget: parseFloat(form.budget) || 0,
        note: form.note,
        ownerId: profile === 'him' ? 'maha' : 'momo',
        createdAt: new Date().toISOString(),
        at: new Date(form.date).toISOString(),
      })
      setForm({ date: new Date().toISOString().slice(0, 10), title: '', budget: '', note: '' })
    } else {
      if (!form.name) {
        alert('Item name required')
        return
      }
      await onSave({
        title: form.name,
        expectedPrice: parseFloat(form.expectedPrice) || 0,
        priority: form.priority,
        bought: false,
        ownerId: profile === 'him' ? 'maha' : 'momo',
        createdAt: new Date().toISOString(),
        at: new Date().toISOString(),
      })
      setForm({ name: '', expectedPrice: '', priority: 'medium' })
    }
  }

  return (
    <div className="card insert-card">
      <div className="card-header">
        <h3>{type === 'date' ? 'Add Date' : 'Add Purchase'}</h3>
      </div>
      <div className="card-body">
        {type === 'date' ? (
          <>
            <div className="form-row">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="input"
              />
              <input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                placeholder="Budget"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="input"
              />
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input"
              rows="2"
            />
          </>
        ) : (
          <>
            <input
              placeholder="Item name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
            <div className="form-row">
              <input
                type="number"
                placeholder="Expected price"
                value={form.expectedPrice}
                onChange={(e) => setForm({ ...form, expectedPrice: e.target.value })}
                className="input"
              />
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </>
        )}
        <button
          onClick={handleAdd}
          disabled={loading || !user || !unlocked || !ready}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : 'Add'}
        </button>
      </div>
    </div>
  )
}
