import { Suspense } from "react";
import AcademyListingContent from "./AcademyListingContent";
import SmallLoader from "@/components/SmallLoader";

const TrendyolAcademyListing = () => {
  return (
    <div className="min-h-screen bg-gray-50/70 pb-16">
      <Suspense fallback={<SmallLoader loading={true} text="Initializing Academy..." />}>
        <AcademyListingContent />
      </Suspense>
    </div>

  );
};

export default TrendyolAcademyListing;