import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  devices: [],
  locations: new Map(),
  missions: [],
  alerts: [],
  selectedDevice: null,
  selectedMission: null,
  
  setUser: (user) => set({ user }),
  
  setDevices: (devices) => set({ devices }),
  
  updateLocation: (location) =>
    set((state) => {
      const newLocations = new Map(state.locations);
      newLocations.set(location.device, location);
      return { locations: newLocations };
    }),
  
  setMissions: (missions) => set({ missions }),
  
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100),
    })),
  
  setAlerts: (alerts) => set({ alerts }),
  
  setSelectedDevice: (deviceId) => set({ selectedDevice: deviceId }),
  
  setSelectedMission: (missionId) => set({ selectedMission: missionId }),
}));