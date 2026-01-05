import { useState } from 'react'
import { useFirestoreQuery } from '../hooks/useFirestoreQuery'

export function FinanceDatabaseView({ doc, profile, onEdit, onDelete, loading, user }) {
  const { sort, filter, search } = useFirestoreQuery()
  const [sortBy, setSortBy] = useState('date')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingIdx, setEditingIdx] = useState(null)
  const [editForm, setEditForm] = useState({})

  const deposits = doc.profiles?.[profile]?.finance?.deposits || []
  const expenses = doc.profiles?.[profile]?.finance?.expenses || []
  const allEntries = [
    ...deposits.map((e, i) => ({ ...e, id: e.id || `dep-${i}-${e.at}`, kind: 'deposit', originalIndex: i })),
    ...expenses.map((e, i) => ({ ...e, id: e.id || `exp-${i}-${e.at}`, kind: 'expense', originalIndex: i })),
  ]

  let displayed = allEntries
  if (filterType !== 'all') {
    displayed = filter(displayed, (e) => e.kind === filterType)
  }
  if (searchQuery) {
    displayed = search(displayed, searchQuery, ['label', 'comment'])
  }
  if (sortBy === 'date') {
    displayed = sort(displayed, 'at', 'desc')
  } else if (sortBy === 'amount-high') {
    displayed = sort(displayed, 'amount', 'desc')
  } else if (sortBy === 'amount-low') {
    displayed = sort(displayed, 'amount', 'asc')
  }

  const canEdit = () => {
    return true
  }

  const handleEditClick = (entry, idx) => {
    setEditingIdx(idx)
    setEditForm({
      amount: entry.amount,
      label: entry.label,
      comment: entry.comment || '',
      category: entry.category || ''
    })
  }

  const handleSaveEdit = async (entry) => {
    await onEdit({ ...entry, ...editForm })
    setEditingIdx(null)
    setEditForm({})
  }

  const handleCancelEdit = () => {
    setEditingIdx(null)
    setEditForm({})
  }

  return (
    <div className="database-view">
      <div className="view-header">
        <h3>Finance Entries</h3>
        <div className="view-controls">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input search-input"
          />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input">
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="expense">Expenses</option>
            <option value="saving">Savings</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input">
            <option value="date">Latest First</option>
            <option value="amount-high">Highest Amount</option>
            <option value="amount-low">Lowest Amount</option>
          </select>
        </div>
      </div>

      <div className="table-view">
        <div className="table-header">
          <div className="col-type">Type</div>
          <div className="col-amount">Amount</div>
          <div className="col-label">Label</div>
          <div className="col-comment">Comment</div>
          <div className="col-date">Date</div>
          <div className="col-actions">Actions</div>
        </div>
        {displayed.length === 0 && (
          <div className="empty-state">
            <p>No entries found</p>
          </div>
        )}
        {displayed.map((entry, idx) => (
          <div key={entry.id} className="table-row">
            {editingIdx === idx ? (
              <>
                <div className={`col-type type-${entry.kind}`}>{entry.kind}</div>
                <div className="col-amount">
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                    className="input"
                    style={{ width: '100px' }}
                  />
                </div>
                <div className="col-label">
                  <input
                    type="text"
                    value={editForm.label}
                    onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="col-comment">
                  <input
                    type="text"
                    value={editForm.comment}
                    onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="col-date">{entry.at?.slice(0, 10)}</div>
                <div className="col-actions">
                  <button
                    className="btn-icon"
                    title="Save"
                    onClick={() => handleSaveEdit(entry)}
                    disabled={loading}
                  >
                    ✓
                  </button>
                  <button
                    className="btn-icon"
                    title="Cancel"
                    onClick={handleCancelEdit}
                  >
                    ✕
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={`col-type type-${entry.kind}`}>{entry.kind}</div>
                <div className="col-amount">${entry.amount}</div>
                <div className="col-label">{entry.label}</div>
                <div className="col-comment">{entry.comment || '—'}</div>
                <div className="col-date">{entry.at?.slice(0, 10)}</div>
                <div className="col-actions">
                  {canEdit(entry) && (
                    <>
                      <button
                        className="btn-icon"
                        title="Edit"
                        onClick={() => handleEditClick(entry, idx)}
                      >
                        ✎
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Delete"
                        onClick={() => onDelete(entry)}
                        disabled={loading}
                      >
                        ✕
                      </button>
                    </>
                  )}
                  {!canEdit(entry) && <span className="muted">Read-only</span>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
