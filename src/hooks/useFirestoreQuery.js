export const useFirestoreQuery = () => {
  const sort = (items, key, order = 'asc') => {
    const sorted = [...items].sort((a, b) => {
      let valA = a[key]
      let valB = b[key]
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()
      if (valA < valB) return order === 'asc' ? -1 : 1
      if (valA > valB) return order === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }

  const filter = (items, predicate) => items.filter(predicate)

  const search = (items, query, fields = ['label', 'title', 'comment']) => {
    const q = query.toLowerCase()
    return items.filter((item) =>
      fields.some((field) => String(item[field] || '').toLowerCase().includes(q))
    )
  }

  return { sort, filter, search }
}
