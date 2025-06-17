"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboardingStore } from "@/stores/onboarding";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import useUser from "@/hooks/use-user";
import {
  updateStep1,
  updateStep2,
  updateStep3,
  updateStep4,
  updateStep5,
  completeOnboarding,
} from "@/actions/onboarding";
import { supabase } from "@/lib/supabase";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  active_platforms_options,
  business_type_options,
  current_tracking_options,
  gender_options,
  leads_per_month_options,
  pilot_goal_options,
  use_case_options,
} from "@/lib/onboarding-data";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckboxContainer } from "@/components/ui/checkbox";
import StepButtons from "@/components/step-buttons";
import { toast } from "sonner";

const step1Schema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  gender: z.string().min(1, { message: "Gender selection is required" }),
});

const step2Schema = z.object({
  use_case: z
    .array(z.string())
    .min(1, { message: "Please select at least one use case" }),
  leads_per_month: z.string().min(1, {
    message: "Please select your expected lead volume",
  }),
});

const step3Schema = z.object({
  active_platforms: z
    .array(z.string())
    .min(1, { message: "Please select at least one platform" }),
});

const step4Schema = z.object({
  business_type: z
    .string()
    .min(1, { message: "Please select your business type" }),
  pilot_goal: z
    .array(z.string())
    .min(1, { message: "Please select at least one goal" }),
});

const step5Schema = z.object({
  current_tracking: z
    .array(z.string())
    .min(1, { message: "Please select at least one tracking method" }),
});

type Step1FormValues = z.infer<typeof step1Schema>;
type Step2FormValues = z.infer<typeof step2Schema>;
type Step3FormValues = z.infer<typeof step3Schema>;
type Step4FormValues = z.infer<typeof step4Schema>;
type Step5FormValues = z.infer<typeof step5Schema>;

const steps = [
  { id: 0, name: "Personal Info" },
  { id: 1, name: "Pilot Usage" },
  { id: 2, name: "Platforms" },
  { id: 3, name: "Business" },
  { id: 4, name: "Tracking" },
  { id: 5, name: "Complete" },
];

