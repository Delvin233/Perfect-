"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface FarcasterContext {
  user: FarcasterUser;
  location?: {
    type: string;
    [key: string]: unknown;
  };
  client: {
    platformType?: string;
    clientFid: number;
    added: boolean;
  };
}

interface FarcasterContextType {
  isInMiniApp: boolean;
  context: FarcasterContext | null;
  isReady: boolean;
  user: FarcasterUser | null;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isInMiniApp: false,
  context: null,
  isReady: false,
  user: null,
});

export const useFarcaster = () => useContext(FarcasterContext);

interface FarcasterProviderProps {
  children: ReactNode;
}

export function FarcasterProvider({ children }: FarcasterProviderProps) {
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        // Check if we're in a Mini App environment
        const inMiniApp = await sdk.isInMiniApp();
        setIsInMiniApp(inMiniApp);

        if (inMiniApp) {
          // Get the context from Farcaster
          const farcasterContext = (await sdk.context) as FarcasterContext;
          setContext(farcasterContext);
          setUser(farcasterContext.user);

          // Signal that the app is ready
          await sdk.actions.ready();
          setIsReady(true);

          console.log("Farcaster Mini App initialized:", farcasterContext);
        } else {
          // Not in Mini App, just mark as ready
          setIsReady(true);
          console.log("Running outside of Farcaster Mini App");
        }
      } catch (error) {
        console.error("Failed to initialize Farcaster SDK:", error);
        setIsReady(true); // Still mark as ready to not block the app
      }
    };

    initializeFarcaster();
  }, []);

  const value = {
    isInMiniApp,
    context,
    isReady,
    user,
  };

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
}
