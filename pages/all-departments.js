import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";
import AllSpecialityCards, {
  DEFAULT_SPECIALITIES,
} from "../src/components/All/AllSpecialityCards";
import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO for this route (it has a "departments" entry).
export const getStaticProps = () => getSeoStaticProps("/all-departments");

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
            headingAs="h1"
            heading="All Departments & Specialities"
            subHeading="Every card below is a department you can consult online or in-clinic. Use the search box to jump straight to a speciality."
          />
        </div>
      </section>
    </Layouts>
  );
}
