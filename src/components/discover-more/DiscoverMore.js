import Image from "next/image";
import React from "react";

const DiscoverMoreComp = () => {
const features = [
    {
        title: "Consult Top Doctors",
        description: "Find and book appointments with the best rated doctors.",
        icon: "/images/discover-more/consultationImg.png",
    },
    {
        title: "Lab Tests at Home",
        description: "Get health advice and help any time of the day.",
        icon: "/images/discover-more/labtestAthome.png",
    },
];

return (
    <div className="container py-5">
        {/* Hero Section */}
        <div className="text-center mb-5">
            <h1 className="display-5 fw-bold">Discover More</h1>
            <p className="lead text-muted">
                Explore more services, features, and possibilities tailored just for
                you.
            </p>
        </div>

        {/* Features Section */}
        <div className="row g-4 justify-content-center">
            {features.map((item, index) => (
                <div key={index} className="col-12 col-md-6 col-lg-3">
                    <div className="card h-100 shadow-sm border-0 text-center p-3">
                        <Image
                            src={item.icon}
                            alt={item.title}
                            width={120}
                            height={120}
                            className="img-fluid mb-3 w-100"
                        />
                        <h5 className="fw-semibold">{item.title}</h5>
                        <p className="text-muted">{item.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
};

export default DiscoverMoreComp;
