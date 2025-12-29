import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  type Unsubscribe,
} from "firebase/firestore"
import type { Order } from "./types"
import { getFirestoreDb } from "./firebase"

const ORDERS_COLLECTION = "orders"

function getOrdersCollection() {
  const db = getFirestoreDb()

  if (!db) {
    const errorMsg = "Firestore not initialized. Please add Firebase environment variables in the Vars section."
    console.error(errorMsg)
    throw new Error(errorMsg)
  }

  return collection(db, ORDERS_COLLECTION)
}

export async function addOrder(order: Omit<Order, "id">): Promise<string> {
  const ordersCollection = getOrdersCollection()
  const docRef = await addDoc(ordersCollection, {
    ...order,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
  return docRef.id
}

export function subscribeToActiveOrders(callback: (orders: Order[]) => void): Unsubscribe | null {
  const db = getFirestoreDb()

  if (!db) {
    console.warn("Firestore database not initialized. Please add Firebase credentials in Vars section.")
    return null
  }

  try {
    const ordersCollection = getOrdersCollection()
    const q = query(ordersCollection, where("status", "!=", "completed"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]

        const sorted = orders.sort((a, b) => a.createdAt - b.createdAt)
        callback(sorted)
      },
      (error) => {
        console.error("Error subscribing to orders:", error)
      },
    )

    return unsubscribe
  } catch (error) {
    console.error("Failed to subscribe to active orders:", error)
    return null
  }
}

export async function getCompletedOrders(): Promise<Order[]> {
  const db = getFirestoreDb()

  if (!db) {
    console.warn("Firestore not initialized, returning empty array")
    return []
  }

  try {
    const ordersCollection = getOrdersCollection()
    const q = query(ordersCollection, where("status", "==", "completed"))
    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[]

    return orders.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (error) {
    console.error("Failed to fetch completed orders:", error)
    return []
  }
}

export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
  const db = getFirestoreDb()

  if (!db) {
    throw new Error("Firestore not initialized. Add Firebase credentials in Vars section.")
  }

  const orderRef = doc(db, ORDERS_COLLECTION, orderId)
  await updateDoc(orderRef, {
    status,
    updatedAt: Date.now(),
  })
}

export async function getActiveOrders(): Promise<Order[]> {
  const db = getFirestoreDb()

  if (!db) {
    console.warn("Firestore database not initialized. Returning empty orders.")
    return []
  }

  try {
    const ordersCollection = getOrdersCollection()
    const q = query(ordersCollection, where("status", "!=", "completed"))
    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[]

    return orders.sort((a, b) => a.createdAt - b.createdAt)
  } catch (error) {
    console.error("Failed to fetch active orders:", error)
    return []
  }
}
