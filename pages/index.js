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
