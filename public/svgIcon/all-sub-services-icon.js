import React from "react";
import { color_schema } from "../../src/constant";

const dimension = {
  width: 50,
  height: 50,
};
// Consultation Icons
export const AudioIcon = ({
  className,
  style = { color: color_schema.yellow },
  ...props
}) => (
  <svg
    width={dimension.width}
    height={dimension.height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    {...props}
  >
    {/* Speaker / audio waves */}
    <path d="M14 16h4l6-6v28l-6-6h-4V16z" fill="currentColor" />
    <path
      d="M26 20c2 0 4 2 4 4s-2 4-4 4"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export const VideoIcon = ({
  className,
  style = { color: color_schema.yellow },

  ...props
}) => (
  <svg
    width={dimension.width}
    height={dimension.height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    {...props}
  >
    {/* Video camera */}
    <rect
      x="8"
      y="12"
      width="24"
      height="24"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <polygon points="32,18 40,14 40,34 32,30" fill="currentColor" />
  </svg>
);

// Nursing / Clinic Icons
export const ClinicIcon = ({
  className,
  style = { color: color_schema.yellow },

  ...props
}) => (
  <svg
    width={dimension.width}
    height={dimension.height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    {...props}
  >
    {/* Cross hospital */}
    <rect
      x="14"
      y="10"
      width="20"
      height="28"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path d="M24 16v10M19 21h10" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const HomeVisitIcon = ({
  className,
  style = { color: color_schema.yellow },

  ...props
}) => (
  <svg
    width={dimension.width}
    height={dimension.height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    {...props}
  >
    {/* Home shape */}
    <path
      d="M8 24l16-12 16 12v16H8V24z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path d="M20 40V28h8v12" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const GDAIcon = ({
  className,
  style = { color: color_schema.yellowge },

  ...props
}) => (
  <svg
    width={dimension.width}
    height={dimension.height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    {...props}
  >
    {/* People assist */}
    <circle
      cx="19"
      cy="18"
      r="4"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle
      cx="29"
      cy="30"
      r="4"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path d="M19,22 L29,26" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Lab / Test Icons
export const LabTestIcon = ({
  className,
  style = { color: color_schema.yellow },

  ...props
}) => (
  <svg
    width={dimension.width}
    height={dimension.height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    {...props}
  >
    {/* Test tube */}
    <path
      d="M20 8v24a4 4 0 0 0 8 0V8h-8z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="24" cy="36" r="2" fill="currentColor" />
  </svg>
);

// Medicine delivery / equipment
export const EquipmentIcon = ({
  className,
  style = { color: color_schema.yellow },

  ...props
}) => (
  <svg
    width={dimension.width}
    height={dimension.height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    {...props}
  >
    {/* Box / cart */}
    <rect
      x="10"
      y="16"
      width="28"
      height="20"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="18" cy="38" r="2" fill="currentColor" />
    <circle cx="30" cy="38" r="2" fill="currentColor" />
  </svg>
);

// Community / health camp
export const HealthCampIcon = ({
  className,
  style = { color: color_schema.yellow },

  ...props
}) => (
  <svg
    width={dimension.width}
    height={dimension.height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    {...props}
  >
    {/* Tent & people */}
    <path
      d="M24 12l12 10H12l12-10z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="20" cy="32" r="3" fill="currentColor" />
    <circle cx="28" cy="32" r="3" fill="currentColor" />
  </svg>
);

// Audits / training / tasks
export const TrainingIcon = ({
  className,
  style = { color: color_schema.yellow },

  ...props
}) => (
  <svg
    width={dimension.width}
    height={dimension.height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    {...props}
  >
    {/* Clipboard check */}
    <rect
      x="14"
      y="10"
      width="20"
      height="28"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <polyline
      points="18,24 22,28 30,20"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);
