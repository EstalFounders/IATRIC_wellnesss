import { useDispatch, useSelector } from "react-redux";
import {
  setCategoryDetails,
  setHealthTestData,
  setViewCheckupsData,
} from "../../../store/slices/labTest/labTestCategoryApiData";
import {
  filterActiveHealthTest,
  getLabCategoryId,
} from "../common/CommonMethod";

export const fetchLabCateogory = async (dispatch) => {
  try {
    const response = await fetch("/api/labtestPackagescategorydetails"); // Replace with your API endpoint
    const data = await response.json();
    dispatch(setCategoryDetails(data));
  } catch (err) {
    // setError("Error fetching data");
    // setLoading(false);
  }
};

export const fetchLabTestsDetails = async (category,dispatch,categoryDetails) => {
  
  try {
    // const id = getLabCategoryId(category, categoryDetails);
    // console.log(id, 'id on home page service')
    const response = await fetch(`/api/labtestPackagedetails`); // Replace with your API endpoint
    const data = await response.json();
    console.log(data, "40");
    const activeData = filterActiveHealthTest(data);
    dispatch(setHealthTestData(activeData));
  } catch (err) {
    // setError("Error fetching data");
  }
};
