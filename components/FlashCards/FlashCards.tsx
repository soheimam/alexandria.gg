import React, { useState } from 'react';
import { FlashCardData } from './FlashCard';
import { FlashCardModal } from './FlashCardModal';
import styles from './FlashCards.module.css';

const exampleCards: FlashCardData[] = [
    { 
        id: '1', 
        question: 'What type of design does OnchainKit offer?', 
        answer: 'A comprehensive, composable design system for web3 applications with React components' 
    },
    { 
        id: '2', 
        question: 'What is the primary component in OnchainKit for wallet connections?', 
        answer: 'ConnectWallet component' 
    },
    { 
        id: '3', 
        question: 'Which OnchainKit component is used for displaying user identities?', 
        answer: 'The Identity component with Avatar and Name subcomponents' 
    },
    { 
        id: '4', 
        question: 'What is required at the root of an OnchainKit application?', 
        answer: 'OnchainKitProvider component' 
    },
    { 
        id: '5', 
        question: 'Which OnchainKit component is used for handling transactions?', 
        answer: 'Transaction component' 
    },
    { 
        id: '6', 
        question: 'What is the purpose of Frame components in OnchainKit?', 
        answer: 'To create and manage Farcaster Frames with proper metadata and validation' 
    },
];

interface FlashCardsProps {
    cards?: FlashCardData[];
}

export const FlashCards: React.FC<FlashCardsProps> = ({ cards = exampleCards }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className={styles.container}>
            <button className={styles.openButton} onClick={openModal}>
                Study Flash Cards
            </button>

            <FlashCardModal
                isOpen={isModalOpen}
                onClose={closeModal}
                cards={cards}
            />
        </div>
    );
};
