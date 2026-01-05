import { useState } from 'react'
import { useFirestoreQuery } from '../hooks/useFirestoreQuery'

export function TaskDatabaseView({ doc, profile, onToggle, onDelete, onAdd, onEdit, loading, user, unlocked, ready }) {
  const { sort, filter } = useFirestoreQuery()
  const [newTask, setNewTask] = useState('')
  const [filterDone, setFilterDone] = useState('pending')
  const [sortBy, setSortBy] = useState('date')
  const [editingIdx, setEditingIdx] = useState(null)
  const [editForm, setEditForm] = useState({})

  const tasks = doc.profiles?.[profile]?.tasks || []
  let displayed = tasks

  if (filterDone === 'done') {
    displayed = filter(displayed, (t) => t.done)
  } else if (filterDone === 'pending') {
    displayed = filter(displayed, (t) => !t.done)
  }

  if (sortBy === 'date') {
    displayed = sort(displayed, 'at', 'asc')
  } else if (sortBy === 'recent') {
    displayed = sort(displayed, 'at', 'desc')
  }

  const canEdit = (task) => {
    return true
  }

  const handleEditClick = (task, idx) => {
    setEditingIdx(idx)
    setEditForm({
      title: task.title,
      at: task.at?.slice(0, 10) || new Date().toISOString().slice(0, 10)
    })
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

  const handleAddTask = async () => {
    if (!newTask.trim() || !user || !unlocked || !ready) return
    await onAdd({
      title: newTask,
      done: false,
      ownerId: profile === 'him' ? 'maha' : 'momo',
      createdAt: new Date().toISOString(),
      at: new Date().toISOString(),
    })
    setNewTask('')
  }

  return (
    <div className="database-view">
      <div className="view-header">
        <h3>Tasks</h3>
        <div className="view-controls">
          <input
            placeholder="Add new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            className="input"
          />
          <button onClick={handleAddTask} disabled={loading || !user || !unlocked || !ready} className="btn btn-sm">
            Add
          </button>
        </div>
      </div>

      <div className="view-filters">
        <select value={filterDone} onChange={(e) => setFilterDone(e.target.value)} className="input">
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="done">Completed</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input">
          <option value="date">Due Date (Soonest)</option>
          <option value="recent">Recently Added</option>
        </select>
      </div>

      <div className="table-view">
        <div className="table-header">
          <div className="col-checkbox">Done</div>
          <div className="col-title">Title</div>
          <div className="col-date">Due Date</div>
          <div className="col-actions">Actions</div>
        </div>
        {displayed.length === 0 && (
          <div className="empty-state">
            <p>No tasks in this view</p>
          </div>
        )}
        {displayed.map((task, idx) => (
          <div key={idx} className={`table-row ${task.done ? 'completed' : ''}`}>
            {editingIdx === idx ? (
              <>
                <div className="col-checkbox">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => onToggle(idx)}
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
                <div className="col-date">
                  <input
                    type="date"
                    value={editForm.at}
                    onChange={(e) => setEditForm({ ...editForm, at: e.target.value })}
                    className="input"
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
                <div className="col-checkbox">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => onToggle(idx)}
                  />
                </div>
                <div className="col-title">{task.title}</div>
                <div className="col-date">{task.at?.slice(0, 10)}</div>
                <div className="col-actions">
                  <button
                    className="btn-icon"
                    title="Edit"
                    onClick={() => handleEditClick(task, idx)}
                  >
                    ✎
                  </button>
                  <button className="btn-icon danger" onClick={() => onDelete(idx)} disabled={loading}>
                    ✕
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
