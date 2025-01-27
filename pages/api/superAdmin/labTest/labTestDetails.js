import { dbConnect } from "../../../../src/lib/db";
import LabTestDetails from "../../../../src/models/lab-test-detailsSchema";

export default async function handler(req, res) {
  await dbConnect();
  console.log("req");
  if (req.method === "GET") {
    try {
      const labTestsDetails = await LabTestDetails.find({});
      const allTestsIncluded = [
        ...new Map(
          labTestsDetails
            .map((labTest) => labTest.test_included) // Extract `test_included` arrays
            .flat() // Flatten the array of arrays
            .filter((test) => test.testName && test.parameters.length !== 0) // Exclude empty or invalid test names
            .map((test) => [test.testName, test]) // Map to [testName, test] key-value pairs
        ).values(),
      ];

      res.status(200).json(allTestsIncluded);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lab tests" });
    }
  }
}
