import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";
import { getBannerForStaticProps } from "../src/api/marketing/helpers/bannerServer";

// Marketing panel SEO + homepage banner: both are read server-side so the tags and
// the popup image URL are part of the built HTML and refresh at most every 60s;
// saving in the panel also triggers an on-demand rebuild.
export const getStaticProps = async () => {
  const [seo, bannerPopup] = await Promise.all([
    getSeoStaticProps("/"),
    getBannerForStaticProps(),
  ]);

  return {
    ...seo,
    props: { ...seo.props, bannerPopup },
  };
};


import Demo5 from "../pages/demo-5";
import BannerPopup from "../src/components/Common/BannerPopup";


const Home = ({ bannerPopup }) => {
  return (
    <div id="page" className="page-wrapper demo">
      <Demo5 />
      {/* Homepage-only promotional popup (single banner image). The URL is baked
          into the HTML above so the image can be warmed before the modal opens. */}
      <BannerPopup initialBanner={bannerPopup} />
    </div>
  );
};

export default Home;
