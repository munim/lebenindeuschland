# Business Feature: User Settings and Preferences

## Purpose
This document describes the business feature that allows users to customize their application experience through various settings and preferences. This enhances user satisfaction and caters to individual needs.

## Key Components and Logic
- `src/components/SettingsBar.tsx`: Provides a unified, responsive settings interface that works across all devices.
- `src/components/LanguageSelector.tsx`: Allows users to select their preferred language.
- `src/components/ThemeToggle.tsx`: Enables users to switch between different visual themes (e.g., light/dark mode).
- `src/components/TestModeToggle.tsx`: Allows users to activate or deactivate a "test mode" for specific functionalities.
- `src/components/RandomizationToggle.tsx`: Allows users to enable randomization of question order.
- `src/contexts/LanguageContext.tsx`: Manages the application's language state.
- `src/contexts/ThemeContext.tsx`: Manages the application's theme state.
- `src/contexts/TestModeContext.tsx`: Manages the application's test mode state.
- `src/contexts/RandomizationContext.tsx`: Manages the question randomization state.

## User Flow
1.  User accesses settings through the unified SettingsBar component (always visible interface).
2.  Settings are displayed responsively:
    - **Desktop**: All controls visible inline with session stats
    - **Tablet**: Compact layout with key controls and status indicators
    - **Mobile**: Collapsible interface with expandable settings panel
3.  Within the settings interface, the user can:
    *   Change the application language.
    *   Toggle between light and dark themes.
    *   Enable or disable a "test mode" feature.
    *   Toggle randomization of question order.
    *   View session statistics (when in test mode).
    *   Reset current session progress.
4.  Changes are applied immediately and persist across sessions.

## Responsive Design
The unified settings approach provides a consistent experience across all devices:
- **Desktop (≥1024px)**: Full horizontal layout with all controls and inline session stats
- **Tablet (≥768px)**: Compact layout with essential controls and status indicators  
- **Mobile (<768px)**: Collapsible settings with expandable panel and integrated session stats

## LLM Enhancement Opportunities
- **Intelligent Default Settings:** LLMs could analyze user behavior or device settings to suggest optimal default settings for new users.
- **Personalized Recommendations:** Based on user preferences, LLMs could recommend specific content or features.
- **Natural Language Setting Control:** LLMs could enable users to change settings using natural language commands (e.g., "switch to dark mode," "change language to German").
- **A/B Testing of Settings:** LLMs could assist in designing and analyzing A/B tests for different default settings or preference options.