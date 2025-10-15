import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

interface StepProps {
  step: string;
  index: number;
  currentStep: number;
  isLast: boolean;
}

const Step: React.FC<StepProps> = ({ step, index, currentStep, isLast }) => {
  const stepNumber = index + 1;
  const isActive = stepNumber === currentStep;
  const isCompleted = stepNumber < currentStep;
  const isPending = stepNumber > currentStep;

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {/* Step Circle */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-200",
            {
              "bg-blue-600 text-white border-2 border-blue-600": isActive,
              "bg-green-500 text-white border-2 border-green-500": isCompleted,
              "bg-gray-200 text-gray-500 border-2 border-gray-200": isPending,
            }
          )}
        >
          {isCompleted ? (
            <CheckIcon className="w-5 h-5" />
          ) : (
            <span>{stepNumber}</span>
          )}
        </div>

        {/* Step Label */}
        <div className="ml-3">
          <p
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              {
                "text-blue-600": isActive,
                "text-green-600": isCompleted,
                "text-gray-500": isPending,
              }
            )}
          >
            {step}
          </p>
        </div>
      </div>

      {/* Connector Line */}
      {!isLast && (
        <div className="flex-1 mx-4 h-px">
          <div
            className={cn("h-full transition-colors duration-200", {
              "bg-green-500": isCompleted,
              "bg-gray-200": !isCompleted,
            })}
          />
        </div>
      )}
    </div>
  );
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <Step
            key={step}
            step={step}
            index={index}
            currentStep={currentStep}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

// Mobile-friendly vertical stepper
export const VerticalStepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col space-y-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isPending = stepNumber > currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step} className="flex items-start">
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-200",
                    {
                      "bg-blue-600 text-white border-2 border-blue-600":
                        isActive,
                      "bg-green-500 text-white border-2 border-green-500":
                        isCompleted,
                      "bg-gray-200 text-gray-500 border-2 border-gray-200":
                        isPending,
                    }
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Vertical Connector */}
                {!isLast && (
                  <div className="w-px h-16 mt-2">
                    <div
                      className={cn(
                        "w-full h-full transition-colors duration-200",
                        {
                          "bg-green-500": isCompleted,
                          "bg-gray-200": !isCompleted,
                        }
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Step Label */}
              <div className="ml-4 mt-2">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    {
                      "text-blue-600": isActive,
                      "text-green-600": isCompleted,
                      "text-gray-500": isPending,
                    }
                  )}
                >
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
