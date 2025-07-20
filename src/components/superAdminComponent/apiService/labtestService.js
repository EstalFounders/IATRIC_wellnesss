export const fetchLabTests = async ({setLabTests,setLoading,setError}) => {
  try {
    const response = await fetch("/api/superAdmin/labTest/labTestDetails"); // Replace with your API endpoint
    const data = await response.json();
    setLabTests(data);
    setLoading(false);
  } catch (err) {
    setError("Error fetching data");
    setLoading(false);
  }
};

export const fetchLabCateogory = async (setLabTestCategory) => {
  try {
    const response = await fetch("/api/labtestPackagescategorydetails"); // Replace with your API endpoint
    const data = await response.json();
    setLabTestCategory(data)
  } catch (err) {
    // setError("Error fetching data");
    // setLoading(false);
  }
};
