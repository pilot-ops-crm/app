"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/stores/onboarding";
import { Check, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, useEffect, useRef } from "react";
import useUser from "@/hooks/use-user";
import {
  updateStep1,
  updateStep2,
  updateStep3,
  updateStep4,
  updateStep5,
  completeOnboarding,
  uploadToneReference,
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
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { active_platforms_options, business_type_options, current_tracking_options, gender_options, leads_per_month_options, pilot_goal_options, use_case_options } from "@/lib/onboarding-data";

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [stepValidationState, setStepValidationState] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    true,
  ]);
  const { user, loading } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    tone_reference_file,
    setToneReferenceFile,

    setOnboardingComplete,
  } = useOnboardingStore();

  useEffect(() => {
    if (!user || !user.id) return;

    const loadUserData = async () => {
      try {
        console.log("Loading user data for ID:", user.id);

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            console.log(
              "No data found for user, will be created on first save"
            );
            return;
          }
          console.error("Error fetching user data:", error);
          return;
        }

        console.log("User data loaded:", data);

        if (data) {
          const userData = data as Record<
            string,
            string | string[] | boolean | null
          >;

          if (userData.name && !name) {
            console.log("Setting name from DB:", userData.name);
            setName(userData.name as string);
          }

          if (userData.gender && !gender) {
            console.log("Setting gender from DB:", userData.gender);
            setGender(userData.gender as string);
          }

          if (userData.use_case && use_case.length === 0) {
            console.log("Setting use_case from DB:", userData.use_case);
            setUseCase(userData.use_case as string[]);
          }

          if (userData.leads_per_month && !leads_per_month) {
            console.log(
              "Setting leads_per_month from DB:",
              userData.leads_per_month
            );
            setLeadsPerMonth(userData.leads_per_month as string);
          }

          if (userData.active_platforms && active_platforms.length === 0) {
            console.log(
              "Setting active_platforms from DB:",
              userData.active_platforms
            );
            setActivePlatforms(userData.active_platforms as string[]);
          }

          if (userData.business_type && !business_type) {
            console.log(
              "Setting business_type from DB:",
              userData.business_type
            );
            setBusinessType(userData.business_type as string);
          }

          if (userData.pilot_goal && pilot_goal.length === 0) {
            console.log("Setting pilot_goal from DB:", userData.pilot_goal);
            setPilotGoal(userData.pilot_goal as string[]);
          }

          if (userData.current_tracking && current_tracking.length === 0) {
            console.log(
              "Setting current_tracking from DB:",
              userData.current_tracking
            );
            setCurrentTracking(userData.current_tracking as string[]);
          }

          if (userData.tone_reference_file && !tone_reference_file) {
            console.log(
              "Setting tone_reference_file from DB:",
              userData.tone_reference_file
            );
            setToneReferenceFile(userData.tone_reference_file as string);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [
    user,
    email,
    name,
    setName,
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
    tone_reference_file,
    setToneReferenceFile,
  ]);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: { [key: string]: string } = {};
      let isValid = true;

      switch (step) {
        case 0:
          if (!name) {
            newErrors.name = "Name is required";
            isValid = false;
          }

          if (!gender) {
            newErrors.gender = "Gender selection is required";
            isValid = false;
          }
          break;

        case 1:
          if (use_case.length === 0) {
            newErrors.use_case = "Please select at least one use case";
            isValid = false;
          }

          if (!leads_per_month) {
            newErrors.leads_per_month =
              "Please select your expected lead volume";
            isValid = false;
          }
          break;

        case 2:
          if (active_platforms.length === 0) {
            newErrors.active_platforms = "Please select at least one platform";
            isValid = false;
          }
          break;

        case 3:
          if (!business_type) {
            newErrors.business_type = "Please select your business type";
            isValid = false;
          }

          if (pilot_goal.length === 0) {
            newErrors.pilot_goal = "Please select at least one goal";
            isValid = false;
          }
          break;

        case 4:
          if (current_tracking.length === 0) {
            newErrors.current_tracking =
              "Please select at least one tracking method";
            isValid = false;
          }
          break;

        case 5:
          isValid = true;
          break;
      }

      setErrors(newErrors);
      return isValid;
    },
    [
      name,
      gender,
      use_case,
      leads_per_month,
      active_platforms,
      business_type,
      pilot_goal,
      current_tracking,
    ]
  );

  const updateValidationState = useCallback(
    (step: number, isValid: boolean) => {
    setStepValidationState((prev) => {
      const newState = [...prev];
      newState[step] = isValid;
      return newState;
    });
    },
    []
  );

  useEffect(() => {
    if (activeStep === 0) {
    const isValid = validateStep(0);
    updateValidationState(0, isValid);
    }
  }, [name, gender, validateStep, updateValidationState, activeStep]);

  useEffect(() => {
    if (activeStep === 1) {
    const isValid = validateStep(1);
    updateValidationState(1, isValid);
    }
  }, [
    use_case,
    leads_per_month,
    validateStep,
    updateValidationState,
    activeStep,
  ]);

  useEffect(() => {
    if (activeStep === 2) {
      const isValid = validateStep(2);
      updateValidationState(2, isValid);
    }
  }, [
    active_platforms,
    validateStep,
    updateValidationState,
    activeStep,
  ]);

  useEffect(() => {
    if (activeStep === 3) {
      const isValid = validateStep(3);
      updateValidationState(3, isValid);
    }
  }, [
    business_type,
    pilot_goal,
    validateStep,
    updateValidationState,
    activeStep,
  ]);

  useEffect(() => {
    if (activeStep === 4) {
      const isValid = validateStep(4);
      updateValidationState(4, isValid);
    }
  }, [
    current_tracking,
    validateStep,
    updateValidationState,
    activeStep,
  ]);

  const handleNext = async () => {
    if (!user?.id) {
      return;
    }

    const isValid = validateStep(activeStep);
    updateValidationState(activeStep, isValid);

    if (isValid && activeStep < steps.length - 1) {
      setIsLoading(true);

      try {
        let result;
        switch (activeStep) {
          case 0:
            result = await updateStep1(user.id.toString(), {
              name,
              gender,
            });
            break;
          case 1:
            result = await updateStep2(user.id.toString(), {
              use_case,
              leads_per_month,
            });
            break;
          case 2:
            result = await updateStep3(user.id.toString(), {
              active_platforms,
            });
            break;
          case 3:
            result = await updateStep4(user.id.toString(), {
              business_type,
              pilot_goal,
            });
            break;
          case 4:
            result = await updateStep5(user.id.toString(), {
              current_tracking,
              tone_reference_file,
            });
            break;
        }

        if (!result?.success) {
          throw new Error(result?.error || "Unknown error occurred");
        }

        setActiveStep(activeStep + 1);
      } catch (error) {
        console.error("Error in handleNext:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await completeOnboarding(user.id.toString());

      if (!result.success) {
        throw new Error(result.error || "Failed to complete onboarding");
      }

      setOnboardingComplete(true);
      router.push("/");
    } catch (error) {
      console.error("Error in handleComplete:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsLoading(true);
    try {
      const result = await uploadToneReference(user.id.toString(), file);

      if (!result.success) {
        throw new Error(result.error || "Failed to upload file");
      }

      if (result.filePath) {
        setToneReferenceFile(result.filePath);
      }
    } catch (error) {
      console.error("Error in handleFileUpload:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheckbox = (
    array: string[],
    value: string,
    setter: (value: string[]) => void
  ) => {
    if (array.includes(value)) {
      setter(array.filter((item) => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const selectRadio = (value: string, setter: (value: string) => void) => {
    setter(value);
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
                      const isValid = validateStep(activeStep);
                      updateValidationState(activeStep, isValid);
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
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-input" className="text-sm font-medium">
                      Your name
                    </Label>
                    <Input
                      id="name-input"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`h-12 text-base ${
                        errors.name ? "border-red-500" : ""
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">{errors.name}</p>
                    )}
                  </div>

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
                      className={`h-12 text-base ${
                        errors.email ? "border-red-500" : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Your gender</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {gender_options.map(
                        (option) => (
                          <div
                            key={option.toLowerCase()}
                            onClick={() =>
                              selectRadio(option.toLowerCase(), setGender)
                            }
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              gender === option.toLowerCase()
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full border ${
                                  gender === option.toLowerCase()
                                    ? "border-4 border-primary"
                                    : "border border-muted-foreground"
                                }`}
                              ></div>
                              <span>{option}</span>
                          </div>
                          </div>
                        )
                      )}
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-sm">{errors.gender}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Pilot Usage
                </h2>

                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    What will you use Pilot for?
                  </p>
                  <div className="space-y-2">
                    {use_case_options.map((option) => (
                      <div
                        key={option.toLowerCase().replace(/\s+/g, "_")}
                        onClick={() =>
                          toggleCheckbox(
                            use_case,
                            option.toLowerCase().replace(/\s+/g, "_"),
                            setUseCase
                          )
                        }
                        className={`border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition-all ${
                          use_case.includes(
                            option.toLowerCase().replace(/\s+/g, "_")
                          )
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 flex items-center justify-center rounded border ${
                            use_case.includes(
                              option.toLowerCase().replace(/\s+/g, "_")
                            )
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {use_case.includes(
                            option.toLowerCase().replace(/\s+/g, "_")
                          ) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                  {errors.use_case && (
                    <p className="text-red-500 text-sm">{errors.use_case}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    How many leads do you expect per month?
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {leads_per_month_options.map((option) => (
                      <div
                        key={option}
                        onClick={() => selectRadio(option, setLeadsPerMonth)}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          leads_per_month === option
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border ${
                              leads_per_month === option
                                ? "border-4 border-primary"
                                : "border border-muted-foreground"
                            }`}
                          ></div>
                          <span>{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.leads_per_month && (
                    <p className="text-red-500 text-sm">
                      {errors.leads_per_month}
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Platforms Active On
                </h2>

                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    Which platforms are you active on?
                  </p>
                  <div className="space-y-2">
                    {active_platforms_options.map((option) => (
                      <div
                        key={option
                          .toLowerCase()
                          .replace(/\s+/g, "_")
                          .replace(/\//, "_")}
                        onClick={() =>
                          toggleCheckbox(
                            active_platforms,
                            option
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/\//, "_"),
                            setActivePlatforms
                          )
                        }
                        className={`border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition-all ${
                          active_platforms.includes(
                            option
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/\//, "_")
                          )
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 flex items-center justify-center rounded border ${
                            active_platforms.includes(
                              option
                                .toLowerCase()
                                .replace(/\s+/g, "_")
                                .replace(/\//, "_")
                            )
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {active_platforms.includes(
                            option
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/\//, "_")
                          ) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                  {errors.active_platforms && (
                    <p className="text-red-500 text-sm">
                      {errors.active_platforms}
                    </p>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  This helps us pre-optimize your inbox filters and automations.
                </p>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Business Type & Goals
                </h2>

                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    What type of business do you run?
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {business_type_options.map((option) => (
                      <div
                        key={option
                          .toLowerCase()
                          .replace(/\s+/g, "_")
                          .replace(/\//, "_")}
                        onClick={() =>
                          selectRadio(
                            option
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/\//, "_"),
                            setBusinessType
                          )
                        }
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          business_type ===
                          option
                            .toLowerCase()
                            .replace(/\s+/g, "_")
                            .replace(/\//, "_")
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border ${
                              business_type ===
                              option
                                .toLowerCase()
                                .replace(/\s+/g, "_")
                                .replace(/\//, "_")
                                ? "border-4 border-primary"
                                : "border border-muted-foreground"
                            }`}
                          ></div>
                          <span>{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.business_type && (
                    <p className="text-red-500 text-sm">
                      {errors.business_type}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    What are your goals with Pilot?
                  </p>
                  <div className="space-y-2">
                    {pilot_goal_options.map((option) => (
                      <div
                        key={option
                          .toLowerCase()
                          .replace(/\s+/g, "_")
                          .replace(/&/, "and")}
                        onClick={() =>
                          toggleCheckbox(
                            pilot_goal,
                            option
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/&/, "and"),
                            setPilotGoal
                          )
                        }
                        className={`border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition-all ${
                          pilot_goal.includes(
                            option
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/&/, "and")
                          )
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 flex items-center justify-center rounded border ${
                            pilot_goal.includes(
                              option
                                .toLowerCase()
                                .replace(/\s+/g, "_")
                                .replace(/&/, "and")
                            )
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {pilot_goal.includes(
                            option
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/&/, "and")
                          ) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                  {errors.pilot_goal && (
                    <p className="text-red-500 text-sm">{errors.pilot_goal}</p>
                  )}
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Lead Tracking & Brand Tone
                </h2>

                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    How do you currently track leads?
                  </p>
                  <div className="space-y-2">
                    {current_tracking_options.map((option) => (
                      <div
                        key={option.toLowerCase().replace(/\s+/g, "_")}
                        onClick={() =>
                          toggleCheckbox(
                            current_tracking,
                            option.toLowerCase().replace(/\s+/g, "_"),
                            setCurrentTracking
                          )
                        }
                        className={`border rounded-lg p-3 cursor-pointer flex items-center gap-3 transition-all ${
                          current_tracking.includes(
                            option.toLowerCase().replace(/\s+/g, "_")
                          )
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 flex items-center justify-center rounded border ${
                            current_tracking.includes(
                              option.toLowerCase().replace(/\s+/g, "_")
                            )
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {current_tracking.includes(
                            option.toLowerCase().replace(/\s+/g, "_")
                          ) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                  {errors.current_tracking && (
                    <p className="text-red-500 text-sm">
                      {errors.current_tracking}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    Upload a reference for your brand&apos;s tone (optional)
                  </p>
                  <div
                    className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {tone_reference_file
                        ? "File uploaded successfully"
                        : "Drop a file here or click to browse"}
                    </p>
                    {tone_reference_file && (
                      <p className="text-xs text-primary mt-2">
                        {tone_reference_file.split("/").pop()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={activeStep === 0 || isLoading}
            className="w-full sm:w-1/2 h-10 sm:h-12"
          >
              Previous
            </Button>

            {activeStep < steps.length - 1 ? (
            <Button
              type="button"
              variant="default"
              onClick={handleNext}
              className="w-full sm:w-1/2 h-10 sm:h-12"
              disabled={!stepValidationState[activeStep] || isLoading}
            >
              {isLoading ? "Saving..." : "Next"}
              </Button>
            ) : (
            <Button
              type="button"
              onClick={handleComplete}
              className="w-full sm:w-1/2 h-10 sm:h-12"
              disabled={isLoading}
            >
              {isLoading ? "Completing..." : "Enter App"}
              </Button>
            )}
        </CardFooter>
      </Card>
    </section>
  );
}