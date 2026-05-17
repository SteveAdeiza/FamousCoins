import admin from 'firebase-admin'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function cleanupUsers() {
  const usersRef = db.collection('users')
  const snapshot = await usersRef.get()
  
  let deletedMining = 0
  let addedHashRate = 0
  const batch = db.batch()

  snapshot.forEach(doc => {
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

  if (deletedMining === 0 && addedHashRate === 0) {
    console.log('Nothing to update. All users are clean.')
    process.exit(0)
    return
  }

  await batch.commit()
  console.log(`Done!`)
  console.log(`- Removed 'mining' field from ${deletedMining} users`)
  console.log(`- Added hashRate: 100 to ${addedHashRate} users`)
  
  process.exit(0)
}

cleanupUsers().catch(err => {
  console.error(err)
  process.exit(1)
})
