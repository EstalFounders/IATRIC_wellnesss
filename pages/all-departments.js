import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";
import AllSpecialityCards, {
  DEFAULT_SPECIALITIES,
} from "../src/components/All/AllSpecialityCards";

export default function AllDepartments() {
  return (
    <Layouts>
      <PageBanner pageTitle="All Departments" />
      <section className="departments-body">
        <div className="container py-5">
          <AllSpecialityCards
            specialities={DEFAULT_SPECIALITIES}
            showSearch
            showHeading
            heading="Browse by Speciality"
            subHeading="Every card below is a department you can consult online or in-clinic. Use the search box to jump straight to a speciality."
          />
        </div>
      </section>
    </Layouts>
  );
}
