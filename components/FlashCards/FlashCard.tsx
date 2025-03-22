import { motion } from 'framer-motion';
import React, { useState } from 'react';
import styles from './FlashCard.module.css';

export interface FlashCardData {
    id: string;
    question: string;
    answer: string;
}

interface FlashCardProps {
    card: FlashCardData;
}

export const FlashCard: React.FC<FlashCardProps> = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className={styles.cardContainer} onClick={handleFlip}>
            <motion.div
                className={styles.card}
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                <div className={`${styles.cardFace} ${styles.cardFront}`}>
                    <h3>{card.question}</h3>
                </div>
                <div className={`${styles.cardFace} ${styles.cardBack}`}>
                    <p>{card.answer}</p>
                </div>
            </motion.div>
        </div>
    );
}; 