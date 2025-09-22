import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "@/app/(app)/page";

vi.mock("@/app/actions/space-actions", () => ({
  getActiveSpaceIdFromCookie: vi.fn(() => null),
}));

vi.mock("@/lib/queries", () => ({
  getPlacesForSpace: vi.fn(async () => []),
}));

describe("HomePage", () => {
  it("renders welcome card when no space is selected", async () => {
    const Page = await HomePage();
    render(Page);
    expect(screen.getByText(/Travel Memories Map へようこそ/)).toBeInTheDocument();
  });
});
