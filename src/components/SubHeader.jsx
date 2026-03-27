import React from "react";

export default function SubHeader({
  title = "Find Trusted Repairmen Near You",
  subtitle = "Browse our network of skilled repair professionals in your area."
}) {
  return (
    <header
      className="w-full text-white py-20 flex flex-col items-center gap-3 bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/subheader.png')"
      }}
    >
      <h1 className="text-3xl md:text-4xl font-bold text-center">
        {title}
      </h1>

      <p className="text-lg text-center max-w-2xl">
        {subtitle}
      </p>
    </header>
  );
}