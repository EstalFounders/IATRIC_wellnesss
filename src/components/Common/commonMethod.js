export const handleServiceClick = (serviceName, id, router) => {
  // Clean routing: only the service name is passed (no raw index/id), and the
  // department page prettifies it for display.
  const cleanName = String(serviceName || "").trim();
  if (!cleanName) return;

  router.push(`/department-single?serviceName=${encodeURIComponent(cleanName)}`);
};

export const getIconByName = (name) => {
  const iconMapping = {
    call: 2,
    video: 3,
    clinic: 4,
    home_visit: 5,
  };

  // Normalize the name to lowercase for case-insensitive matching
  const normalizedName = name.toLowerCase();
  return iconMapping[normalizedName] || 0; // Default to 0 if name doesn't match
};

export const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
