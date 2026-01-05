import React from 'react'

export function GoogleSignInButton({ onClick, disabled, loading }) {
  const label = loading ? 'Signing in…' : 'Sign in with Google'
  return (
    <button className="ghost" onClick={onClick} disabled={disabled || loading}>
      {label}
    </button>
  )
}
