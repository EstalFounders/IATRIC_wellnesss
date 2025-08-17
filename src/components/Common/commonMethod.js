export const handleServiceClick = (serviceName, id, router) => {
  router.push(
    `/department-single?serviceName=${serviceName
      .toLowerCase()
      .replace(/\s+/g, "-")}&id=${id}`
  );
  // setShowDoctor(true);
  // ${serviceName.toLowerCase().replace(/\s+/g, '-')}
  // Add your logic here for handling the service click
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
