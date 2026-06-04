import MortgageCalculator from "./MortgageCalculator";

export default function MortgageEligibilityCalculatorPage() {
  return (
    <MortgageCalculator
      initialTab="affordability"
      singleCalculator
      backgroundVariant="eligibility"
      heading="Mortgage Eligibility Calculator"
      subtitle="Check customer buying power with income, debts, residency, employment, and loan tenure."
    />
  );
}
