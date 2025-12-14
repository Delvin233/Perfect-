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

interface CastEmbedLocation {
  type: "cast_embed";
  embed: string;
  cast: {
    hash: string;
    author: FarcasterUser;
    text: string;
    [key: string]: unknown;
  };
}

interface OpenMiniAppLocation {
  type: "open_miniapp";
  referrerDomain: string;
}

interface LauncherLocation {
  type: "launcher";
}

interface NotificationLocation {
  type: "notification";
  notification: {
    notificationId: string;
    title: string;
    body: string;
  };
}

type FarcasterLocation =
  | CastEmbedLocation
  | OpenMiniAppLocation
  | LauncherLocation
  | NotificationLocation
  | {
      type: string;
      [key: string]: unknown;
    };

interface FarcasterContext {
  user: FarcasterUser;
  location?: FarcasterLocation;
  client: {
    platformType?: string;
    clientFid: number;
    added: boolean;
    safeAreaInsets?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
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
