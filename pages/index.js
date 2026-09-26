import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: the tags are written into the built HTML and refresh at
// most every 60s; saving in the panel also triggers an on-demand rebuild.
export const getStaticProps = () => getSeoStaticProps("/");


import Demo5 from "../pages/demo-5";
import BannerPopup from "../src/components/Common/BannerPopup";


const Home = () => {
  return (
    <div id="page" className="page-wrapper demo">
      <Demo5 />
      {/* Homepage-only promotional popup (single banner image) */}
      <BannerPopup />
    </div>
  );
};

export default Home;
