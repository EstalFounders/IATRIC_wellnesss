import React, { useEffect, useState } from 'react';
import { Carousel, Row, Col } from 'react-bootstrap';
import styles from '../css/Slideshow.module.css';

const Slideshow = () => {
  const images = [
    '/images/labtest/slider/image1.webp',
    '/images/labtest/slider/image2.jpg',
    '/images/labtest/slider/image3.avif',
    // Add more image paths as needed
  ];

  return (
    <Row className="justify-content-center">
      <Col xs={12} md={8} lg={11}>
        <Carousel controls={false} indicators={true} interval={1000} className={styles.carousel}>
          {images.map((src, index) => (
            <Carousel.Item key={index}>
              <img
                className={`d-block w-100 ${styles.carouselImage}`}
                src={src}
                alt={`Slide ${index + 1}`}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </Col>
    </Row>
  );
};

export default Slideshow;