export default function OnboardPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useUser();

  const {
    name,
    setName,
    email,
    gender,
    setGender,
    use_case,
    setUseCase,
    leads_per_month,
    setLeadsPerMonth,
    active_platforms,
    setActivePlatforms,
    business_type,
    setBusinessType,
    pilot_goal,
    setPilotGoal,
    current_tracking,
    setCurrentTracking,
    setOnboardingComplete,
  } = useOnboardingStore();

  const step1Form = useForm<Step1FormValues>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: name || "",
      gender: gender || "",
    },
    mode: "onChange",
  });

  const step2Form = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      use_case: use_case || [],
      leads_per_month: leads_per_month || "",
    },
    mode: "onChange",
  });

  const step3Form = useForm<Step3FormValues>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      active_platforms: active_platforms || [],
    },
    mode: "onChange",
  });

  const step4Form = useForm<Step4FormValues>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      business_type: business_type || "",
      pilot_goal: pilot_goal || [],
    },
    mode: "onChange",
  });

  const step5Form = useForm<Step5FormValues>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      current_tracking: current_tracking || [],
    },
    mode: "onChange",
  });

  const [stepValidationState, setStepValidationState] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    true,
  ]);

  useEffect(() => {
    const subscription = step1Form.watch(() => {
      const isValid = step1Form.formState.isValid;
      setStepValidationState((prev) => {
        const newState = [...prev];
        newState[0] = isValid;
        return newState;
      });
    });
    return () => subscription.unsubscribe();
  }, [step1Form]);

  useEffect(() => {
    const subscription = step2Form.watch(() => {
      const isValid = step2Form.formState.isValid;
      setStepValidationState((prev) => {
        const newState = [...prev];
        newState[1] = isValid;
        return newState;
      });
    });
    return () => subscription.unsubscribe();
  }, [step2Form]);

  useEffect(() => {
    const subscription = step3Form.watch(() => {
      const isValid = step3Form.formState.isValid;
      setStepValidationState((prev) => {
        const newState = [...prev];
        newState[2] = isValid;
        return newState;
      });
    });
    return () => subscription.unsubscribe();
  }, [step3Form]);

  useEffect(() => {
    const subscription = step4Form.watch(() => {
      const isValid = step4Form.formState.isValid;
      setStepValidationState((prev) => {
        const newState = [...prev];
        newState[3] = isValid;
        return newState;
      });
    });
    return () => subscription.unsubscribe();
  }, [step4Form]);

  useEffect(() => {
    const subscription = step5Form.watch(() => {
      const isValid = step5Form.formState.isValid;
      setStepValidationState((prev) => {
        const newState = [...prev];
        newState[4] = isValid;
        return newState;
      });
    });
    return () => subscription.unsubscribe();
  }, [step5Form]);

  useEffect(() => {
    if (!user || !user.id) return;

    const loadUserData = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            return;
          }
          console.error("Error fetching user data:", error);
          return;
        }

        if (data) {
          const userData = data as Record<
            string,
            string | string[] | boolean | null
          >;

          if (userData.name) {
            setName(userData.name as string);
            step1Form.setValue("name", userData.name as string);
          }

          if (userData.gender) {
            setGender(userData.gender as string);
            step1Form.setValue("gender", userData.gender as string);
          }

          if (userData.use_case && Array.isArray(userData.use_case)) {
            setUseCase(userData.use_case as string[]);
            step2Form.setValue("use_case", userData.use_case as string[]);
          }

          if (userData.leads_per_month) {
            setLeadsPerMonth(userData.leads_per_month as string);
            step2Form.setValue(
              "leads_per_month",
              userData.leads_per_month as string
            );
          }

          if (
            userData.active_platforms &&
            Array.isArray(userData.active_platforms)
          ) {
            setActivePlatforms(userData.active_platforms as string[]);
            step3Form.setValue(
              "active_platforms",
              userData.active_platforms as string[]
            );
          }

          if (userData.business_type) {
            setBusinessType(userData.business_type as string);
            step4Form.setValue(
              "business_type",
              userData.business_type as string
            );
          }

          if (userData.pilot_goal && Array.isArray(userData.pilot_goal)) {
            setPilotGoal(userData.pilot_goal as string[]);
            step4Form.setValue("pilot_goal", userData.pilot_goal as string[]);
          }

          if (
            userData.current_tracking &&
            Array.isArray(userData.current_tracking)
          ) {
            setCurrentTracking(userData.current_tracking as string[]);
            step5Form.setValue(
              "current_tracking",
              userData.current_tracking as string[]
            );
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [
    user,
    step1Form,
    step2Form,
    step3Form,
    step4Form,
    step5Form,
    setActivePlatforms,
    setBusinessType,
    setCurrentTracking,
    setGender,
    setLeadsPerMonth,
    setName,
    setPilotGoal,
    setUseCase,
  ]);

  const handleStep1Submit = async (values: Step1FormValues) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await updateStep1(user.id.toString(), values);

      if (result.success) {
        setName(values.name);
        setGender(values.gender);
        setActiveStep((prev) => prev + 1);
      } else {
        console.error("Failed to update step 1:", result.error);
        toast.error(`Failed to save: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating step 1:", error);
      toast.error(`An error occurred: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (values: Step2FormValues) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await updateStep2(user.id.toString(), values);

      if (result.success) {
        setUseCase(values.use_case);
        setLeadsPerMonth(values.leads_per_month);
        setActiveStep((prev) => prev + 1);
      } else {
        console.error("Failed to update step 2:", result.error);
        toast.error(`Failed to save: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating step 2:", error);
      toast.error(`An error occurred: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (values: Step3FormValues) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await updateStep3(user.id.toString(), values);
      if (result.success) {
        setActivePlatforms(values.active_platforms);
        setActiveStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating step 3:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep4Submit = async (values: Step4FormValues) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await updateStep4(user.id.toString(), values);
      if (result.success) {
        setBusinessType(values.business_type);
        setPilotGoal(values.pilot_goal);
        setActiveStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating step 4:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep5Submit = async (values: Step5FormValues) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await updateStep5(user.id.toString(), values);
      if (result.success) {
        setCurrentTracking(values.current_tracking);
        setActiveStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error updating step 5:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await completeOnboarding(user.id.toString());
      if (result.success) {
        setOnboardingComplete(true);
        router.push("/");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex flex-col justify-center mx-4 md:mx-8 lg:mx-16 xl:mx-32 py-4 md:py-8">
      <Card className="shadow-none border-none">
        <CardHeader className="px-4 sm:px-8 border-border">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome to Pilot
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Let&apos;s set up your account to get the most out of the platform.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <Stepper
            value={activeStep}
            onValueChange={(newStep) => {
              if (newStep < activeStep) {
                setActiveStep(newStep);
                return;
              }

              if (newStep === activeStep + 1) {
                const isValid = stepValidationState[activeStep];
                if (isValid) {
                  setActiveStep(newStep);
                }
              }
            }}
            className="px-2 sm:px-6 py-2"
          >
            {steps.map((step, index) => (
              <StepperItem
                key={step.id}
                step={step.id}
                disabled={
                  step.id > activeStep + 1 ||
                  (step.id > activeStep && !stepValidationState[activeStep])
                }
                completed={activeStep > step.id}
                loading={isLoading && step.id === activeStep}
                className="relative flex-1 !flex-col"
              >
                <StepperTrigger className="flex-col gap-3">
                  <StepperIndicator />
                  <div className="space-y-0.5 px-2">
                    <StepperTitle>{step.name}</StepperTitle>
                  </div>
                </StepperTrigger>
                {index < steps.length - 1 && (
                  <StepperSeparator className="absolute inset-x-0 left-[calc(50%+0.75rem+0.750rem)] top-6 -order-1 m-0 -translate-y-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
                )}
              </StepperItem>
            ))}
          </Stepper>

          <div className="border border-border p-4 sm:p-8 rounded-xl shadow-sm">
            {activeStep === 0 && (
              <Form {...step1Form}>
                <form
                  onSubmit={step1Form.handleSubmit(handleStep1Submit)}
                  className="space-y-6"
                >
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Personal Information
                  </h2>

                  <div className="space-y-4">
                    <FormField
                      control={step1Form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="name-input">Your name</FormLabel>
                          <FormControl>
                            <Input
                              id="name-input"
                              placeholder="Enter your full name"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label
                        htmlFor="email-input"
                        className="text-sm font-medium"
                      >
                        Your email
                      </Label>
                      <Input
                        id="email-input"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        disabled
                        className="h-12 text-base"
                      />
                    </div>

                    <FormField
                      control={step1Form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Your gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                            >
                              {gender_options.map((option) => (
                                <FormItem
                                  key={option.toLowerCase()}
                                  className="flex items-center space-x-1 space-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem
                                      value={option.toLowerCase()}
                                      id={`gender-${option.toLowerCase()}`}
                                      className="sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel
                                    htmlFor={`gender-${option.toLowerCase()}`}
                                    className={`border rounded-lg p-4 w-full flex items-center gap-2 cursor-pointer transition-all ${
                                      field.value === option.toLowerCase()
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-muted-foreground"
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded-full border ${
                                        field.value === option.toLowerCase()
                                          ? "border-4 border-primary"
                                          : "border border-muted-foreground"
                                      }`}
                                    ></div>
                                    <span>{option}</span>
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <StepButtons showBack={false} isLoading={isLoading} />
                </form>
              </Form>
            )}

            {activeStep === 1 && (
              <Form {...step2Form}>
                <form
                  onSubmit={step2Form.handleSubmit(handleStep2Submit)}
                  className="space-y-6"
                >
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Pilot Usage
                  </h2>

                  <FormField
                    control={step2Form.control}
                    name="use_case"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>What will you use Pilot for?</FormLabel>
                        <div className="space-y-2">
                          {use_case_options.map((option) => {
                            const value = option
                              .toLowerCase()
                              .replace(/\s+/g, "_");
                            return (
                              <CheckboxContainer
                                key={value}
                                checked={field.value?.includes(value)}
                                onClick={() => {
                                  const updatedValue = field.value?.includes(
                                    value
                                  )
                                    ? field.value.filter((val) => val !== value)
                                    : [...(field.value || []), value];
                                  field.onChange(updatedValue);
                                }}
                              >
                                <div
                                  className={`w-5 h-5 flex items-center justify-center rounded border ${
                                    field.value?.includes(value)
                                      ? "bg-primary border-primary"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {field.value?.includes(value) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span>{option}</span>
                              </CheckboxContainer>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step2Form.control}
                    name="leads_per_month"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          How many leads do you expect per month?
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                          >
                            {leads_per_month_options.map((option) => (
                              <FormItem
                                key={option}
                                className="flex items-center space-x-1 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={option}
                                    id={`leads-${option}`}
                                    className="sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`leads-${option}`}
                                  className={`border rounded-lg p-3 w-full flex items-center gap-2 cursor-pointer transition-all ${
                                    field.value === option
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-muted-foreground"
                                  }`}
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full border ${
                                      field.value === option
                                        ? "border-4 border-primary"
                                        : "border border-muted-foreground"
                                    }`}
                                  ></div>
                                  <span>{option}</span>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StepButtons isLoading={isLoading} onBack={handleBack} />
                </form>
              </Form>
            )}

            {activeStep === 2 && (
              <Form {...step3Form}>
                <form
                  onSubmit={step3Form.handleSubmit(handleStep3Submit)}
                  className="space-y-6"
                >
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Platforms Active On
                  </h2>

                  <FormField
                    control={step3Form.control}
                    name="active_platforms"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          Which platforms are you active on?
                        </FormLabel>
                        <div className="space-y-2">
                          {active_platforms_options.map((option) => {
                            const value = option
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/\//, "_");
                            return (
                              <CheckboxContainer
                                key={value}
                                checked={field.value?.includes(value)}
                                onClick={() => {
                                  const updatedValue = field.value?.includes(
                                    value
                                  )
                                    ? field.value.filter((val) => val !== value)
                                    : [...(field.value || []), value];
                                  field.onChange(updatedValue);
                                }}
                              >
                                <div
                                  className={`w-5 h-5 flex items-center justify-center rounded border ${
                                    field.value?.includes(value)
                                      ? "bg-primary border-primary"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {field.value?.includes(value) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span>{option}</span>
                              </CheckboxContainer>
                            );
                          })}
                        </div>
                        <FormDescription>
                          This helps us pre-optimize your inbox filters and
                          automations.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StepButtons isLoading={isLoading} onBack={handleBack} />
                </form>
              </Form>
            )}

            {activeStep === 3 && (
              <Form {...step4Form}>
                <form
                  onSubmit={step4Form.handleSubmit(handleStep4Submit)}
                  className="space-y-6"
                >
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Business Type & Goals
                  </h2>

                  <FormField
                    control={step4Form.control}
                    name="business_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>What type of business do you run?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                          >
                            {business_type_options.map((option) => {
                              const value = option
                                .toLowerCase()
                                .replace(/\s+/g, "_")
                                .replace(/\//, "_");
                              return (
                                <FormItem
                                  key={value}
                                  className="flex items-center space-x-1 space-y-0"
                                >
                                  <FormControl>
                                    <RadioGroupItem
                                      value={value}
                                      id={`business-${value}`}
                                      className="sr-only"
                                    />
                                  </FormControl>
                                  <FormLabel
                                    htmlFor={`business-${value}`}
                                    className={`border rounded-lg p-3 w-full flex items-center gap-2 cursor-pointer transition-all ${
                                      field.value === value
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-muted-foreground"
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded-full border ${
                                        field.value === value
                                          ? "border-4 border-primary"
                                          : "border border-muted-foreground"
                                      }`}
                                    ></div>
                                    <span>{option}</span>
                                  </FormLabel>
                                </FormItem>
                              );
                            })}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step4Form.control}
                    name="pilot_goal"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>What are your goals with Pilot?</FormLabel>
                        <div className="space-y-2">
                          {pilot_goal_options.map((option) => {
                            const value = option
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/&/, "and");
                            return (
                              <CheckboxContainer
                                key={value}
                                checked={field.value?.includes(value)}
                                onClick={() => {
                                  const updatedValue = field.value?.includes(
                                    value
                                  )
                                    ? field.value.filter((val) => val !== value)
                                    : [...(field.value || []), value];
                                  field.onChange(updatedValue);
                                }}
                              >
                                <div
                                  className={`w-5 h-5 flex items-center justify-center rounded border ${
                                    field.value?.includes(value)
                                      ? "bg-primary border-primary"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {field.value?.includes(value) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span>{option}</span>
                              </CheckboxContainer>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StepButtons isLoading={isLoading} onBack={handleBack} />
                </form>
              </Form>
            )}

            {activeStep === 4 && (
              <Form {...step5Form}>
                <form
                  onSubmit={step5Form.handleSubmit(handleStep5Submit)}
                  className="space-y-6"
                >
                  <h2 className="text-xl sm:text-2xl font-semibold">
                    Lead Tracking
                  </h2>

                  <FormField
                    control={step5Form.control}
                    name="current_tracking"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>How do you currently track leads?</FormLabel>
                        <div className="space-y-2">
                          {current_tracking_options.map((option) => {
                            const value = option
                              .toLowerCase()
                              .replace(/\s+/g, "_");
                            return (
                              <CheckboxContainer
                                key={value}
                                checked={field.value?.includes(value)}
                                onClick={() => {
                                  const updatedValue = field.value?.includes(
                                    value
                                  )
                                    ? field.value.filter((val) => val !== value)
                                    : [...(field.value || []), value];
                                  field.onChange(updatedValue);
                                }}
                              >
                                <div
                                  className={`w-5 h-5 flex items-center justify-center rounded border ${
                                    field.value?.includes(value)
                                      ? "bg-primary border-primary"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {field.value?.includes(value) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span>{option}</span>
                              </CheckboxContainer>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <StepButtons isLoading={isLoading} onBack={handleBack} />
                </form>
              </Form>
            )}

            {activeStep === 5 && (
              <div className="space-y-6 text-center py-6">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Setup Complete!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You&apos;re all set. We&apos;ll notify you when platform
                  integrations are ready.
                </p>
                <div className="pt-4">
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="w-full sm:w-auto h-10 sm:h-12"
                  >
                    {isLoading ? "Processing..." : "Get Started"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
