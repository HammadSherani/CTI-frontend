import FilterSidebar from './FilterSidebar';
import TechnicianCard from './TechnicianCard';

// Sample data for the technicians
const technicians = [
  {
    name: 'John Powell',
    rating: '3.0',
    reviews: 1,
    description: 'It is a long established fact that a reader will be distracted by the readable content of a page.',
    location: 'Los Angles USA',
    experience: '3+ Experience',
    imageUrl: '/assets/logo/tech-pro.png',
    isFeatured: true,
    isMostPopular: true,
  },
  {
    name: 'Jane Doe',
    rating: '4.5',
    reviews: 12,
    description: 'Specializing in advanced diagnostics and motherboard repairs for all major brands.',
    location: 'New York USA',
    experience: '8+ Experience',
    imageUrl: '/assets/logo/tech-pro.png',
    isFeatured: true,
    isMostPopular: false,
  },
    {
    name: 'Alex Ray',
    rating: '4.8',
    reviews: 34,
    description: 'Certified Apple technician with a focus on screen and battery replacements.',
    location: 'Chicago USA',
    experience: '5+ Experience',
    imageUrl: '/assets/logo/tech-pro.png',
    isFeatured: false,
    isMostPopular: true,
  },
    {
    name: 'Emily Carter',
    rating: '4.2',
    reviews: 8,
    description: 'Expert in laptop repairs, including hardware upgrades and software troubleshooting.',
    location: 'San Francisco USA',
    experience: '6+ Experience',
    imageUrl: '/assets/logo/tech-pro.png',
    isFeatured: false,
    isMostPopular: false,
  },
];

const TechnicianGrid = () => {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <FilterSidebar />
          
          {/* Main Content Grid */}
          <main className="flex-1">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {technicians.map((tech, index) => (
                <TechnicianCard key={index} technician={tech} />
              ))}
            </div>
            
            {/* You can add pagination here in the future */}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TechnicianGrid;