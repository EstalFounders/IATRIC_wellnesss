import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/pricing-1");


import Banner5 from "../src/components/Common/Banner-5";
import Pricing1Pricing1 from "../src/components/Pricing-1/Pricing1Pricing1";
import Pricing1Pricing2 from "../src/components/Pricing-1/Pricing1Pricing2";
import Demo2Reviews2 from "../src/components/Demo-2/Demo2Reviews2";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";

const Pricing1 = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Our Pricing" />
      {/* END BREADCRUMB */}
      {/* PRICING-1
			============================================= */}
      <Pricing1Pricing1 />
      {/* END PRICING-1 */}
      {/* PRICING-2
			============================================= */}
      <Pricing1Pricing2 />
      {/* END PRICING-2 */}
      {/* TESTIMONIALS-2
			============================================= */}
      <Demo2Reviews2 />
      {/* END TESTIMONIALS-2 */}
      {/* BANNER-5
			============================================= */}
      <Banner5 />
    </Layouts>
  );
};

export default Pricing1;
