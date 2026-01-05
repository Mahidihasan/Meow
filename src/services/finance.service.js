import { mergeCouple } from '../firebase/firestore'

export async function addDeposit(doc, profile, entry) {
  const list = [...(doc.profiles[profile].finance.deposits || []), { ...entry, kind: 'deposit' }]
  await mergeCouple({ [`profiles.${profile}.finance.deposits`]: list })
}

export async function addExpense(doc, profile, entry) {
  const list = [...(doc.profiles[profile].finance.expenses || []), { ...entry, kind: 'expense' }]
  await mergeCouple({ [`profiles.${profile}.finance.expenses`]: list })
}
