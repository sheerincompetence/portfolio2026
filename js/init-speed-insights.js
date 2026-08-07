// Initialize Vercel Speed Insights
import { injectSpeedInsights } from './speed-insights.js';

// Inject Speed Insights when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectSpeedInsights();
  });
} else {
  injectSpeedInsights();
}
