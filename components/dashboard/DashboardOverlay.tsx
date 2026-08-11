import { CategoryList } from "./CategoryList";
import { ConditionsCard } from "./ConditionsCard";
import { TopPickCard } from "./TopPickCard";
import { TrendingCard } from "./TrendingCard";
import { TwoRingsCard } from "./TwoRingsCard";

export function DashboardOverlay() {
  return (
    <section
      id="dashboard"
      aria-label="Live travel discovery dashboard"
      className="relative z-30 mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pb-8 sm:px-6 lg:pointer-events-none lg:absolute lg:inset-0 lg:block lg:max-w-none lg:p-0"
    >
      <TrendingCard
        index={0}
        className="lg:absolute lg:left-6 lg:top-28 lg:w-72 xl:left-8"
      />
      <CategoryList
        index={1}
        className="lg:absolute lg:left-6 lg:top-80 lg:w-72 xl:left-8"
      />
      <TopPickCard
        index={2}
        className="lg:absolute lg:right-6 lg:top-28 lg:w-[19rem] xl:right-8"
      />
      <ConditionsCard
        index={3}
        className="lg:absolute lg:right-6 lg:top-80 lg:w-80 xl:right-8"
      />
      <TwoRingsCard
        index={4}
        className="lg:absolute lg:bottom-6 lg:right-6 lg:w-80 xl:bottom-8 xl:right-8"
      />
    </section>
  );
}
