import { create } from "zustand";
import apiClient from "@/lib/api-client";
import type { User, ChildProfile } from "@/types";

interface AuthState {
  user: User | null;
  childProfiles: ChildProfile[];
  currentChildProfile: ChildProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;

  fetchChildProfiles: () => Promise<void>;
  selectChildProfile: (profile: ChildProfile) => void;
  clearChildProfile: () => void;
  createChildProfile: (data: Partial<ChildProfile>) => Promise<ChildProfile>;
  updateChildProfile: (id: string, data: Partial<ChildProfile>) => Promise<void>;
  deleteChildProfile: (id: string) => Promise<void>;

  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  childProfiles: [],
  currentChildProfile: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user_id", data.user.id);
    localStorage.setItem("user_data", JSON.stringify(data.user));
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const { data } = await apiClient.post("/auth/register", {
      name,
      email,
      password,
      password_confirmation: password,
    });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user_id", data.user.id);
    localStorage.setItem("user_data", JSON.stringify(data.user));
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await apiClient.delete("/auth/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_data");
    localStorage.removeItem("child_profile_id");
    // Clear parent access verification on logout
    sessionStorage.removeItem("parent_access_verified");
    set({
      user: null,
      childProfiles: [],
      currentChildProfile: null,
      isAuthenticated: false,
    });
  },

  setPin: async (pin) => {
    await apiClient.post("/auth/pin", { pin });
    set((state) => {
      const updatedUser = state.user
        ? { ...state.user, has_pin: true }
        : null;
      if (updatedUser) {
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
      }
      return { user: updatedUser };
    });
  },

  verifyPin: async (pin) => {
    const { data } = await apiClient.post("/auth/verify_pin", { pin });
    return data.verified;
  },

  fetchChildProfiles: async () => {
    const { data } = await apiClient.get("/child_profiles");
    const profiles = data.data.map(
      (item: { attributes: ChildProfile }) => item.attributes
    );
    set({ childProfiles: profiles });
  },

  selectChildProfile: (profile) => {
    localStorage.setItem("child_profile_id", profile.id);
    set({ currentChildProfile: profile });
  },

  clearChildProfile: () => {
    localStorage.removeItem("child_profile_id");
    set({ currentChildProfile: null });
  },

  createChildProfile: async (data) => {
    const response = await apiClient.post("/child_profiles", data);
    const profile = response.data.data.attributes;
    set((state) => ({
      childProfiles: [...state.childProfiles, profile],
    }));
    return profile;
  },

  updateChildProfile: async (id, data) => {
    const response = await apiClient.patch(`/child_profiles/${id}`, data);
    const updated = response.data.data.attributes;
    set((state) => ({
      childProfiles: state.childProfiles.map((p) =>
        p.id === id ? updated : p
      ),
      currentChildProfile:
        state.currentChildProfile?.id === id
          ? updated
          : state.currentChildProfile,
    }));
  },

  deleteChildProfile: async (id) => {
    await apiClient.delete(`/child_profiles/${id}`);
    set((state) => ({
      childProfiles: state.childProfiles.filter((p) => p.id !== id),
      currentChildProfile:
        state.currentChildProfile?.id === id
          ? null
          : state.currentChildProfile,
    }));
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    if (token && userId) {
      let restoredUser: User | null = null;
      try {
        const userData = localStorage.getItem("user_data");
        if (userData) restoredUser = JSON.parse(userData);
      } catch {
        // ignore parse errors
      }
      set({ isAuthenticated: true, isLoading: false, user: restoredUser });
      // Fetch user data
      apiClient
        .get("/child_profiles")
        .then(({ data }) => {
          const profiles = data.data.map(
            (item: { attributes: ChildProfile }) => item.attributes
          );
          const savedProfileId = localStorage.getItem("child_profile_id");
          const currentProfile = savedProfileId
            ? profiles.find((p: ChildProfile) => p.id === savedProfileId) ||
              null
            : null;
          set({ childProfiles: profiles, currentChildProfile: currentProfile });
        })
        .catch(() => {
          // Token invalid
          set({ isAuthenticated: false, isLoading: false });
        });
    } else {
      set({ isLoading: false });
    }
  },
}));
