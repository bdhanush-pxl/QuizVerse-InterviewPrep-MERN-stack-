import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BlurText = ({ 
  text, 
  delay = 40, 
  animateBy = 'letters', 
  direction = 'right', 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [elements, setElements] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    setElements(animateBy === 'letters' ? text.split('') : text.split(' '));
  }, [text, animateBy]);

  const containerVariants = {
    hidden: { 
      opacity: 0,
      filter: 'blur(10px)'
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: { 
        staggerChildren: delay / 1000,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: direction === 'top' ? 20 : 0,
      x: direction === 'right' ? 20 : 0,
      filter: 'blur(10px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      filter: 'blur(0px)',
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className={`font-poppins ${className}`}
    >
      {elements.map((el, idx) => (
        <motion.span
          key={idx}
          variants={itemVariants}
          style={{ 
            display: 'inline-block',
            whiteSpace: 'pre'
          }}
        >
          {el}
          {animateBy === 'words' && idx !== elements.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default BlurText;