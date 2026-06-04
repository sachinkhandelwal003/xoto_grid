import MortgageCalculator from "./MortgageCalculator";

export default function MortgageAffordabilityCalculatorPage() {
  return (
    <MortgageCalculator
      initialTab="mortgage"
      singleCalculator
      backgroundVariant="affordability"
      heading="Mortgage Affordability Calculator"
      subtitle="Estimate monthly installments from property value, downpayment, rate type, and loan duration."
    />
  );
}
