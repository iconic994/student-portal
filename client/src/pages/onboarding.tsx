import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import OnboardingStepRenderer from "@/components/onboarding/step-renderer";

interface OnboardingStep {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  componentType: string;
  options: Array<{label: string, value: string, icon?: string}>;
  isRequired: boolean;
}

interface OnboardingData {
  currentStep: number;
  isCompleted: boolean;
  interests: string[];
  learningStyle: string;
  experienceLevel: string;
  goals: string[];
  timeCommitment: string;
  preferredCommunities: number[];
}

export default function OnboardingWizard() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    currentStep: 1,
    interests: [],
    goals: [],
    preferredCommunities: []
  });

  // Fetch onboarding steps
  const { data: steps = [], isLoading: stepsLoading } = useQuery<OnboardingStep[]>({
    queryKey: ['/api/onboarding/steps'],
  });

  // Fetch user's onboarding progress
  const { data: userOnboarding, isLoading: onboardingLoading } = useQuery({
    queryKey: ['/api/user/onboarding'],
  });

  // Update onboarding mutation
  const updateOnboardingMutation = useMutation({
    mutationFn: async (data: Partial<OnboardingData>) => {
      const method = userOnboarding ? 'PUT' : 'POST';
      const response = await fetch('/api/user/onboarding', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update onboarding');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/onboarding'] });
    }
  });

  // Initialize with existing data
  useEffect(() => {
    if (userOnboarding) {
      setOnboardingData({
        currentStep: userOnboarding.currentStep || 1,
        isCompleted: userOnboarding.isCompleted || false,
        interests: userOnboarding.interests || [],
        learningStyle: userOnboarding.learningStyle || '',
        experienceLevel: userOnboarding.experienceLevel || '',
        goals: userOnboarding.goals || [],
        timeCommitment: userOnboarding.timeCommitment || '',
        preferredCommunities: userOnboarding.preferredCommunities || []
      });

      // If already completed, redirect to dashboard
      if (userOnboarding.isCompleted) {
        setLocation('/');
        return;
      }
    }
  }, [userOnboarding, setLocation]);

  const currentStep = steps.find(s => s.stepNumber === onboardingData.currentStep);
  const totalSteps = steps.length;
  const progressPercentage = ((onboardingData.currentStep || 1) / totalSteps) * 100;

  const handleStepData = (stepType: string, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [stepType]: data
    }));
  };

  const handleNext = async () => {
    const nextStepNumber = (onboardingData.currentStep || 1) + 1;
    const isLastStep = nextStepNumber > totalSteps;
    
    const updatedData = {
      ...onboardingData,
      currentStep: isLastStep ? totalSteps : nextStepNumber,
      isCompleted: isLastStep,
      completedAt: isLastStep ? new Date().toISOString() : undefined
    };

    try {
      await updateOnboardingMutation.mutateAsync(updatedData);
      
      if (isLastStep) {
        // Award points for completing onboarding
        await fetch('/api/award-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            points: 50,
            action: 'onboarding_completed',
            description: 'Completed personalized onboarding',
            sourceType: 'onboarding',
            sourceId: 1
          })
        });

        toast({
          title: "Welcome to Skillbanto!",
          description: "Your learning journey starts now. You've earned 50 points!"
        });
        
        setLocation('/');
      } else {
        setOnboardingData(updatedData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    if ((onboardingData.currentStep || 1) > 1) {
      const prevStepNumber = (onboardingData.currentStep || 1) - 1;
      setOnboardingData(prev => ({
        ...prev,
        currentStep: prevStepNumber
      }));
    }
  };

  const handleSkip = () => {
    toast({
      title: "Onboarding Skipped",
      description: "You can always complete this later in your profile settings."
    });
    setLocation('/');
  };

  if (stepsLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your personalized setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to Skillbanto
              </h1>
              <Button variant="ghost" onClick={handleSkip} className="text-gray-500">
                Skip for now
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Step {onboardingData.currentStep} of {totalSteps}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          {/* Current Step */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                {currentStep?.title}
              </CardTitle>
              {currentStep?.description && (
                <CardDescription className="text-lg">
                  {currentStep.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              {currentStep && (
                <OnboardingStepRenderer
                  step={currentStep}
                  currentData={onboardingData}
                  onDataChange={handleStepData}
                />
              )}
              
              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={(onboardingData.currentStep || 1) === 1}
                >
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={updateOnboardingMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateOnboardingMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (onboardingData.currentStep || 1) === totalSteps ? (
                    "Complete Setup"
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Welcome Message */}
          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <p>We're personalizing your learning experience based on your preferences.</p>
            <p>This will only take a few minutes and help us recommend the best communities for you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}