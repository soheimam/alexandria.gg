import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { FlashCard, FlashCardData } from './FlashCard';
import styles from './FlashCardModal.module.css';

interface FlashCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    cards: FlashCardData[];
}

export const FlashCardModal: React.FC<FlashCardModalProps> = ({
    isOpen,
    onClose,
    cards
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);

    // Reset state when modal closes
    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setCurrentIndex(0);
            setDirection(null);
        }, 300);
    };

    const handleSwipe = (direction: 'left' | 'right') => {
        setDirection(direction);
        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                // All cards completed
                handleClose();
            }
            setDirection(null);
        }, 200);
    };

    const getCardStackElements = () => {
        return cards.slice(currentIndex, currentIndex + 3).map((card, idx) => (
            <FlashCard
                key={card.id}
                card={card}
                isActive={idx === 0}
                index={currentIndex + idx}
                totalCards={cards.length}
                onSwipe={idx === 0 ? handleSwipe : undefined}
            />
        ));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={styles.modal}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", damping: 25 }}
                    >
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill} 
                                style={{ width: `${(currentIndex / cards.length) * 100}%` }}
                            />
                        </div>
                        
                        <button className={styles.closeButton} onClick={handleClose}>
                            ×
                        </button>

                        <h2 className={styles.title}>Flash Cards</h2>
                        <p className={styles.instructions}>Swipe or tap to reveal answer</p>

                        <div className={styles.cardStack}>
                            {getCardStackElements()}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 