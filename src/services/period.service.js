import { mergeCouple } from '../firebase/firestore'

export async function updatePeriod(doc, lastStart, cycleLength) {
  await mergeCouple({ 'profiles.her.period': { lastStart, cycleLength } })
}
