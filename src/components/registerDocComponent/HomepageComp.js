import { doctor_info_local_storage } from "../../constant";

export default function HomepageComp() {
    const doctorInfo = JSON.parse(localStorage.getItem(doctor_info_local_storage));
    console.log(doctorInfo, 'doctor info');
    
    if (!doctorInfo) {
      return null; // Prevent rendering if doctorInfo is null
    }
  
    return (
      <div>
        Hello {doctorInfo.user.name}
      </div>
    );
  }
  