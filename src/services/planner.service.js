import { mergeCouple } from '../firebase/firestore'

export async function addBuy(doc, profile, entry) {
  const list = [...(doc.profiles[profile].planners.buy || []), entry]
  await mergeCouple({ [`profiles.${profile}.planners.buy`]: list })
}

export async function addDate(doc, profile, entry) {
  const list = [...(doc.profiles[profile].planners.date || []), entry]
  await mergeCouple({ [`profiles.${profile}.planners.date`]: list })
}

export async function toggleBuy(doc, profile, index) {
  const list = [...(doc.profiles[profile].planners.buy || [])]
  list[index].bought = !list[index].bought
  await mergeCouple({ [`profiles.${profile}.planners.buy`]: list })
}
