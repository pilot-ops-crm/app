import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OnboardingState = {
  name: string;
  email: string;
  gender: string;
  
  use_case: string[];
  leads_per_month: string;
  active_platforms: string[];
  
  business_type: string;
  pilot_goal: string[];
  current_tracking: string[];
  tone_reference_file: string;
  
  onboarding_complete: boolean;
  
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setGender: (gender: string) => void;
  
  setUseCase: (use_case: string[]) => void;
  setLeadsPerMonth: (leads_per_month: string) => void;
  setActivePlatforms: (active_platforms: string[]) => void;
  
  setBusinessType: (business_type: string) => void;
  setPilotGoal: (pilot_goal: string[]) => void;
  setCurrentTracking: (current_tracking: string[]) => void;
  setToneReferenceFile: (tone_reference_file: string) => void;
  
  setOnboardingComplete: (onboarding_complete: boolean) => void;
  
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      name: '',
      email: '',
      gender: '',
      
      use_case: [],
      leads_per_month: '',
      active_platforms: [],
      
      business_type: '',
      pilot_goal: [],
      current_tracking: [],
      tone_reference_file: '',
      
      onboarding_complete: false,
      
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      setGender: (gender) => set({ gender }),
      
      setUseCase: (use_case) => set({ use_case }),
      setLeadsPerMonth: (leads_per_month) => set({ leads_per_month }),
      setActivePlatforms: (active_platforms) => set({ active_platforms }),
      
      setBusinessType: (business_type) => set({ business_type }),
      setPilotGoal: (pilot_goal) => set({ pilot_goal }),
      setCurrentTracking: (current_tracking) => set({ current_tracking }),
      setToneReferenceFile: (tone_reference_file) => set({ tone_reference_file }),
      
      setOnboardingComplete: (onboarding_complete) => set({ onboarding_complete }),
      
      reset: () => set({
        name: '',
        email: '',
        gender: '',
        
        use_case: [],
        leads_per_month: '',
        active_platforms: [],
        
        business_type: '',
        pilot_goal: [],
        current_tracking: [],
        tone_reference_file: '',
        
        onboarding_complete: false,
      }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
);