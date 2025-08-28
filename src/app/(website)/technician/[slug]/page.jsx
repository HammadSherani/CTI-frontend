// app/(website)/technician/[slug]/page.js
import LocationMap from "@/components/website/technician/LocationMap";
import ReviewsSection from "@/components/website/technician/ReviewsSection";
import TechnicianAbout from "@/components/website/technician/TechnicianAbout";
import TechnicianHero from "@/components/website/technician/TechnicianHero";
import { notFound } from 'next/navigation';
const technicians = [
  {
    name: 'John Powell',
    slug: 'john-powell',
    rating: '3.0',
    reviews: 1,
    description: 'It is a long established fact that a reader will be distracted by the readable content of a page.',
    location: 'Los Angles USA',
    experience: '3+ Experience',
    imageUrl: '/assets/logo/tech-pro.png',
    coverImageUrl: '/assets/logo/tech-bg.jpg', 
    isFeatured: true,
    isMostPopular: true,
  },
  {
    name: 'Jane Doe',
    slug: 'jane-doe',
    rating: '4.5',
    reviews: 12,
    description: 'Specializing in advanced diagnostics and motherboard repairs for all major brands.',
    location: 'New York USA',
    experience: '8+ Experience',
    imageUrl: '/assets/logo/tech-pro.png',
    coverImageUrl: '/assets/logo/tech-bg.jpg',
    isFeatured: true,
    isMostPopular: false,
  },
   // Add all other technician objects here...
];

// This function simulates fetching data for one technician
const getTechnicianBySlug = (slug) => {
  const technician = technicians.find(tech => tech.slug === slug);
  return technician;
}

const TechnicianDetailPage = ({ params }) => {
  const { slug } = params;
  const technician = getTechnicianBySlug(slug);

  // If no technician is found for the slug, show a 404 page
  if (!technician) {
    notFound();
  }

  return (
    <div>
      <TechnicianHero technician={technician} />      
      <TechnicianAbout technician={technician} />
      <LocationMap />
      <ReviewsSection />
    </div>
  );
};

export default TechnicianDetailPage;