import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getDatabase, ref, onValue, update, type Database } from "firebase/database"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let database: Database | null = null
let firestoreInstance: Firestore | null = null

function initializeFirebaseApp() {
  if (!firebaseConfig.projectId) {
    console.warn("Firebase projectId is missing. Please add Firebase credentials in Vars section.")
    return null
  }

  try {
    // Check if app is already initialized
    if (getApps().length > 0) {
      app = getApps()[0]
    } else {
      app = initializeApp(firebaseConfig)
    }

    if (!firestoreInstance && app) {
      firestoreInstance = getFirestore(app)
    }

    return app
  } catch (error) {
    console.error("Firebase initialization error:", error)
    return null
  }
}

// Auto-initialize on module load
if (typeof window !== "undefined" && firebaseConfig.projectId) {
  initializeFirebaseApp()
}

export function getFirestoreDb(): Firestore | null {
  if (!firestoreInstance && firebaseConfig.projectId) {
    initializeFirebaseApp()
  }

  return firestoreInstance
}

export async function initializeFirebase(): Promise<Database | null> {
  try {
    if (!app) {
      initializeFirebaseApp()
    }

    if (!database && app) {
      database = getDatabase(app)
    }

    return database
  } catch (error) {
    console.error("Firebase Database initialization error:", error)
    return null
  }
}

export async function onDatabaseValue(path: string, callback: (snapshot: any) => void): Promise<() => void> {
  const db = await initializeFirebase()

  if (!db) {
    throw new Error("Firebase database not initialized")
  }

  const dbRef = ref(db, path)

  const unsubscribe = onValue(dbRef, callback, (error) => {
    console.error(`Error listening to ${path}:`, error)
  })

  return unsubscribe
}

export async function updateDatabase(path: string, data: any): Promise<void> {
  const db = await initializeFirebase()

  if (!db) {
    throw new Error("Firebase database not initialized")
  }

  const dbRef = ref(db, path)
  await update(dbRef, data)
}

// Legacy exports for compatibility
export { database, app }
export const db = firestoreInstance
