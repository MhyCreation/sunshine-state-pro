import type { Metadata } from "next";
import { TutorialWalkthrough } from "@/components/anchor/tutorial-walkthrough";

export const metadata: Metadata = {
  title: "Anchor — Interactive App Tour",
  description:
    "Take a 3-minute tour of Anchor, the shame-free recovery companion app for impulse control and habit recovery.",
};

export default function TutorialPage() {
  return <TutorialWalkthrough />;
}
