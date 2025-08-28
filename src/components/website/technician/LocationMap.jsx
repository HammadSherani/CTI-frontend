// app/components/website/technician/LocationMap.jsx

const LocationMap = () => {
    return (
        // The container is full-width by default as a direct child of the body or a full-width parent
        <div className="w-full container mx-auto px-4 sm:px-6 lg:px-8 h-[450px]">
            {/* 
                IMPORTANT: Replace the `src` attribute below with the embed code from your Google Maps location.
                1. Go to Google Maps and find the location.
                2. Click "Share", then "Embed a map".
                3. Copy the `src` URL and paste it below.
            */}
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.297444743271!2d-122.4371900846816!3d37.77492957975953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085808a3a3b3e3d%3A0x29c7b9e3a3a3a3a3!2sSan%20Francisco%2C%20CA%2C%20USA!5e0!3m2!1sen!2s!4v1628581682159!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    );
};

export default LocationMap;