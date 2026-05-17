import admin from 'firebase-admin'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function cleanupUsers() {
  const usersRef = db.collection('users')
  const snapshot = await usersRef.get()

  let deletedMining = 0
  let addedHashRate = 0

  const docs = snapshot.docs
  const chunkSize = 500

  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = db.batch()
    const chunk = docs.slice(i, i + chunkSize)

    chunk.forEach(doc => {
      const data = doc.data()
      const updates = {}

      if (data.mining !== undefined) {
        updates.mining = admin.firestore.FieldValue.delete()
        deletedMining++
      }

      if (data.hashRate === undefined || data.hashRate === null) {
        updates.hashRate = 100
        addedHashRate++
      }

      if (data.isMining === undefined) {
        updates.isMining = false
      }

      if (data.timeLeft === undefined) {
        updates.timeLeft = 0
      }

      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, updates)
      }
    })

    await batch.commit()
  }

  console.log(`Done!`)
  console.log(`- Removed 'mining' field from ${deletedMining} users`)
  console.log(`- Added hashRate: 100 to ${addedHashRate} users`)
}

cleanupUsers().catch(err => {
  console.error(err)
  process.exit(1)
})
