import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveBusiness {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "manager" | "employee";
}

interface AppState {
  activeBusiness: ActiveBusiness | null;
  setActiveBusiness: (b: ActiveBusiness | null) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeBusiness: null,
      setActiveBusiness: (b) => set({ activeBusiness: b }),
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      theme: "light",
      setTheme: (t) => set({ theme: t }),
    }),
    { name: "ssp-app-store" }
  )
);
