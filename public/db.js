let db
// create the budget database in indexedDB
const request = indexedDB.open('budget', 1)

// When we store new variables, send them to the db
request.onupgradeneeded = event => {
  db = event.target.result
  db.createObjectStore('pending', { autoIncrement: true })
}

// Run the check database function when back online
request.onsuccess = event => {
  db = event.target.result

  if (navigator.onLine) {
    checkDatabase()
  }
}

// Gives the error code when there is an error retriving the data
request.onerror = event => {
  console.log(event.target.errorCode)
}

// define the function here from the index.js file line 139
const saveRecord = item => {
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore('pending')
  store.add(item)
}

// Function to check the database and pull out items.
const checkDatabase = () => {
  console.log('checking database')
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore('pending')
  const getAll = store.getAll()

  // Onsuccess puts all saved transaction into the page
  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(getAll.result)
      })
        .then(() => {
          const transaction = db.transaction(['pending'], 'readwrite')
          const store = transaction.objectStore('pending')
          store.clear()
        })
    }
  }
}

window.addEventListener('online', checkDatabase)