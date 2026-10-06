import type { Metadata } from 'next';
import Flashcards from '@/components/flashcard/Flashcards';
import data from '@/data/content/flashcards.json';
import '@/styles/flashcard.css';

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
};

export default function FlashcardPage() {
  return <Flashcards />;
}
