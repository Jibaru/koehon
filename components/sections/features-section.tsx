import { FeatureCard } from "../ui/feature-card";
import { DocumentVoiceIcon, TranslateIcon, VolumeUpIcon } from "../icons/feature-icons";

export function FeaturesSection() {
  const features = [
    {
      icon: <DocumentVoiceIcon />,
      badge: { text: "Available", variant: "available" as const },
      title: "PDF to Voice",
      description:
        "Convert any PDF document into natural-sounding audio. Listen while commuting, exercising, or multitasking.",
    },
    {
      icon: <TranslateIcon />,
      badge: { text: "Available", variant: "available" as const },
      title: "Multi-Language Translation",
      description: "Translate your documents into multiple languages with AI-powered accuracy and listen in your preferred language.",
    },
    {
      icon: <VolumeUpIcon />,
      badge: { text: "Beta", variant: "beta" as const },
      title: "Premium Voices",
      description:
        "Choose from a variety of natural AI voices with adjustable speed, tone, and accent for the perfect listening experience.",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );
}
