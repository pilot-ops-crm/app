'use server';

import { createClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

type Step1Data = {
  name: string;
  gender: string;
};

type Step2Data = {
  use_case: string[];
  leads_per_month: string;
};

type Step3Data = {
  active_platforms: string[];
};

type Step4Data = {
  business_type: string;
  pilot_goal: string[];
};

type Step5Data = {
  current_tracking: string[];
  tone_reference_file?: string;
};

export async function updateStep1(userId: string, data: Step1Data) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        name: data.name,
        gender: data.gender,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (error) throw new Error(error.message);
    
    revalidatePath('/onboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating step 1:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateStep2(userId: string, data: Step2Data) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        use_case: data.use_case,
        leads_per_month: data.leads_per_month,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (error) throw new Error(error.message);
    
    revalidatePath('/onboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating step 2:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateStep3(userId: string, data: Step3Data) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        active_platforms: data.active_platforms,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (error) throw new Error(error.message);
    
    revalidatePath('/onboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating step 3:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateStep4(userId: string, data: Step4Data) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        business_type: data.business_type,
        pilot_goal: data.pilot_goal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (error) throw new Error(error.message);
    
    revalidatePath('/onboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating step 4:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateStep5(userId: string, data: Step5Data) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        current_tracking: data.current_tracking,
        ...(data.tone_reference_file ? { tone_reference_file: data.tone_reference_file } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (error) throw new Error(error.message);
    
    revalidatePath('/onboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating step 5:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function completeOnboarding(userId: string) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (error) throw new Error(error.message);
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function uploadToneReference(userId: string, file: File) {
  try {
    const supabase = createClient();
    
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `tone-references/${fileName}`;
    
    // Use FormData to upload the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Store reference in database
    const { error: dbError } = await supabase
      .from('users')
      .update({
        tone_reference_file: filePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (dbError) throw new Error(dbError.message);
    
    revalidatePath('/onboard');
    return { success: true, filePath };
  } catch (error) {
    console.error('Error uploading tone reference:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getUserOnboardingData(userId: string) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw new Error(error.message);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user onboarding data:', error);
    return { success: false, error: (error as Error).message, data: null };
  }
}