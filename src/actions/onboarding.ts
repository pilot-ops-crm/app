'use server';

import { createClient } from '@/lib/supabase';
import { arraysEqual } from '@/lib/utils';
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
};

const supabase = createClient();

async function getUserEmail(userId: string) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  
  if (error || !data.user) {
    throw new Error(`Unable to get user email: ${error?.message}`);
  }
  
  return data.user.email;
}

export async function updateStep1(userId: string, data: Step1Data) {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('users')
      .select('name, gender, email')
      .eq('id', userId)
      .maybeSingle();
      
    if (existingData && 
        existingData.name === data.name && 
        existingData.gender === data.gender) {
      return { success: true, data: existingData };
    }
    
    let email = existingData?.email;
    if (!email && fetchError) {
      email = await getUserEmail(userId);
    }
    
    const { data: updateData, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        name: data.name,
        gender: data.gender,
        email: email,
        updated_at: new Date().toISOString(),
        created_at: fetchError ? new Date().toISOString() : undefined,
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (error) {
      return { success: false, error: `Update failed: ${error.message}` };
    }
    
    revalidatePath('/onboard');
    return { success: true, data: updateData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateStep2(userId: string, data: Step2Data) {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('users')
      .select('use_case, leads_per_month, email')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingData && 
        arraysEqual(existingData.use_case as string[], data.use_case) && 
        existingData.leads_per_month === data.leads_per_month) {
      return { success: true, data: existingData };
    }
    
    let email = existingData?.email;
    if (!email && fetchError) {
      email = await getUserEmail(userId);
    }
    
    const { data: updateData, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        use_case: data.use_case,
        leads_per_month: data.leads_per_month,
        email: email,
        updated_at: new Date().toISOString(),
        created_at: fetchError ? new Date().toISOString() : undefined,
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (error) {
      return { success: false, error: `Update failed: ${error.message}` };
    }
    
    revalidatePath('/onboard');
    return { success: true, data: updateData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateStep3(userId: string, data: Step3Data) {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('users')
      .select('active_platforms, email')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingData && 
        arraysEqual(existingData.active_platforms as string[], data.active_platforms)) {
      return { success: true, data: existingData };
    }
    
    let email = existingData?.email;
    if (!email && fetchError) {
      email = await getUserEmail(userId);
    }
    
    const { data: updateData, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        active_platforms: data.active_platforms,
        email: email,
        updated_at: new Date().toISOString(),
        created_at: fetchError ? new Date().toISOString() : undefined,
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (error) {
      return { success: false, error: `Update failed: ${error.message}` };
    }
    
    revalidatePath('/onboard');
    return { success: true, data: updateData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateStep4(userId: string, data: Step4Data) {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('users')
      .select('business_type, pilot_goal, email')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingData && 
        existingData.business_type === data.business_type &&
        arraysEqual(existingData.pilot_goal as string[], data.pilot_goal)) {
      return { success: true, data: existingData };
    }
    
    let email = existingData?.email;
    if (!email && fetchError) {
      email = await getUserEmail(userId);
    }
    
    const { data: updateData, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        business_type: data.business_type,
        pilot_goal: data.pilot_goal,
        email: email,
        updated_at: new Date().toISOString(),
        created_at: fetchError ? new Date().toISOString() : undefined,
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (error) {
      return { success: false, error: `Update failed: ${error.message}` };
    }
    
    revalidatePath('/onboard');
    return { success: true, data: updateData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateStep5(userId: string, data: Step5Data) {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('users')
      .select('current_tracking, email')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingData && 
        arraysEqual(existingData.current_tracking as string[], data.current_tracking)) {
      return { success: true, data: existingData };
    }
    
    let email = existingData?.email;
    if (!email && fetchError) {
      email = await getUserEmail(userId);
    }
    
    const { data: updateData, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        current_tracking: data.current_tracking,
        email: email,
        updated_at: new Date().toISOString(),
        created_at: fetchError ? new Date().toISOString() : undefined,
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (error) {
      return { success: false, error: `Update failed: ${error.message}` };
    }
    
    revalidatePath('/onboard');
    return { success: true, data: updateData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function completeOnboarding(userId: string) {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('users')
      .select('onboarding_complete, email')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingData && existingData.onboarding_complete === true) {
      return { success: true, data: existingData };
    }
    
    let email = existingData?.email;
    if (!email && fetchError) {
      email = await getUserEmail(userId);
    }
    
    const { data: updateData, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        onboarding_complete: true,
        email: email,
        updated_at: new Date().toISOString(),
        created_at: fetchError ? new Date().toISOString() : undefined,
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (error) {
      console.error(`Error completing onboarding for user ${userId}:`, error);
      return { success: false, error: `Update failed: ${error.message}` };
    }
    
    revalidatePath('/');
    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getUserOnboardingData(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching onboarding data for user ${userId}:`, error);
      throw new Error(error.message);
    }
    
    return { success: true, data: data || null };
  } catch (error) {
    console.error('Error fetching user onboarding data:', error);
    return { success: false, error: (error as Error).message, data: null };
  }
}