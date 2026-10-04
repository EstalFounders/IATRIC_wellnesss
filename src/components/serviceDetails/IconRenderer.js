// components/IconRenderer.jsx
import React from "react";
import {
  GeneralPhysician,
  PhysiotherapyIcon,
  NursingCareIcon,
  MedicineDelivery,
  LabInvestigation,
  HomeCareIcon,
} from "../../../public/svgIcon/all-department-svg-icon";
import {
  AudioIcon,
  VideoIcon,
  ClinicIcon,
  HomeVisitIcon,
  GDAIcon,
  LabTestIcon,
  EquipmentIcon,
  HealthCampIcon,
  TrainingIcon,
} from "../../../public/svgIcon/all-sub-services-icon";
// ... more imports

const iconMap = {
  audio: AudioIcon,
  video: VideoIcon,
  "in clinic": ClinicIcon,
  "home visit": HomeVisitIcon,
  "clinic visit": ClinicIcon,
  "gda services": GDAIcon,
  "home sample": LabTestIcon,
  "lab test": LabTestIcon,
  "medicine at home": EquipmentIcon,
  "home care": EquipmentIcon,
  equipment: EquipmentIcon,
  "medical room": ClinicIcon,
  "equipment calibrator": EquipmentIcon,
  "bulk medicine": EquipmentIcon,
  "health camp": HealthCampIcon,
  "task show": HealthCampIcon,
  session: TrainingIcon,
  training: TrainingIcon,
  audits: TrainingIcon,
  // Corporate-healthcare services
  emergency: ClinicIcon,
  physiotherapy: PhysiotherapyIcon,
  doctor: GeneralPhysician,
  "health package": EquipmentIcon,
  // Home-care services (one icon per card of the Home Care branch)
  "doctor home visit": HomeVisitIcon,
  "nursing care": NursingCareIcon,
  "medicine delivery": MedicineDelivery,
  "lab sample collection": LabInvestigation,
  "support at home": HomeCareIcon,
  // Nursing-care procedures (drawn with the closest existing icon set)
  "iv drip": LabTestIcon,
  injection: LabTestIcon,
  vaccination: LabTestIcon,
  "post operation": ClinicIcon,
  "wound care": ClinicIcon,
  "elderly care": GDAIcon,
  "patient care": GDAIcon,
  // ...more mappings
};

const IconRenderer = ({ name}) => {
  const IconComponent = iconMap[name?.toLowerCase()];
  return IconComponent ? <IconComponent /> : null;
};

export default IconRenderer;
