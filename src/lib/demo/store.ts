"use client"

import { useSyncExternalStore } from "react"

import { SEED, seedState } from "./seed"
import type { DemoState } from "./types"

/**
 * Tiny external store for the demo registry, persisted to localStorage.
 * The server (and the first client render) always sees the seed, so pages
 * prerender and hydrate cleanly; the saved state takes over right after.
 */
const KEY = "cadastrum-demo-v1"

let state: DemoState = SEED
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as DemoState
    if (parsed?.version === 1 && Array.isArray(parsed.entries) && Array.isArray(parsed.reports)) state = parsed
  } catch {
    // Unreadable or blocked storage: keep the seed.
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked: the demo keeps working in memory.
  }
}

export function getState(): DemoState {
  load()
  return state
}

export function setState(update: (s: DemoState) => DemoState) {
  load()
  state = update(state)
  persist()
  listeners.forEach((l) => l())
}

export function resetDemo() {
  const identity = state.identity
  state = { ...seedState(), identity }
  persist()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return
    loaded = false
    state = SEED
    load()
    listener()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, getState, () => SEED)
}

const noop = () => () => {}

/** False during prerender and hydration, true once the saved demo state is in use. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}
