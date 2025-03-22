import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
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
                        <button className={styles.closeButton} onClick={onClose}>
                            ×
                        </button>

                        <h2 className={styles.title}>Flash Cards</h2>

                        <div className={styles.cardGrid}>
                            {cards.slice(0, 6).map((card) => (
                                <div key={card.id} className={styles.cardWrapper}>
                                    <FlashCard card={card} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}; 