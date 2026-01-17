import { Achievement } from '@/hooks/useAchievements';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge = ({ achievement, showProgress = true, size = 'md' }: AchievementBadgeProps) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const formatProgress = () => {
    if (achievement.category === 'time') {
      if (achievement.targetValue >= 60) {
        return `${achievement.currentValue}h / ${achievement.targetValue}h`;
      }
      return `${achievement.currentValue}min / ${achievement.targetValue}min`;
    }
    return `${achievement.currentValue} / ${achievement.targetValue}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`relative rounded-xl text-center transition-all duration-300 ${sizeClasses[size]} ${
              achievement.earned
                ? 'bg-secondary hover:bg-secondary/80 hover:scale-105 cursor-pointer'
                : 'bg-secondary/30 opacity-60'
            }`}
          >
            {/* Badge icon */}
            <div className={`${iconSizes[size]} mb-2 relative`}>
              {achievement.earned ? (
                <span className="drop-shadow-lg">{achievement.icon}</span>
              ) : (
                <div className="relative inline-block">
                  <span className="grayscale opacity-50">{achievement.icon}</span>
                  <Lock className="absolute -bottom-1 -right-1 w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Badge name */}
            <p className={`font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              {achievement.name}
            </p>

            {/* Progress bar for locked achievements */}
            {!achievement.earned && showProgress && size !== 'sm' && (
              <div className="mt-2 space-y-1">
                <Progress 
                  value={achievement.progress} 
                  className="h-1.5"
                />
                <p className="text-[10px] text-muted-foreground">
                  {formatProgress()}
                </p>
              </div>
            )}

            {/* Earned indicator */}
            {achievement.earned && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs">
                ✓
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-center">
            <p className="font-bold">{achievement.name}</p>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
            {!achievement.earned && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-primary font-medium">
                  Progresso: {formatProgress()}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementBadge;
