// components/IconRenderer.jsx
import React from "react";
import { GeneralPhysician } from "../../../public/svgIcon/all-department-svg-icon";
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
  // ...more mappings
};

const IconRenderer = ({ name}) => {
  const IconComponent = iconMap[name?.toLowerCase()];
  return IconComponent ? <IconComponent /> : null;
};

export default IconRenderer;
