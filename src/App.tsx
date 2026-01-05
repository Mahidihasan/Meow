import { useEffect, useState } from 'react'
import './App.css'
import { useAuth } from './context/AuthContext.jsx'
import { useData } from './context/DataContext.jsx'
import { addDeposit, addExpense } from './services/finance.service.js'
import { addTask } from './services/task.service.js'
import { addBuy, addDate } from './services/planner.service.js'
import { FinanceInsertCard } from './components/FinanceInsertCard'
import { FinanceDatabaseView } from './components/FinanceDatabaseView'
import { TaskFeed } from './components/TaskFeed'
import { TaskDatabaseView } from './components/TaskDatabaseView'
import { PlannerInsertCard } from './components/PlannerInsertCard'
import { PlannerDatabaseView } from './components/PlannerDatabaseView'
import { PeriodTracker } from './components/PeriodTracker'

type Profile = 'him' | 'her'

const ACCESS_CODE = 'meow'

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const { doc, ready, setError, error, update } = useData()

  const [profile, setProfile] = useState<Profile>('her')
  const [passphrase, setPassphrase] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [view, setView] = useState<'dashboard' | 'finance' | 'tasks' | 'dates' | 'buy' | 'period'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!ready) return
    const active = doc.activeProfile || 'her'
    setProfile(active as Profile)
  }, [ready, doc.activeProfile])

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await signIn(credentials.username, credentials.password)
      setUnlocked(true)
      setError('')
      const uname = credentials.username.toLowerCase()
      if (uname === 'maha') setProfile('him')
      if (uname === 'momo') setProfile('her')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const computeStats = () => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const inMonth = (list: any[]) =>
      list.filter((e) => e.at && new Date(e.at).getMonth() === month && new Date(e.at).getFullYear() === year)
    const monthDeposits = inMonth(doc.profiles?.[profile]?.finance?.deposits || []).reduce((s: number, e: any) => s + (e.amount || 0), 0)
    const monthExpenses = inMonth(doc.profiles?.[profile]?.finance?.expenses || []).reduce((s: number, e: any) => s + (e.amount || 0), 0)
    return { monthDeposits, monthExpenses, remaining: monthDeposits - monthExpenses }
  }

  const computePeriodStats = () => {
    if (profile !== 'her') return null
    const periodData = doc.profiles?.her?.period
    if (!periodData || !periodData.lastStart || !periodData.cycleLength) return null
    
    const lastStart = new Date(periodData.lastStart)
    const cycleLength = periodData.cycleLength || 28
    const nextDate = new Date(lastStart)
    nextDate.setDate(nextDate.getDate() + cycleLength)
    
    const today = new Date()
    const diffTime = nextDate.getTime() - today.getTime()
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return { daysUntil, nextDate }
  }

  const stats = computeStats()
  const periodStats = computePeriodStats()

  const guard = (handler: (arg: any) => Promise<void>) => async (arg?: any) => {
    if (!user) {
      setError('Sign in first (maha/momo).')
      return
    }
    if (!unlocked) {
      setError('Enter the shared passphrase to continue.')
      return
    }
    if (!ready) {
      setError('Data is still syncing. Try again in a moment.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await handler(arg)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUnlocked(false)
    setPassphrase('')
  }

  const handlePassphrase = () => {
    if (passphrase.trim() === ACCESS_CODE) {
      setUnlocked(true)
      setError('')
    } else {
      setUnlocked(false)
      setError('Passphrase incorrect')
    }
  }

  const handleAddFinance = guard(async (entry: any) => {
    if (entry.type === 'deposit' || entry.type === 'saving') {
      await addDeposit(doc, profile, entry)
    } else {
      await addExpense(doc, profile, entry)
    }
  })

  const handleAddTask = guard(async (task: any) => {
    await addTask(doc, profile, task)
  })

  const handleToggleTask = guard(async (idx: number) => {
    const tasks = doc.profiles?.[profile]?.tasks || []
    if (tasks[idx]) {
      tasks[idx].done = !tasks[idx].done
      await update(`profiles.${profile}.tasks`, tasks)
    }
  })

  const handleDeleteTask = guard(async (idx: number) => {
    const tasks = doc.profiles?.[profile]?.tasks || []
    tasks.splice(idx, 1)
    await update(`profiles.${profile}.tasks`, tasks)
  })

  const handleEditTask = async (idx: number, editForm: any) => {
    if (!user || !unlocked || !ready) return
    try {
      const tasks = doc.profiles?.[profile]?.tasks || []
      if (tasks[idx]) {
        tasks[idx] = { ...tasks[idx], title: editForm.title, at: editForm.at }
        await update(`profiles.${profile}.tasks`, tasks)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Edit failed')
    }
  }

  const handleAddDate = guard(async (entry: any) => {
    await addDate(doc, profile, entry)
  })

  const handleAddBuy = guard(async (entry: any) => {
    await addBuy(doc, profile, entry)
  })

  const handleToggleBuy = guard(async (idx: number) => {
    const buys = doc.profiles?.[profile]?.planners?.buy || []
    if (buys[idx]) {
      buys[idx].bought = !buys[idx].bought
      await update(`profiles.${profile}.planners.buy`, buys)
    }
  })

  const handleDeleteBuy = guard(async (idx: number) => {
    const buys = doc.profiles?.[profile]?.planners?.buy || []
    buys.splice(idx, 1)
    await update(`profiles.${profile}.planners.buy`, buys)
  })

  const handleEditBuy = async (idx: number, editForm: any) => {
    if (!user || !unlocked || !ready) return
    try {
      const buys = doc.profiles?.[profile]?.planners?.buy || []
      if (buys[idx]) {
        buys[idx] = { ...buys[idx], title: editForm.title, expectedPrice: editForm.expectedPrice, priority: editForm.priority }
        await update(`profiles.${profile}.planners.buy`, buys)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Edit failed')
    }
  }

  const handleDeleteDate = guard(async (idx: number) => {
    const dates = doc.profiles?.[profile]?.planners?.date || []
    dates.splice(idx, 1)
    await update(`profiles.${profile}.planners.date`, dates)
  })

  const handleEditDate = async (idx: number, editForm: any) => {
    if (!user || !unlocked || !ready) return
    try {
      const dates = doc.profiles?.[profile]?.planners?.date || []
      if (dates[idx]) {
        dates[idx] = { ...dates[idx], title: editForm.title, at: editForm.at, budget: editForm.budget }
        await update(`profiles.${profile}.planners.date`, dates)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Edit failed')
    }
  }

  const handleDeleteFinance = guard(async (entry: any) => {
    if (entry.kind === 'deposit') {
      const deposits = doc.profiles?.[profile]?.finance?.deposits || []
      const idx = deposits.findIndex((e: any) => e.at === entry.at && e.amount === entry.amount)
      if (idx >= 0) deposits.splice(idx, 1)
      await update(`profiles.${profile}.finance.deposits`, deposits)
    } else {
      const expenses = doc.profiles?.[profile]?.finance?.expenses || []
      const idx = expenses.findIndex((e: any) => e.at === entry.at && e.amount === entry.amount)
      if (idx >= 0) expenses.splice(idx, 1)
      await update(`profiles.${profile}.finance.expenses`, expenses)
    }
  })

  const handleEditFinance = guard(async (entry: any) => {
    if (entry.kind === 'deposit') {
      const deposits = doc.profiles?.[profile]?.finance?.deposits || []
      const idx = entry.originalIndex !== undefined ? entry.originalIndex : deposits.findIndex((e: any) => e.at === entry.at && e.amount === entry.amount)
      if (idx >= 0) {
        deposits[idx] = { ...deposits[idx], amount: entry.amount, label: entry.label, comment: entry.comment, category: entry.category }
        await update(`profiles.${profile}.finance.deposits`, deposits)
      }
    } else {
      const expenses = doc.profiles?.[profile]?.finance?.expenses || []
      const idx = entry.originalIndex !== undefined ? entry.originalIndex : expenses.findIndex((e: any) => e.at === entry.at && e.amount === entry.amount)
      if (idx >= 0) {
        expenses[idx] = { ...expenses[idx], amount: entry.amount, label: entry.label, comment: entry.comment, category: entry.category }
        await update(`profiles.${profile}.finance.expenses`, expenses)
      }
    }
  })

  if (!user || !unlocked) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Togethera</h1>
            <p className="subtitle">Cozy duo OS · Local-first</p>
          </div>

          {!user && (
            <div className="auth-section">
              <h2>Sign In</h2>
              <div className="form-group">
                <input
                  placeholder="Username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="input"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="input"
                />
                <button
                  onClick={handleSignIn}
                  disabled={loading || authLoading}
                  className="btn btn-primary btn-block"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </div>
          )}

          {user && !unlocked && (
            <div className="auth-section">
              <h2>Unlock</h2>
              <p className="muted">Enter the shared passphrase</p>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="input"
                />
                <button onClick={handlePassphrase} className="btn btn-primary btn-block">
                  Unlock
                </button>
              </div>
              <button onClick={handleSignOut} className="btn btn-ghost btn-block">
                Sign out
              </button>
            </div>
          )}

          {error && <p className="error">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="app-page">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Togethera</h2>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setView('dashboard')
              setSidebarOpen(false)
            }}
          >
            📊 Dashboard
          </button>
          <button className={`nav-item ${view === 'finance' ? 'active' : ''}`} onClick={() => {
            setView('finance')
            setSidebarOpen(false)
          }}>
            💰 Finance
          </button>
          <button className={`nav-item ${view === 'tasks' ? 'active' : ''}`} onClick={() => {
            setView('tasks')
            setSidebarOpen(false)
          }}>
            ✓ Tasks
          </button>
          <button className={`nav-item ${view === 'dates' ? 'active' : ''}`} onClick={() => {
            setView('dates')
            setSidebarOpen(false)
          }}>
            💕 Dates
          </button>
          <button className={`nav-item ${view === 'buy' ? 'active' : ''}`} onClick={() => {
            setView('buy')
            setSidebarOpen(false)
          }}>
            🛒 Buy List
          </button>
          {profile === 'her' && (
            <button className={`nav-item ${view === 'period' ? 'active' : ''}`} onClick={() => {
              setView('period')
              setSidebarOpen(false)
            }}>
              🩸 Period Tracker
            </button>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="profile-switcher">
            <span className="label">Profile</span>
            <div className="switcher">
              {(['her', 'him'] as Profile[]).map((p) => (
                <button
                  key={p}
                  className={`chip ${profile === p ? 'active' : ''}`}
                  onClick={() => setProfile(p)}
                >
                  {p === 'her' ? 'She Meow' : 'He Meow'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSignOut} className="btn btn-ghost btn-sm">
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        {error && <div className="alert alert-error">{error}</div>}

        {view === 'dashboard' && (
          <div className="view-container">
            <div className="dashboard-header">
              <h1>Dashboard</h1>
              <p className="subtitle">Your monthly overview</p>
            </div>

            {profile === 'her' && periodStats && (
              <div className="period-banner">
                <div className="period-info">
                  <span className="period-icon">🩺</span>
                  <div className="period-text">
                    <h3>Next Period</h3>
                    <p className="period-date">{periodStats.nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className={`period-days ${periodStats.daysUntil <= 3 ? 'urgent' : periodStats.daysUntil <= 7 ? 'soon' : ''}`}>
                  <span className="days-number">{periodStats.daysUntil}</span>
                  <span className="days-label">days away</span>
                </div>
              </div>
            )}

            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">This Month Deposits</p>
                <p className="stat-value">{formatCurrency(stats.monthDeposits)}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">This Month Expenses</p>
                <p className="stat-value">{formatCurrency(stats.monthExpenses)}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Remaining</p>
                <p className={`stat-value ${stats.remaining >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(stats.remaining)}
                </p>
              </div>
            </div>

            <TaskFeed
              doc={doc}
              profile={profile}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              loading={loading}
              user={user}
            />
          </div>
        )}

        {view === 'period' && profile === 'her' && (
          <div className="view-container">
            <h1>Period Tracker</h1>
            <PeriodTracker
              doc={doc}
              onUpdate={update}
              loading={loading}
              user={user}
              unlocked={unlocked}
              ready={ready}
            />
          </div>
        )}

        {view === 'finance' && (
          <div className="view-container">
            <h1>Finance</h1>
            <FinanceInsertCard
              doc={doc}
              profile={profile}
              onSave={handleAddFinance}
              loading={loading}
              user={user}
              unlocked={unlocked}
              ready={ready}
            />
            <FinanceDatabaseView
              doc={doc}
              profile={profile}
              onEdit={handleEditFinance}
              onDelete={handleDeleteFinance}
              loading={loading}
              user={user}
            />
          </div>
        )}

        {view === 'tasks' && (
          <div className="view-container">
            <h1>Tasks</h1>
            <TaskDatabaseView
              doc={doc}
              profile={profile}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onAdd={handleAddTask}
              onEdit={handleEditTask}
              loading={loading}
              user={user}
              unlocked={unlocked}
              ready={ready}
            />
          </div>
        )}

        {view === 'dates' && (
          <div className="view-container">
            <h1>Dates</h1>
            <PlannerInsertCard
              type="date"
              onSave={handleAddDate}
              loading={loading}
              user={user}
              unlocked={unlocked}
              ready={ready}
              profile={profile}
            />
            <PlannerDatabaseView
              type="date"
              items={doc.profiles?.[profile]?.planners?.date || []}
              onToggle={() => {}}
              onDelete={handleDeleteDate}
              onEdit={handleEditDate}
              loading={loading}
              profile={profile}
            />
          </div>
        )}

        {view === 'buy' && (
          <div className="view-container">
            <h1>Buy List</h1>
            <PlannerInsertCard
              type="buy"
              onSave={handleAddBuy}
              loading={loading}
              user={user}
              unlocked={unlocked}
              ready={ready}
              profile={profile}
            />
            <PlannerDatabaseView
              type="buy"
              items={doc.profiles?.[profile]?.planners?.buy || []}
              onToggle={handleToggleBuy}
              onDelete={handleDeleteBuy}
              onEdit={handleEditBuy}
              loading={loading}
              profile={profile}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
