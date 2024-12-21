const withProgressTracking = (WrappedComponent) => {
    return function ProgressTrackingComponent({ onAnswer, ...props }) {
      const handleAnswer = async (isCorrect) => {
        try {
          // Call the original onAnswer
          await onAnswer(isCorrect);
          
          // Save progress quietly
          if (props.saveQuietProgress) {
            await props.saveQuietProgress();
          }
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      };
  
      return <WrappedComponent {...props} onAnswer={handleAnswer} />;
    };
  };
  
  export default withProgressTracking;