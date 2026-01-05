import { useState } from 'react'

export function PeriodTracker({ doc, onUpdate, loading, user, unlocked, ready }) {
  const [periodStart, setPeriodStart] = useState(doc.profiles?.her?.period?.lastStart?.slice(0, 10) || '')
  const [cycleLength, setCycleLength] = useState(doc.profiles?.her?.period?.cycleLength || 28)

  const lastStart = doc.profiles?.her?.period?.lastStart
  const cycle = doc.profiles?.her?.period?.cycleLength ?? 28

  const predictedNext = (() => {
    if (!lastStart) return null
    const last = new Date(lastStart)
    const next = new Date(last.getTime() + cycle * 24 * 60 * 60 * 1000)
    return next.toISOString().slice(0, 10)
  })()

  const daysUntil = (() => {
    if (!predictedNext) return null
    const today = new Date().toISOString().slice(0, 10)
    const nextDate = new Date(predictedNext)
    const todayDate = new Date(today)
    const diff = Math.ceil((nextDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  })()

  const handleLogPeriod = async () => {
    if (!periodStart || !user || !unlocked || !ready || loading) return
    await onUpdate(`profiles.her.period`, {
      lastStart: new Date(periodStart).toISOString(),
      cycleLength: parseInt(String(cycleLength)) || 28,
    })
    setPeriodStart('')
  }

  const statusColor = (() => {
    if (!daysUntil) return 'muted'
    if (daysUntil <= 2) return 'warn'
    if (daysUntil <= 7) return 'ok'
    return 'primary'
  })()

  const statusText = (() => {
    if (!daysUntil) return 'Not tracked'
    if (daysUntil === 0) return 'Today'
    if (daysUntil === 1) return 'Tomorrow'
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days ago`
    return `${daysUntil} days away`
  })()

  return (
    <div className="period-tracker">
      <div className="tracker-header">
        <h3>Period Tracker</h3>
        <span className={`status-badge status-${statusColor}`}>{statusText}</span>
      </div>

      <div className="tracker-stats">
        {lastStart && (
          <div className="tracker-stat">
            <p className="stat-label">Last Start</p>
            <p className="stat-value">{lastStart.slice(0, 10)}</p>
          </div>
        )}
        <div className="tracker-stat">
          <p className="stat-label">Cycle Length</p>
          <p className="stat-value">{cycle} days</p>
        </div>
        {predictedNext && (
          <div className="tracker-stat">
            <p className="stat-label">Next Predicted</p>
            <p className="stat-value">{predictedNext}</p>
          </div>
        )}
      </div>

      <div className="tracker-form">
        <div className="form-row">
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="input"
            placeholder="Period start date"
          />
          <input
            type="number"
            min="21"
            max="35"
            value={cycleLength}
            onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
            className="input"
            placeholder="Cycle days"
          />
        </div>
        <button
          onClick={handleLogPeriod}
          disabled={loading || !user || !unlocked || !ready || !periodStart}
          className="btn btn-primary btn-block"
        >
          {loading ? 'Logging...' : 'Log Period'}
        </button>
      </div>
    </div>
  )
}
