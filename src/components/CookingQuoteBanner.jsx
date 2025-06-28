import React from 'react';

const quotes = [
  "Cooking is like love. It should be entered into with abandon or not at all. – Harriet Van Horne",
  "No one is born a great cook, one learns by doing. – Julia Child",
  "The secret ingredient is always love.",
  "Good food is the foundation of genuine happiness. – Auguste Escoffier",
  "Cooking is at once child's play and adult joy. And cooking done with care is an act of love. – Craig Claiborne",
  "A recipe has no soul. You as the cook must bring soul to the recipe. – Thomas Keller",
  "People who love to eat are always the best people. – Julia Child",
  "The only real stumbling block is fear of failure. In cooking you've got to have a what-the-hell attitude. – Julia Child",
  "Happiness is homemade.",
  "First we eat, then we do everything else. – M.F.K. Fisher",
  "Cooking is an art, but all art requires knowledge of techniques and materials. – Nathan Myhrvold",
  "Food is symbolic of love when words fail. – Alan D. Wolfelt",
  "The discovery of a new dish contributes more to the happiness of mankind than the discovery of a star. – Jean Anthelme Brillat-Savarin",
  "Cooking is about creating something delicious for someone else. – Ayumi Komura",
  "Cooking isn’t about convenience or shortcuts. It’s about creating something beautiful. – Thomas Keller",
  "Innovation happens when you do something different. – Ferran Adrià",
  "Creativity is like a muscle: the more you use it, the better you get at it. – Massimo Bottura",
  "The kitchen is a reflection of society and the chef is the one who reflects that. – Alain Ducasse",
  "You don't need a silver fork to eat good food. – Paul Prudhomme",
  "Cooking with imagination and love is what transforms simple ingredients into extraordinary dishes. – Marco Pierre White",
  "Perfection is doing many small things well. – Marco Pierre White",
  "Great cooking is about being inspired by the simple things around you. – Gaggan Anand",
  "The simpler the food, the harder it is to control it. – Joël Robuchon",
  "Respect the ingredients, and they will respect you. – René Redzepi",
  "A good chef lets the product speak for itself. – Alice Waters",
  "Good food is very often, even most often, simple food. – Anthony Bourdain",
  "Gastronomy is the art of using food to create happiness. – Théodore Zeldin",
  "Cooking is not chemistry. It is an art. It requires instinct and taste rather than exact measurements. – Marcel Boulestin",
  "Cooking is a form of expression, and it reflects who we are. – Anthony Bourdain",
  "Food is not just what you eat; it’s how you feel. – Unknown",
  "I cook with wine. Sometimes I even add it to the food. – W.C. Fields",
  "Life is uncertain. Eat dessert first. – Ernestine Ulmer",
  "Cooking is like love. It should be entered into with abandon or not at all. – Harriet Van Horne",
  "My cooking is so fabulous, even the smoke alarm cheers me on. – Unknown",
  "I’m on the seafood diet. I see food and I eat it. – Unknown",
  "People who love to eat are always the best people. – Julia Child",
  "You don’t have to cook fancy or complicated masterpieces, just good food from fresh ingredients. – Julia Child",
  "Cooking is not chemistry. It is an art. It requires instinct and taste rather than exact measurements. – Marcel Boulestin",
  "Cooking is a form of expression, and it reflects who we are. – Anthony Bourdain",
  "Food is not just what you eat; it’s how you feel. – Unknown",
  "I cook with wine. Sometimes I even add it to the food. – W.C. Fields",
  "Life is uncertain. Eat dessert first. – Ernestine Ulmer",
  "Cooking is like love. It should be entered into with abandon or not at all. – Harriet Van Horne",
  "My cooking is so fabulous, even the smoke alarm cheers me on. – Unknown",
  "I’m on the seafood diet. I see food and I eat it. – Unknown",
  "People who love to eat are always the best people. – Julia Child",
  "You don’t have to cook fancy or complicated masterpieces, just good food from fresh ingredients. – Julia Child",
  "Cooking is not chemistry. It is an art. It requires instinct and taste rather than exact measurements. – Marcel Boulestin",
  "Cooking is a form of expression, and it reflects who we are. – Anthony Bourdain",
  "Food is not just what you eat; it’s how you feel. – Unknown",
  "I cook with wine. Sometimes I even add it to the food. – W.C. Fields",
  "Life is uncertain. Eat dessert first. – Ernestine Ulmer",
  "Cooking is like love. It should be entered into with abandon or not at all. – Harriet Van Horne",
  "My cooking is so fabulous, even the smoke alarm cheers me on. – Unknown",
  "I’m on the seafood diet. I see food and I eat it. – Unknown",
  "People who love to eat are always the best people. – Julia Child",
  "You don’t have to cook fancy or complicated masterpieces, just good food from fresh ingredients. – Julia Child",
  "Cooking is not chemistry. It is an art. It requires instinct and taste rather than exact measurements. – Marcel Boulestin",
  "Cooking is a form of expression, and it reflects who we are. – Anthony Bourdain",
  "Food is not just what you eat; it’s how you feel. – Unknown",
  "I cook with wine. Sometimes I even add it to the food. – W.C. Fields",
  "Life is uncertain. Eat dessert first. – Ernestine Ulmer",
  "Cooking is like love. It should be entered into with abandon or not at all. – Harriet Van Horne",
  "My cooking is so fabulous, even the smoke alarm cheers me on. – Unknown",
  "I’m on the seafood diet. I see food and I eat it. – Unknown",
  "People who love to eat are always the best people. – Julia Child",
  "You don’t have to cook fancy or complicated masterpieces, just good food from fresh ingredients. – Julia Child",
  "Cooking is not chemistry. It is an art. It requires instinct and taste rather than exact measurements. – Marcel Boulestin",
  "Cooking is a form of expression, and it reflects who we are. – Anthony Bourdain",
  "Food is not just what you eat; it’s how you feel. – Unknown",
  "I cook with wine. Sometimes I even add it to the food. – W.C. Fields"
];

const CookingQuoteBanner = () => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  return (
    <div style={{
      width: '100%',
      background: '#fffbe6',
      color: '#b8860b',
      padding: '12px 0',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize: '1.1rem',
      borderBottom: '1px solid #ffe58f',
      letterSpacing: '0.5px',
      zIndex: 1000
    }}>
      {quote}
    </div>
  );
};

export default CookingQuoteBanner; 