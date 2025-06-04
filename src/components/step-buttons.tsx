import { Button } from "./ui/button";

type StepButtonsProps = {
  showBack?: boolean;
  isLastStep?: boolean;
  isLoading: boolean;
  onBack?: () => void;
  isSubmitting?: boolean;
};

const StepButtons: React.FC<StepButtonsProps> = ({
  showBack = true,
  isLastStep = false,
  isLoading,
  onBack,
  isSubmitting = false,
}) => (
  <div className="flex justify-between gap-4 pt-4 w-full">
    {showBack && (
      <Button
        variant="outline"
        type="button"
        onClick={onBack}
        disabled={isLoading || isSubmitting}
        className="w-1/2"
      >
        Back
      </Button>
    )}
    <Button
      type="submit"
      disabled={isLoading || isSubmitting}
      className={`w-1/2 ${showBack ? "w-1/2" : "w-full"}`}
    >
      {isLastStep
        ? isLoading
          ? "Completing..."
          : "Enter App"
        : isLoading
        ? "Saving..."
        : "Next"}
    </Button>
  </div>
);

export default StepButtons;