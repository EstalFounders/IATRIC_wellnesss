import { Col, Row } from "react-bootstrap";
import AnimatedSection from "../../../public/animation/animationSection/AnimatedSection";
import FirstSectionComp from "./FirstSectionComp";
import ExploreByCategoryComp from "./ExploreByCategoryComp";
import LatestArticlesComp from "./LatestArticleComp";
import NewsLetterComp from "./NewsLetterComp";
import { useEffect, useState } from "react";
import { fetchAllPost } from "../superAdminComponent/apiService/postArticleService";

export default function HomepageComp() {
  const [articles, setArticles] = useState();
  useEffect(() => {
    const fetchData = async () => {
      // Any data fetching logic can go here
      fetchAllPost(setArticles);
    };
    fetchData();
  }, []);
  
  console.log("Articles on homepage:", articles);

  return (
    <>
      <div className="mt-2">
        <>
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <Row>
              <Col>
                <FirstSectionComp articles = {articles} />
              </Col>
            </Row>
          </AnimatedSection>
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <Row>
              <Col>
                <ExploreByCategoryComp />
              </Col>
            </Row>
          </AnimatedSection>
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <Row>
              <Col>
                <LatestArticlesComp />
              </Col>
            </Row>
          </AnimatedSection>
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <Row>
              <Col>
                <NewsLetterComp />
              </Col>
            </Row>
          </AnimatedSection>
        </>
      </div>
    </>
  );
}
