"use client";

import { createContext, useContext, useTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { setActiveSpace } from "@/app/actions/space-actions";

export interface SpaceSummary {
  id: string;
  name: string;
  type: "solo" | "pair";
}

interface SpaceContextValue {
  spaces: SpaceSummary[];
  activeSpaceId: string | null;
  setActiveSpaceId: (spaceId: string) => void;
  isUpdating: boolean;
}

const SpaceContext = createContext<SpaceContextValue | undefined>(undefined);

interface SpaceProviderProps {
  children: React.ReactNode;
  spaces: SpaceSummary[];
  initialSpaceId: string | null;
}

export const SpaceProvider: React.FC<SpaceProviderProps> = ({
  children,
  spaces,
  initialSpaceId,
}) => {
  const router = useRouter();
  const [activeSpaceId, setActiveSpaceState] = useState<string | null>(initialSpaceId);
  const [isPending, startTransition] = useTransition();

  const handleSetActiveSpace = (spaceId: string) => {
    if (spaceId === activeSpaceId) {
      return;
    }

    setActiveSpaceState(spaceId);
    startTransition(async () => {
      try {
        await setActiveSpace(spaceId);
        router.refresh();
      } catch (error) {
        console.error("Failed to persist active space", error);
      }
    });
  };

  return (
    <SpaceContext.Provider
      value={{
        spaces,
        activeSpaceId,
        setActiveSpaceId: handleSetActiveSpace,
        isUpdating: isPending,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpaceContext = () => {
  const context = useContext(SpaceContext);

  if (!context) {
    throw new Error("useSpaceContext must be used within a SpaceProvider");
  }

  return context;
};
