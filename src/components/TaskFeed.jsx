import { useState } from 'react'
import { useFirestoreQuery } from '../hooks/useFirestoreQuery'

export function TaskFeed({ doc, profile, onToggle, onDelete, loading, user }) {
  const { sort } = useFirestoreQuery()
  const tasks = doc.profiles?.[profile]?.tasks || []
  const incomplete = tasks.filter((t) => !t.done)
  const sorted = sort(incomplete, 'at', 'asc')

  const canEdit = (task) => {
    const ownerId = task.ownerId || (profile === 'him' ? 'maha' : 'momo')
    return ownerId === (profile === 'him' ? 'maha' : 'momo')
  }

  return (
    <div className="feed-view">
      <div className="feed-header">
        <h3>Pending Tasks</h3>
        <span className="badge">{sorted.length}</span>
      </div>
      {sorted.length === 0 && (
        <div className="empty-state">
          <p>No pending tasks. Well done!</p>
        </div>
      )}
      <div className="feed-items">
        {sorted.map((task, idx) => (
          <div key={idx} className="feed-item">
            <div className="item-content">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => onToggle(idx)}
                  disabled={!canEdit(task)}
                />
                <span>{task.title}</span>
              </label>
              <p className="muted">{task.at?.slice(0, 10)}</p>
            </div>
            {canEdit(task) && (
              <button className="btn-icon danger" onClick={() => onDelete(idx)} disabled={loading}>
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
