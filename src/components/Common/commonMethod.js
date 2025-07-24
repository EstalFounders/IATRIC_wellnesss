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
