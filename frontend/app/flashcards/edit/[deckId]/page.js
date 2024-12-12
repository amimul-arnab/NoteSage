"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FlashcardWizard from '../../../components/FlashcardWizard';

export default function EditDeckPage() {
    const router = useRouter();
    const params = useParams();
    const [deck, setDeck] = useState(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }

        const { deckId } = params;

        if (deckId && deckId !== 'new') { // Check if deckId exists and is not 'new'
            fetch(`http://localhost:5000/flashcards/decks/${deckId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 404) {
                        router.push('/flashcards');
                    }
                    throw new Error(`HTTP error ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setDeck(data);
            })
            .catch(error => {
                console.error('Error loading deck:', error);
                router.push('/flashcards');
            });
        } else if (deckId === 'new') {
            // Initialize a new deck object if creating a new deck
            setDeck({
                title: '',
                description: '',
                underglowColor: '',
                cards: [{ id: 1, term: '', definition: '', image: null }]
            });
        }
    }, [params.deckId, token, router]);

    const handleSave = async (updatedDeck) => {
        try {
            const method = params.deckId === 'new' ? 'POST' : 'PUT';
            const url = params.deckId === 'new'
                ? 'http://localhost:5000/flashcards/decks'
                : `http://localhost:5000/flashcards/decks/${params.deckId}`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedDeck)
            });

            if (!response.ok) {
                const errorData = await response.json(); // Try to get error details from the server
                const errorMessage = errorData?.error || errorData || 'Failed to save deck.';
                console.error('Error saving deck:', errorMessage);
                alert(errorMessage);
            } else {
                router.push('/flashcards');
            }
        } catch (error) {
            console.error('Error saving deck:', error);
            alert('Failed to save deck. Please check your network connection and try again.'); // More user-friendly message
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this deck?')) return;

        try {
            const response = await fetch(`http://localhost:5000/flashcards/decks/${params.deckId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
              const errorData = await response.json(); // Try to get error details from the server
              const errorMessage = errorData?.error || errorData || 'Failed to delete deck.';
              console.error('Error deleting deck:', errorMessage);
              alert(errorMessage);
            } else {
                router.push('/flashcards');
            }
        } catch (error) {
            console.error('Error deleting deck:', error);
            alert('Failed to delete deck. Please check your network connection and try again.');
        }
    };

    const handleClose = () => {
        if (confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
            router.push('/flashcards');
        }
    };

    // Conditionally render the FlashcardWizard
    if (!deck) {
        return <div>Loading...</div>; 
    }

    return (
        <FlashcardWizard
            existingDeck={deck}
            onSave={handleSave}
            onDelete={params.deckId !== 'new' ? handleDelete : undefined}
            onClose={handleClose}
        />
    );
}