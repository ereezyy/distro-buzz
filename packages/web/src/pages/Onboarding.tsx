import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/onboarding");
  }, [setLocation]);
  return null;
}
