import { useState } from 'react'
import { useFirestoreQuery } from '../hooks/useFirestoreQuery'

export function PlannerDatabaseView({ type, items, onToggle, onDelete, onEdit, loading, profile }) {
  const { sort } = useFirestoreQuery()
  const [sortBy, setSortBy] = useState(type === 'date' ? 'date' : 'price')
  const [editingIdx, setEditingIdx] = useState(null)
  const [editForm, setEditForm] = useState({})

  let displayed = items
  if (type === 'date') {
    displayed = sort(displayed, 'at', sortBy === 'upcoming' ? 'asc' : 'desc')
  } else {
    if (sortBy === 'price-high') {
      displayed = sort(displayed, 'expectedPrice', 'desc')
    } else {
      displayed = sort(displayed, 'expectedPrice', 'asc')
    }
  }

  const canEdit = (item) => {
    return true
  }

  const handleEditClick = (item, idx) => {
    setEditingIdx(idx)
    if (type === 'date') {
      setEditForm({
        title: item.title,
        at: item.at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        budget: item.budget
      })
    } else {
      setEditForm({
        title: item.title,
        expectedPrice: item.expectedPrice,
        priority: item.priority
      })
    }
  }

  const handleSaveEdit = async (idx) => {
    await onEdit(idx, editForm)
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
        <h3>{type === 'date' ? 'Dates' : 'Buy List'}</h3>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input">
          {type === 'date' ? (
            <>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </>
          ) : (
            <>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </>
          )}
        </select>
      </div>

      <div className="table-view">
        <div className="table-header">
          {type === 'date' ? (
            <>
              <div className="col-date">Date</div>
              <div className="col-title">Title</div>
              <div className="col-budget">Budget</div>
              <div className="col-actions">Actions</div>
            </>
          ) : (
            <>
              <div className="col-title">Item</div>
              <div className="col-price">Price</div>
              <div className="col-priority">Priority</div>
              <div className="col-bought">Status</div>
              <div className="col-actions">Actions</div>
            </>
          )}
        </div>
        {displayed.length === 0 && (
          <div className="empty-state">
            <p>No items yet</p>
          </div>
        )}
        {displayed.map((item, idx) => (
          <div key={idx} className="table-row">
            {type === 'date' ? (
              editingIdx === idx ? (
                <>
                  <div className="col-date">
                    <input
                      type="date"
                      value={editForm.at}
                      onChange={(e) => setEditForm({ ...editForm, at: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="col-title">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="col-budget">
                    <input
                      type="number"
                      value={editForm.budget}
                      onChange={(e) => setEditForm({ ...editForm, budget: Number(e.target.value) })}
                      className="input"
                      style={{ width: '100px' }}
                    />
                  </div>
                  <div className="col-actions">
                    <button
                      className="btn-icon"
                      title="Save"
                      onClick={() => handleSaveEdit(idx)}
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
                  <div className="col-date">{item.at?.slice(0, 10)}</div>
                  <div className="col-title">{item.title}</div>
                  <div className="col-budget">${item.budget}</div>
                  <div className="col-actions">
                    <button
                      className="btn-icon"
                      title="Edit"
                      onClick={() => handleEditClick(item, idx)}
                    >
                      ✎
                    </button>
                    <button className="btn-icon danger" onClick={() => onDelete(idx)} disabled={loading}>
                      ✕
                    </button>
                  </div>
                </>
              )
            ) : (
              editingIdx === idx ? (
                <>
                  <div className="col-title">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div className="col-price">
                    <input
                      type="number"
                      value={editForm.expectedPrice}
                      onChange={(e) => setEditForm({ ...editForm, expectedPrice: Number(e.target.value) })}
                      className="input"
                      style={{ width: '100px' }}
                    />
                  </div>
                  <div className="col-priority">
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="col-bought">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={item.bought}
                        onChange={() => onToggle(idx)}
                      />
                      {item.bought ? 'Bought' : 'Planned'}
                    </label>
                  </div>
                  <div className="col-actions">
                    <button
                      className="btn-icon"
                      title="Save"
                      onClick={() => handleSaveEdit(idx)}
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
                  <div className="col-title">{item.title}</div>
                  <div className="col-price">${item.expectedPrice}</div>
                  <div className={`col-priority priority-${item.priority}`}>{item.priority}</div>
                  <div className="col-bought">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={item.bought}
                        onChange={() => onToggle(idx)}
                      />
                      {item.bought ? 'Bought' : 'Planned'}
                    </label>
                  </div>
                  <div className="col-actions">
                    <button
                      className="btn-icon"
                      title="Edit"
                      onClick={() => handleEditClick(item, idx)}
                    >
                      ✎
                    </button>
                    <button className="btn-icon danger" onClick={() => onDelete(idx)} disabled={loading}>
                      ✕
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
