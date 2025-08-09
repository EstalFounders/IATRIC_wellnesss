import {useScrollAnimation}  from '../animationHook/useScrollAnimation';

const AnimatedSection = ({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0, 
  duration = 0.8,
  threshold = 0.1 
}) => {
  const [ref, isVisible] = useScrollAnimation({ threshold });

  const animations = {
    fadeInUp: {
      transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
      opacity: isVisible ? 1 : 0,
    },
    fadeInLeft: {
      transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
      opacity: isVisible ? 1 : 0,
    },
    fadeInRight: {
      transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
      opacity: isVisible ? 1 : 0,
    },
    fadeIn: {
      opacity: isVisible ? 1 : 0,
    },
    scaleIn: {
      transform: isVisible ? 'scale(1)' : 'scale(0.8)',
      opacity: isVisible ? 1 : 0,
    },
    slideInUp: {
      transform: isVisible ? 'translateY(0)' : 'translateY(100px)',
      opacity: isVisible ? 1 : 0,
    },
    rotateIn: {
      transform: isVisible ? 'rotate(0deg) scale(1)' : 'rotate(-10deg) scale(0.9)',
      opacity: isVisible ? 1 : 0,
    },
    bounceIn: {
      transform: isVisible ? 'scale(1)' : 'scale(0.3)',
      opacity: isVisible ? 1 : 0,
    }
  };

  return (
    <div
      ref={ref}
      style={{
        transition: `all ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
        transitionDelay: `${delay}s`,
        ...animations[animation]
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;