import { Col, Row } from "react-bootstrap";
import AnimatedSection from "../../../public/animation/animationSection/AnimatedSection";
import FirstSectionComp from "./FirstSectionComp";
import ExploreByCategoryComp from "./ExploreByCategoryComp";
import LatestArticlesComp from "./LatestArticleComp";
import NewsLetterComp from "./NewsLetterComp";

export default function HomepageComp() {
  return (
    <>
      <div className="mt-2">
        <>
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <Row>
              <Col>
                <FirstSectionComp />
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
