import { createContext, Dispatch, SetStateAction } from 'react';
import { ModelProviders } from '@/lib/constants'; // Import providers

interface ModelProviderContextType {
  modelProvider: string;
  // setModelProvider is only needed if children components should change the provider,
  // which they currently don't. Snippet handles the change.
  // Keeping it allows for future flexibility.
  setModelProvider: Dispatch<SetStateAction<string>>;
}

// Default value should match the initial state in Snippet.tsx if possible
const defaultProvider = ModelProviders[0] || "Gemini";

export const ModelProviderContext = createContext<ModelProviderContextType>({
  modelProvider: defaultProvider,
  // Provide a dummy setter function for the default context value
  // This setter will never actually be called if the Provider wraps the components
  setModelProvider: () => {},
});

// Exporting the context for use in components that consume it (like Editor.tsx)
// No need to export a Provider component, as we'll use ModelProviderContext.Provider directly.