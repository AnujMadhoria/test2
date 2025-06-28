import React from 'react';

const PreferencesForm = ({ preferences, setPreferences, onSubmit }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences({ ...preferences, [name]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4 bg-white rounded shadow-md max-w-xl mx-auto mt-4">
      <h2 className="text-xl font-bold">🍽 Recipe Preferences</h2>

      {/* Serving Size */}
      <div>
        <label className="block font-semibold">Serving Size:</label>
        <input
          type="range"
          min="1"
          max="4"
          name="servingSize"
          value={preferences.servingSize}
          onChange={handleChange}
          className="w-full"
        />
        <p>
          {['1 pax', '2 pax', '<5 pax', '>5 pax'][preferences.servingSize - 1]}
        </p>
      </div>

      {/* Cuisine Type */}
      <div>
        <label className="block font-semibold">Cuisine Type:</label>
        <select name="cuisine" value={preferences.cuisine} onChange={handleChange} className="w-full border p-2 rounded">
          <option>Indian</option>
          <option>Chinese</option>
          <option>Italian</option>
          <option>Mediterranean</option>
          <option>Continental</option>
          <option>South Indian</option>
          <option>Hyderabadi</option>
          <option>Punjabi</option>
        </select>
      </div>

      {/* Meal Type */}
      <div>
        <label className="block font-semibold">Meal Type:</label>
        <select name="mealType" value={preferences.mealType} onChange={handleChange} className="w-full border p-2 rounded">
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Evening Snacks</option>
          <option>Dinner</option>
        </select>
      </div>

      {/* Diet */}
      <div>
        <label className="block font-semibold">Diet:</label>
        <select name="diet" value={preferences.diet} onChange={handleChange} className="w-full border p-2 rounded">
          <option>Veg</option>
          <option>Non-Veg</option>
          <option>Jain</option>
          <option>Vegan</option>
        </select>
      </div>

      {/* Allergies */}
      <div>
        <label className="block font-semibold">Allergy to specific ingredient:</label>
        <input
          type="text"
          name="allergy"
          value={preferences.allergy}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="e.g. peanuts, mushrooms"
        />
      </div>

      {/* Lactose & Diabetic */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold">Lactose Tolerant?</label>
          <select name="lactose" value={preferences.lactose} onChange={handleChange} className="w-full border p-2 rounded">
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold">Diabetic?</label>
          <select name="diabetic" value={preferences.diabetic} onChange={handleChange} className="w-full border p-2 rounded">
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
      </div>

      {/* Cooking Time */}
      <div>
        <label className="block font-semibold">Cooking Time:</label>
        <select name="cookingTime" value={preferences.cookingTime} onChange={handleChange} className="w-full border p-2 rounded">
          <option>&lt;15 mins</option>
          <option>&lt;30 mins</option>
          <option>Within an hour</option>
        </select>
      </div>

      {/* Health Goal */}
      <div>
        <label className="block font-semibold">Health Goal:</label>
        <input
          type="text"
          name="healthGoal"
          value={preferences.healthGoal}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="e.g. high protein, keto diet"
        />
      </div>

      {/* Spicy Level */}
      <div>
        <label className="block font-semibold">Spicy Level:</label>
        <input
          type="range"
          min="1"
          max="3"
          name="spicyLevel"
          value={preferences.spicyLevel}
          onChange={handleChange}
          className="w-full"
        />
        <p>{['Little', 'Medium', 'High'][preferences.spicyLevel - 1]}</p>
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 h-[42px] w-[200px] flex items-center justify-center"
      >
        Generate Recipe
      </button>
    </form>
  );
};

export default PreferencesForm;
