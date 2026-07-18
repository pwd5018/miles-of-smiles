import {
  Brain, CheckSquare, Compass, Crown, Dice5, Drama, Flag, Gamepad2,
  Heart, Lightbulb, Music2, Search, Sparkles, Star, Timer, Trophy, Users,
  Volume2, Zap
} from 'lucide-react';

export const activities = [
  {
    id: 'rainbow-road', type: 'Spot it', icon: Search, title: 'Rainbow Road',
    prompt: 'Find something outside for every color of the rainbow — in order!', meta: '5–15 min', ages: 'All ages', energy: 'calm', color: 'coral', gameType: 'scavenger',
    items: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'], bonus: 'Bonus point if nothing you spot is a car.'
  },
  {
    id: 'wild-ride', type: 'Would you rather?', icon: Sparkles, title: 'Wild Ride',
    prompt: 'Would you rather travel everywhere by giant turtle or tiny helicopter?', meta: '2–5 min', ages: 'All ages', energy: 'chatty', color: 'blue', gameType: 'vote',
    choices: ['Giant turtle', 'Tiny helicopter'], bonus: 'Everyone has to defend their answer.'
  },
  {
    id: 'one-word-wonder', type: 'Make a story', icon: Lightbulb, title: 'One Word Wonder',
    prompt: 'Build a story together, one word per person. Keep going until someone says “banana.”', meta: '5–10 min', ages: '6+', energy: 'silly', color: 'yellow', gameType: 'sequence',
    turns: 8, turnLabel: 'Add your next word', bonus: 'Try to work your destination into the story.'
  },
  {
    id: 'mystery-sound', type: 'Listen up', icon: Volume2, title: 'Mystery Sound',
    prompt: 'One person makes a sound with their eyes closed. Everyone else gets one guess.', meta: '5 min', ages: '4+', energy: 'silly', color: 'mint', gameType: 'sequence',
    turns: 2, turnLabel: 'Make a sound, then pass the phone', bonus: 'No animal sounds allowed in round two.'
  },
  {
    id: 'first-note', type: 'Music', icon: Music2, title: 'First Note Face-Off',
    prompt: 'Shuffle your music. Who can name the song fastest after the first three seconds?', meta: '10 min', ages: '6+', energy: 'loud', color: 'purple', gameType: 'timer',
    seconds: 30, bonus: 'Winner picks the next song.'
  },
  {
    id: 'alphabet-hunt', type: 'Challenge', icon: Trophy, title: 'Alphabet Hunt',
    prompt: 'Find the letters A through Z on signs, license plates, or buildings.', meta: '15–30 min', ages: 'All ages', energy: 'focused', color: 'orange', gameType: 'scavenger',
    items: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'], bonus: 'Skip Q and X if the grown-ups approve.'
  },
  {
    id: 'time-machine', type: 'Get talking', icon: Users, title: 'Tiny Time Machine',
    prompt: 'If you could revisit one family day, which would you pick and why?', meta: '5–10 min', ages: '6+', energy: 'calm', color: 'blue', gameType: 'sequence',
    turns: 5, turnLabel: 'Share your answer', bonus: 'Pick one thing you would do differently.'
  },
  {
    id: 'roadside-bingo', type: 'Spot it', icon: Compass, title: 'Roadside Bingo',
    prompt: 'First to spot a barn, motorcycle, water tower, dog, and yellow sign wins.', meta: '10–20 min', ages: 'All ages', energy: 'focused', color: 'mint', gameType: 'scavenger',
    items: ['Barn', 'Motorcycle', 'Water tower', 'Dog', 'Yellow sign'], bonus: 'No calling two items from the same view.'
  },
  {
    id: 'quiet-game', type: 'Quick game', icon: Star, title: 'The Quiet Game',
    prompt: 'First person to talk loses. Yes, grown-ups are allowed to play too.', meta: 'As long as possible', ages: 'All ages', energy: 'calm', color: 'yellow', gameType: 'timer',
    seconds: 60, bonus: 'Winner gets first snack pick.'
  },
  {
    id: 'name-five', type: 'Quick fire', icon: Zap, title: 'Name Five',
    prompt: 'Name five things in the category before the clock runs out.', meta: '1 min', ages: '6+', energy: 'loud', color: 'coral', gameType: 'rapid',
    seconds: 30, goal: 5, category: 'things you might pack for a beach day', bonus: 'Make the next player use a harder category.'
  },
  {
    id: 'license-plate', type: 'Spot it', icon: Flag, title: 'Plate Detective',
    prompt: 'Find a license plate from a new state or province. Call it out before anyone else!', meta: '10–30 min', ages: 'All ages', energy: 'focused', color: 'orange', gameType: 'scavenger',
    items: ['New state', 'Out-of-town plate', 'Funny plate', 'Plate with 3+ letters', 'Plate with a number 7'], bonus: 'Give the plate a fictional backstory.'
  },
  {
    id: 'destination-debate', type: 'Vote', icon: Crown, title: 'Destination Debate',
    prompt: 'Which would make the better vacation: a treehouse city or an underwater hotel?', meta: '3–8 min', ages: 'All ages', energy: 'chatty', color: 'blue', gameType: 'vote',
    choices: ['Treehouse city', 'Underwater hotel'], bonus: 'The losing side gets one chance to change the vote.'
  },
  {
    id: 'road-trip-charades', type: 'Act it out', icon: Drama, title: 'Carpool Charades',
    prompt: 'Act out a movie, animal, or job without saying a word. Everyone gets one guess.', meta: '5–15 min', ages: '6+', energy: 'silly', color: 'purple', gameType: 'sequence',
    turns: 6, turnLabel: 'Act it out, then pass the phone', bonus: 'Make the next prompt dramatically harder.'
  },
  {
    id: 'memory-chain', type: 'Memory', icon: Brain, title: 'Packing List',
    prompt: 'Build a packing list. Each player repeats the list and adds one new item.', meta: '5–10 min', ages: '6+', energy: 'focused', color: 'yellow', gameType: 'sequence',
    turns: 8, turnLabel: 'Repeat the list, then add one item', bonus: 'The item must start with the next letter of the alphabet.'
  },
  {
    id: 'no-laughing', type: 'Challenge', icon: Gamepad2, title: 'No Laughing',
    prompt: 'One player tries to make everyone laugh. Everyone else must keep a straight face.', meta: '2 min', ages: 'All ages', energy: 'silly', color: 'coral', gameType: 'timer',
    seconds: 45, bonus: 'The person who laughs becomes the comedian.'
  },
  {
    id: 'story-trailer', type: 'Make a story', icon: Lightbulb, title: 'Movie Trailer Voice',
    prompt: 'Describe your trip like an epic movie trailer. Use your biggest voice.', meta: '2–5 min', ages: '6+', energy: 'loud', color: 'orange', gameType: 'timer',
    seconds: 45, bonus: 'Add a surprise villain: the next rest stop.'
  },
  {
    id: 'this-that', type: 'Vote', icon: Dice5, title: 'This or That',
    prompt: 'Choose quickly: endless snacks or the perfect playlist?', meta: '2–5 min', ages: 'All ages', energy: 'chatty', color: 'mint', gameType: 'vote',
    choices: ['Endless snacks', 'Perfect playlist'], bonus: 'Explain your choice in exactly three words.'
  },
  {
    id: 'kindness-round', type: 'Get talking', icon: Heart, title: 'Passenger Praise',
    prompt: 'Give the player to your left a sincere compliment about this trip.', meta: '3–5 min', ages: 'All ages', energy: 'calm', color: 'coral', gameType: 'sequence',
    turns: 6, turnLabel: 'Give a compliment, then pass the phone', bonus: 'Make it specific to something they did today.'
  },
  {
    id: 'road-trip-trivia', type: 'Trivia', icon: CheckSquare, title: 'Road Trip Trivia',
    prompt: 'Take turns answering: what is the strangest thing you have ever seen on a road trip?', meta: '5–10 min', ages: 'All ages', energy: 'chatty', color: 'purple', gameType: 'sequence',
    turns: 6, turnLabel: 'Answer the question, then pass the phone', bonus: 'The best answer gets the next snack choice.'
  },
  {
    id: 'beat-the-clock', type: 'Challenge', icon: Timer, title: 'Beat the Clock',
    prompt: 'How many different car colors can you spot before time runs out?', meta: '1 min', ages: 'All ages', energy: 'focused', color: 'blue', gameType: 'timer',
    seconds: 45, bonus: 'No counting the same color twice.'
  },
];

export const filters = ['All', 'Calm', 'Silly', 'Chatty', 'Focused', 'Loud'];
