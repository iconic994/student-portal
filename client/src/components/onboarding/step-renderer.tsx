import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";
import { 
  Code, BarChart3, Smartphone, Brain, Palette, Cloud, Shield, Target, 
  TrendingUp, Camera, Eye, Wrench, BookOpen, MessageCircle, Sprout, 
  Trophy, ArrowUpRight, Plus, Heart, GraduationCap, Briefcase, Folder,
  Coffee, Clock, Zap, Users, CheckCircle, Star
} from "lucide-react";

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
  currentStep?: number;
  interests?: string[];
  learningStyle?: string;
  experienceLevel?: string;
  goals?: string[];
  timeCommitment?: string;
  preferredCommunities?: number[];
}

interface StepRendererProps {
  step: OnboardingStep;
  currentData: OnboardingData;
  onDataChange: (stepType: string, data: any) => void;
}

const iconMap: Record<string, any> = {
  Code, BarChart3, Smartphone, Brain, Palette, Cloud, Shield, Target,
  TrendingUp, Camera, Eye, Wrench, BookOpen, MessageCircle, Sprout,
  Trophy, ArrowUpRight, Plus, Heart, GraduationCap, Briefcase, Folder,
  Coffee, Clock, Zap, Users, CheckCircle, Star, Seedling: Sprout
};

export default function OnboardingStepRenderer({ step, currentData, onDataChange }: StepRendererProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [singleValue, setSingleValue] = useState<string>('');

  // Initialize values from current data
  useEffect(() => {
    switch (step.componentType) {
      case 'interests':
        setSelectedValues(currentData.interests || []);
        break;
      case 'goals':
        setSelectedValues(currentData.goals || []);
        break;
      case 'learning_style':
        setSingleValue(currentData.learningStyle || '');
        break;
      case 'experience_level':
        setSingleValue(currentData.experienceLevel || '');
        break;
      case 'time_commitment':
        setSingleValue(currentData.timeCommitment || '');
        break;
    }
  }, [step.componentType, currentData]);

  const handleMultiSelect = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    setSelectedValues(newValues);
    onDataChange(step.componentType, newValues);
  };

  const handleSingleSelect = (value: string) => {
    setSingleValue(value);
    onDataChange(step.componentType, value);
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName] || Target;
    return <IconComponent className="h-6 w-6" />;
  };

  // Welcome step
  if (step.componentType === 'welcome') {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Star className="h-12 w-12 text-white" />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Let's personalize your learning experience!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            We'll ask you a few questions to recommend the best communities and learning paths for your goals.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Personalized recommendations
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Tailored content
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Community recommendations step
  if (step.componentType === 'community_recommendations') {
    return <CommunityRecommendations currentData={currentData} onDataChange={onDataChange} />;
  }

  // Multi-select steps (interests, goals)
  if (step.componentType === 'interests' || step.componentType === 'goals') {
    return (
      <div className="space-y-4">
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Select all that apply (choose at least one)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {step.options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleMultiSelect(option.value)}
              >
                <CardContent className="p-4 flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {getIcon(option.icon)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        {selectedValues.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedValues.length} selected
            </p>
          </div>
        )}
      </div>
    );
  }

  // Single-select steps (learning_style, experience_level, time_commitment)
  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Choose the option that best describes you
      </p>
      <div className="space-y-3">
        {step.options.map((option) => {
          const isSelected = singleValue === option.value;
          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all hover:scale-105 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSingleSelect(option.value)}
            >
              <CardContent className="p-4 flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isSelected 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {getIcon(option.icon)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CommunityRecommendations({ currentData, onDataChange }: {
  currentData: OnboardingData;
  onDataChange: (stepType: string, data: any) => void;
}) {
  const [selectedCommunities, setSelectedCommunities] = useState<number[]>(
    currentData.preferredCommunities || []
  );

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['/api/user/onboarding/recommendations'],
  });

  const handleCommunityToggle = (communityId: number) => {
    const newSelected = selectedCommunities.includes(communityId)
      ? selectedCommunities.filter(id => id !== communityId)
      : [...selectedCommunities, communityId];
    
    setSelectedCommunities(newSelected);
    onDataChange('preferredCommunities', newSelected);
  };

  const handleJoinCommunity = async (communityId: number) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: 'POST',
      });
      if (response.ok) {
        handleCommunityToggle(communityId);
      }
    } catch (error) {
      console.error('Failed to join community:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Generating personalized recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No recommendations yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Complete the previous steps to get personalized community recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Recommended Communities
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Based on your interests and goals, here are some communities you might enjoy
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec: any) => {
          const community = rec.community;
          const isSelected = selectedCommunities.includes(community.id);
          
          return (
            <Card key={community.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {community.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(rec.score)}% match
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {community.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4 mb-3">
                      <span>{community.memberCount} members</span>
                      <span>• {community.category}</span>
                    </div>
                    
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Why recommended: {rec.reason}
                    </p>
                  </div>
                  
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleJoinCommunity(community.id)}
                    className="ml-4"
                  >
                    {isSelected ? "Joined" : "Join"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {selectedCommunities.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-center text-green-700 dark:text-green-300 font-medium">
            Great! You've joined {selectedCommunities.length} {selectedCommunities.length === 1 ? 'community' : 'communities'}
          </p>
        </div>
      )}
    </div>
  );
}