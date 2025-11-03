import Link from "next/link";

// Component to represent each doctor
export const DoctorComponent = ({ doctor }) => (
  <div key={doctor.id} className="col-md-6 col-lg-4">
    <div className="doctor-2">
      {/* Doctor Photo */}
      <div className="hover-overlay">
        <img
          className="img-fluid"
          src={doctor.profilePictureUrl}
          alt="doctor-foto"
        />
      </div>
      {/* Doctor Meta */}
      <div className="doctor-meta">
        <h5 className="h5-xs blue-color">{doctor.name}</h5>
        <span>{doctor.specialization}</span>
        <span>{doctor.experience}</span>
        <span>{doctor.gender}</span>
        {/* Button */}
        <Link legacyBehavior href="/">
          <a className="btn btn-sm btn-blue blue-hover mt-15">
            View Profile
          </a>
        </Link>
      </div>
    </div>
  </div>
);
