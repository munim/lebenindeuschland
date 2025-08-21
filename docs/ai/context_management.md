# Context Management

## Purpose
This document describes how global state and application-wide settings are managed using React Context. Context provides a way to pass data through the component tree without having to pass props down manually at every level.

## Key Files and Directories
- `src/contexts/`: This directory contains the context providers and consumers.
    - `LanguageContext.tsx`: Manages the application's language settings.
    - `TestModeContext.tsx`: Manages the application's test mode state.
    - `ThemeContext.tsx`: Manages the application's theme (e.g., light/dark mode).

## Functionality
Each context file defines a React Context, a Provider component, and a custom hook for consuming the context.
- `LanguageContext`: Provides the current language and a function to change it.
- `TestModeContext`: Provides the current test mode status and a function to toggle it.
- `ThemeContext`: Provides the current theme and a function to switch themes.

These contexts are typically used at a higher level in the component tree (e.g., in `src/app/layout.tsx`) to make the values available to all descendant components.

## LLM Enhancement Opportunities
- **New Context Creation:** LLMs can generate new context files for managing additional global states (e.g., user authentication, notifications), including the context, provider, and consumer hook.
- **Context Logic Modification:** LLMs can modify the logic within existing contexts to add new state variables, update state management, or integrate with external APIs.
- **Context Integration:** LLMs can assist in integrating new or existing contexts into the application's layout or specific components.