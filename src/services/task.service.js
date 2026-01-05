import { mergeCouple } from '../firebase/firestore'

export async function addTask(doc, profile, task) {
  const list = [...(doc.profiles[profile].tasks || []), task]
  await mergeCouple({ [`profiles.${profile}.tasks`]: list })
}

export async function toggleTask(doc, profile, index) {
  const list = [...(doc.profiles[profile].tasks || [])]
  list[index].done = !list[index].done
  await mergeCouple({ [`profiles.${profile}.tasks`]: list })
}
