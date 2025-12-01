import { create } from "zustand"

interface UIState {
  showVoiceChat: boolean
  setShowVoiceChat: (show: boolean) => void
  toggleVoiceChat: () => void
}

export const useUIStore = create<UIState>((set) => ({
  showVoiceChat: false,
  setShowVoiceChat: (show) => set({ showVoiceChat: show }),
  toggleVoiceChat: () => set((state) => ({ showVoiceChat: !state.showVoiceChat })),
}))

