// Mobile Haptic / Vibration Feedback Utility

class HapticsEngine {
  public enabled: boolean = true;

  private vibrate(pattern: number | number[]) {
    if (!this.enabled) return;
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
  }

  // Light tactile tap when selecting an option
  triggerTap() {
    this.vibrate(15);
  }

  // Rewarding double pulse on correct answer
  triggerCorrect() {
    this.vibrate([25, 40, 35]);
  }

  // Staccato dual pulse on wrong answer
  triggerWrong() {
    this.vibrate([45, 35, 45]);
  }

  // Subtle flick when navigating to next or previous question
  triggerPageTurn() {
    this.vibrate(12);
  }

  // OMR mark feedback
  triggerOMR() {
    this.vibrate(18);
  }

  // Final exam submission stamp vibration
  triggerFinish() {
    this.vibrate([30, 40, 30, 40, 60]);
  }
}

export const haptics = new HapticsEngine();
