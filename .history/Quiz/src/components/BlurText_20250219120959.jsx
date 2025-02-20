import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BlurText = ({ text, delay = 40, animateBy = 'letters', direction = 'right', className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const elements = animateBy === 'letters' 
    ? text.split('') 
    : text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: delay / 1000 }
    }
  };

  const child = {
    hidden: { 
      opacity: 0,
      y: direction === 'top' ? 20 : 0,
      x: direction === 'right' ? 20 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className={className}
    >
      {elements.map((el, idx) => (
        <motion.span
          key={idx}
          variants={child}
          style={{ display: 'inline-block' }}
        >
          {el}{animateBy === 'words' && idx !== elements.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default BlurText;