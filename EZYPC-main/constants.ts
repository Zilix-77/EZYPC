
import { Question, UseCase } from './types';

export const QUESTIONS: Record<UseCase, Question[]> = {
  [UseCase.GAMING]: [
    {
      question: 'What is your approximate budget?',
      options: ['Under ₹60,000', '₹60,000 - ₹1,00,000', '₹1,00,000 - ₹1,50,000', 'Above ₹1,50,000'],
    },
    {
      question: 'What kind of games do you primarily play?',
      options: ['Esports titles (e.g., Valorant, CS:GO)', 'AAA single-player games (e.g., Cyberpunk 2077)', 'A mix of everything', 'Indie and less demanding games'],
    },
    {
      question: 'What is more important to you?',
      options: ['High frame rates (144+ FPS)', 'Maximum graphics quality (4K, Ray Tracing)', 'A balance between performance and quality', 'Just a smooth experience at 1080p'],
    },
     {
      question: 'Do you also plan to stream or create content?',
      options: ['Yes, frequently', 'Occasionally', 'No, just gaming', 'Not sure yet'],
    },
  ],
  [UseCase.STUDENT]: [
    {
      question: 'What is your approximate budget?',
      options: ['Under ₹40,000', '₹40,000 - ₹70,000', '₹70,000 - ₹1,00,000', 'Above ₹1,00,000'],
    },
    {
      question: 'What is your primary field of study?',
      options: ['General studies (arts, commerce, etc.)', 'Engineering or Computer Science', 'Design, Video Editing, or Architecture', 'Research or data-heavy fields'],
    },
    {
      question: 'How important is portability for you?',
      options: ['Very important, I need a lightweight laptop', 'Somewhat important, but I value performance too', 'Not important, a desktop PC is fine', 'I prefer a desktop for more power'],
    },
     {
      question: 'Do you have any secondary uses in mind?',
      options: ['Light gaming', 'Watching movies and media', 'Coding and projects', 'None, just for studies'],
    },
  ],
  [UseCase.GENERAL]: [
    {
      question: 'What is your approximate budget?',
      options: ['Under ₹35,000', '₹35,000 - ₹55,000', '₹55,000 - ₹80,000', 'Above ₹80,000'],
    },
    {
      question: 'What is the main purpose of this computer?',
      options: ['Web browsing, email, and office work', 'Media consumption (Netflix, YouTube)', 'Home office and light multitasking', 'Family use with some casual gaming'],
    },
    {
      question: 'What form factor do you prefer?',
      options: ['Laptop for portability', 'Desktop PC for upgradability', 'All-in-One for a clean setup', 'Mini PC for saving space'],
    },
    {
      question: 'Is there anything specific you value most?',
      options: ['A large, high-quality display', 'Fast performance and responsiveness', 'Long battery life (for laptops)', 'Plenty of storage space'],
    },
  ],
};
