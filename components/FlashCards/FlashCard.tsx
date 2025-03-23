import { motion, PanInfo, useAnimation } from 'framer-motion';
import React, { useState } from 'react';
import styles from './FlashCard.module.css';

export interface FlashCardData {
    id: string;
    question: string;
    answer: string;
}

interface FlashCardProps {
    card: FlashCardData;
    onSwipe?: (direction: 'left' | 'right') => void;
    isActive?: boolean;
    index?: number;
    totalCards?: number;
}

export const FlashCard: React.FC<FlashCardProps> = ({ 
    card, 
    onSwipe, 
    isActive = true,
    index = 0,
    totalCards = 1
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const controls = useAnimation();

    const handleFlip = (e: React.MouseEvent) => {
        if (isActive) {
            setIsFlipped(!isFlipped);
        }
    };

    const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (!isActive) return;
        
        const threshold = 100;
        
        if (info.offset.x > threshold) {
            controls.start({ x: '100%', opacity: 0 })
                .then(() => onSwipe && onSwipe('right'));
        } else if (info.offset.x < -threshold) {
            controls.start({ x: '-100%', opacity: 0 })
                .then(() => onSwipe && onSwipe('left'));
        } else {
            controls.start({ x: 0, opacity: 1 });
        }
    };

    const cardZIndex = isActive ? 10 : 10 - index;
    
    return (
        <motion.div 
            className={styles.cardContainer}
            style={{ 
                zIndex: cardZIndex,
                position: 'absolute',
                transform: `translateY(${index * -4}px) scale(${1 - index * 0.05})`,
                opacity: isActive ? 1 : 0.8 - index * 0.1,
                pointerEvents: isActive ? 'auto' : 'none'
            }}
            animate={controls}
            drag={isActive ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            onClick={handleFlip}
        >
            <div className={styles.cardContent}>
                {/* Front of card */}
                <motion.div
                    className={`${styles.cardFace} ${styles.cardFront}`}
                    initial={false}
                    animate={{
                        rotateY: isFlipped ? 180 : 0,
                        opacity: isFlipped ? 0 : 1
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    {isActive && (
                        <div className={styles.cardCounter}>
                            {index + 1}/{totalCards}
                        </div>
                    )}
                    
                    <h3>{card.question}</h3>
                </motion.div>
                
                {/* Back of card */}
                <motion.div
                    className={`${styles.cardFace} ${styles.cardBack}`}
                    initial={false}
                    animate={{
                        rotateY: isFlipped ? 0 : -180,
                        opacity: isFlipped ? 1 : 0
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    {isActive && (
                        <div className={styles.cardCounter}>
                            {index + 1}/{totalCards}
                        </div>
                    )}
                    
                    <p>{card.answer}</p>
                </motion.div>
            </div>
        </motion.div>
    );
}; 