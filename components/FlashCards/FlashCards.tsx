import React, { useState } from 'react';
import { FlashCardData } from './FlashCard';
import { FlashCardModal } from './FlashCardModal';
import styles from './FlashCards.module.css';

const exampleCards: FlashCardData[] = [
    { id: '1', question: 'What is React?', answer: 'A JavaScript library for building user interfaces' },
    { id: '2', question: 'Is JavaScript typed?', answer: 'False. JavaScript is dynamically typed' },
    { id: '3', question: 'HTML stands for?', answer: 'HyperText Markup Language' },
    { id: '4', question: 'CSS specificity order', answer: 'Inline > ID > Class > Element' },
    { id: '5', question: 'What is Redux?', answer: 'A state management library' },
    { id: '6', question: 'React uses Virtual DOM', answer: 'True' },
];

export const FlashCards: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className={styles.container}>
            <button className={styles.openButton} onClick={openModal}>
                Open Flash Cards
            </button>

            <FlashCardModal
                isOpen={isModalOpen}
                onClose={closeModal}
                cards={exampleCards}
            />
        </div>
    );
};
