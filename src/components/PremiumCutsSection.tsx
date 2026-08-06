import IndividualCutsSection from './IndividualCutsSection';

interface PremiumCutsSectionProps {
  onNavigateToContact?: () => void;
}

export default function PremiumCutsSection({ onNavigateToContact }: PremiumCutsSectionProps) {
  return (
    <IndividualCutsSection
      onNavigateToContact={onNavigateToContact}
      title="Individual Premium Beef Cuts & Portfolio"
      subtitle="Explore our master butcher selection of dry-aged steaks, roasts, brisket, ground beef, and specialty cuts available in individual vacuum-sealed portions."
    />
  );
}
