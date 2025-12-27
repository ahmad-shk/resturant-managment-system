// Firebase Realtime Database REST API Configuration
const firebaseConfig = {
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://restaurant-order-system-52c7e-default-rtdb.firebaseio.com",
}

// Helper function to construct Firebase REST API URL
function getFirebaseURL(path: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return `${firebaseConfig.databaseURL}/${cleanPath}.json`
}

// Initialize Firebase (REST API doesn't need initialization, just return success)
export async function initializeFirebase() {
  if (typeof window === "undefined") {
    return null
  }

  try {
    // Test connection by fetching from root
    const response = await fetch(getFirebaseURL(""), { method: "GET" })
    if (response.ok) {
      console.log("[v0] Firebase REST API connected successfully")
      return true
    }
    return null
  } catch (error) {
    console.error("[v0] Firebase REST API connection error:", error)
    return null
  }
}

// Listen to database changes using Server-Sent Events (streaming)
export function onDatabaseValue(path: string, callback: (snapshot: any) => void) {
  if (typeof window === "undefined") {
    return () => {}
  }

  let isActive = true
  const url = getFirebaseURL(path)

  // Poll for updates every 2 seconds (for real-time feel)
  const pollInterval = setInterval(async () => {
    if (!isActive) return

    try {
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const snapshot = {
          exists: () => data !== null,
          val: () => data,
        }
        callback(snapshot)
      }
    } catch (error) {
      console.error("[v0] Error polling Firebase:", error)
    }
  }, 2000)

  // Initial fetch
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (isActive) {
        const snapshot = {
          exists: () => data !== null,
          val: () => data,
        }
        callback(snapshot)
      }
    })
    .catch((error) => console.error("[v0] Initial fetch error:", error))

  // Return unsubscribe function
  return () => {
    isActive = false
    clearInterval(pollInterval)
    console.log("[v0] Unsubscribed from", path)
  }
}

// Update data in Firebase using PATCH
export async function updateDatabase(path: string, data: any) {
  if (typeof window === "undefined") {
    return Promise.reject("Not in browser environment")
  }

  try {
    const url = getFirebaseURL(path)
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Firebase update failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("[v0] Firebase update successful:", path)
    return result
  } catch (error) {
    console.error("[v0] Firebase update error:", error)
    throw error
  }
}

// Set data in Firebase using PUT
export async function setDatabase(path: string, data: any) {
  if (typeof window === "undefined") {
    return Promise.reject("Not in browser environment")
  }

  try {
    const url = getFirebaseURL(path)
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Firebase set failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("[v0] Firebase set successful:", path)
    return result
  } catch (error) {
    console.error("[v0] Firebase set error:", error)
    throw error
  }
}

// Push data to Firebase (creates new entry with auto-generated key)
export async function pushDatabase(path: string, data: any) {
  if (typeof window === "undefined") {
    return Promise.reject("Not in browser environment")
  }

  try {
    const url = getFirebaseURL(path)
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Firebase push failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("[v0] Firebase push successful:", path, result.name)
    return result
  } catch (error) {
    console.error("[v0] Firebase push error:", error)
    throw error
  }
}
