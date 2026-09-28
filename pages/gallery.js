import { getSeoStaticProps } from "../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: tags are part of the built HTML (60s refresh).
export const getStaticProps = () => getSeoStaticProps("/gallery");


import dynamic from "next/dynamic";
import Layouts from "../src/layout/Layouts";
import PageBanner from "../src/layout/PageBanner";
const Gallery3 = dynamic(() => import("../src/components/Gallery/Gallery3"), {
  ssr: false,
});

const Gallery = () => {
  return (
    <Layouts>
      <PageBanner pageTitle="Our Gallery" />
      <Gallery3 />
    </Layouts>
  );
};

export default Gallery;
