import SmallLoader from "@/components/SmallLoader";
import { Suspense } from "react";
import AcademyContent from "./AcademyContent";

const TrendyolAcademy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Suspense fallback={<SmallLoader loading={true} text="Initializing Academy..." />}>
        <AcademyContent />
      </Suspense>
    </div>
  );
};

export default TrendyolAcademy;