import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Ingredient from './Ingredient.jsx'; 
import axios from 'axios';
import { auth } from '../../../firebase.js';

import Header from '../Header.jsx';
import '../../styles/CreateRecipe.css'

export default function CreateRecipe() {
    const navigate = useNavigate();
    const [inputsEnabled, setInputsEnabled] = useState(false);
    const [recipeName, setRecipeName] = useState("");
    const [loading, setLoading] = useState(false);
    const [ingredients, setIngredients] = useState([{ name: "", qty: "", unit: "", note: "" }]);
    const [highlightFields, setHighlightFields] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [yieldAmt, setYieldAmt] = useState("");
    const [calories, setCalories] = useState("");
    
    // New fields for recipe details compatibility
    const [source, setSource] = useState("");
    const [url, setUrl] = useState("");
    const [prepTime, setPrepTime] = useState("");
    const [cookTime, setCookTime] = useState("");
    const [cuisineType, setCuisineType] = useState([]);
    const [mealType, setMealType] = useState([]);
    const [dishType, setDishType] = useState([]);
    const [dietLabels, setDietLabels] = useState([]);
    const [healthLabels, setHealthLabels] = useState([]);
    const [cautions, setCautions] = useState([]);
    const [instructions, setInstructions] = useState([""]);
    
    const inputFile = useRef(null);

    // Predefined options for dropdowns
    const cuisineOptions = ['American', 'Asian', 'British', 'Caribbean', 'Central Europe', 'Chinese', 'Eastern Europe', 'French', 'Indian', 'Italian', 'Japanese', 'Kosher', 'Mediterranean', 'Mexican', 'Middle Eastern', 'Nordic', 'South American', 'South East Asian'];
    const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Teatime'];
    const dishOptions = ['Biscuits and cookies', 'Bread', 'Cereals', 'Condiments and sauces', 'Desserts', 'Drinks', 'Main course', 'Pancake', 'Preps', 'Preserve', 'Salad', 'Sandwiches', 'Side dish', 'Soup', 'Starter', 'Sweets'];
    const dietOptions = ['Balanced', 'High-Fiber', 'High-Protein', 'Low-Carb', 'Low-Fat', 'Low-Sodium'];
    const healthOptions = ['Sugar-Conscious', 'Low Potassium', 'Kidney-Friendly', 'Keto-Friendly', 'Plant Based', 'Vegan', 'Vegetarian', 'Pescatarian', 'Paleo', 'Mediterranean', 'DASH', 'Dairy-Free', 'Gluten-Free', 'Wheat-Free', 'Egg-Free', 'Milk-Free', 'Peanut-Free', 'Tree-Nut-Free', 'Soy-Free', 'Fish-Free', 'Shellfish-Free'];
    const cautionOptions = ['Tree-Nuts', 'Peanuts', 'Dairy', 'Eggs', 'Soy', 'Fish', 'Shellfish', 'Wheat', 'Gluten', 'Sulfites'];

    useEffect(() => {
        const isValid = recipeName.trim().length > 0;
        setInputsEnabled(isValid);
        if (isValid && ingredients.length === 0) {
            setIngredients([{ name: "", qty: "", unit: "", note: ""}]);
        }
    }, [recipeName])

    // cleanup unused image URL from the browser
    useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [imageUrl]);

    const handleSetRecipeName = (recipeNameValue) => {
        if (loading) return;
        setRecipeName(recipeNameValue);
    }

    const handleAddIngredientRow = () => {
        const last = ingredients[ingredients.length - 1];
        if (last && (!last.name || !last.qty || !last.unit)) {
            setHighlightFields(true);
            alert("Please fill out all ingredient fields")
            return;
        }

        setIngredients([...ingredients, {name: "", qty: "", unit: "", note: ""}]);
        console.log(ingredients);
    }

    const handleIngredientChange = (index, field, value) => {
        const updated = [...ingredients];
        updated[index][field] = value;
        setIngredients(updated);
    }

    const handleRemoveIngredientRow = (index) => {
        const updated = [...ingredients];
        updated.splice(index, 1);
        setIngredients(updated);
    }

    const getImage = () => {
        inputFile.current.click();
        setImageUrl(inputFile);
    }

    const handleRemoveImage = () => {
        console.log("image removed");
        setImageUrl("");
    }

    const handleAddInstruction = () => {
        setInstructions([...instructions, ""]);
    }

    const handleInstructionChange = (index, value) => {
        const updated = [...instructions];
        updated[index] = value;
        setInstructions(updated);
    }

    const handleRemoveInstruction = (index) => {
        if (instructions.length > 1) {
            const updated = [...instructions];
            updated.splice(index, 1);
            setInstructions(updated);
        }
    }

    const handleMultiSelectChange = (setter, value, currentArray) => {
        if (currentArray.includes(value)) {
            setter(currentArray.filter(item => item !== value));
        } else {
            setter([...currentArray, value]);
        }
    }

    const calculateTotalTime = () => {
        const prep = parseInt(prepTime) || 0;
        const cook = parseInt(cookTime) || 0;
        return prep + cook;
    }

    const formatIngredientsForDetails = () => {
        return ingredients
            .filter(ing => ing.name.trim())
            .map(ing => {
                let formatted = `${ing.qty} ${ing.unit} ${ing.name}`;
                if (ing.note.trim()) {
                    formatted += ` (${ing.note})`;
                }
                return formatted.trim();
            });
    }

    const handleCreateRecipe = async () => {
        const formData = new FormData();
        const file = inputFile.current.files[0];

        // Original fields
        formData.append("name", recipeName);
        formData.append("calories", calories);
        formData.append("yieldAmt", yieldAmt);
        formData.append("ingredients", JSON.stringify(ingredients));
        
        // New fields for recipe details compatibility
        formData.append("source", source || "User Created");
        formData.append("url", url);
        formData.append("totalTime", calculateTotalTime().toString());
        formData.append("cuisineType", JSON.stringify(cuisineType));
        formData.append("mealType", JSON.stringify(mealType));
        formData.append("dishType", JSON.stringify(dishType));
        formData.append("dietLabels", JSON.stringify(dietLabels));
        formData.append("healthLabels", JSON.stringify(healthLabels));
        formData.append("cautions", JSON.stringify(cautions));
        formData.append("instructions", JSON.stringify(instructions.filter(inst => inst.trim())));
        formData.append("ingredientLines", JSON.stringify(formatIngredientsForDetails()));
        
        if (file) {
            formData.append("image", file);
        }

        try {
            // Get the current user's ID token
            const user = auth.currentUser;
            if (!user) {
                throw new Error("You must be logged in to create a recipe");
            }
            
            const idToken = await user.getIdToken();
            
            const response = await axios.post("http://localhost:5001/create", formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${idToken}`
                }
            });
            
            // Navigate to the recipe details page using the returned recipe ID
            const recipeId = response.data.id;
            navigate(`/recipe/${recipeId}`);
        } catch (err) {
            console.error("Error uploading recipe:", err);
        }
    };

    return (
        <> 
            <Header />
            <div className='cr-main-container'>
                {/* Recipe Header Section */}
                <div className='cr-header-section'>
                    <h1 className="cr-page-title">Create New Recipe</h1>
                    
                    {/* Recipe Name */}
                    <div className="cr-name-section">
                        <input 
                            className='cr-input-name'
                            placeholder='Enter your recipe name...'
                            value={recipeName}
                            onChange={(e) => handleSetRecipeName(e.target.value)}         
                        />
                        
                        {/* Show message when inputs are disabled */}
                        {!inputsEnabled && (
                            <div className="cr-helper-message">
                                👆 Please enter a recipe name first to continue
                            </div>
                        )}
                    </div>
                </div>

                {/* Basic Info Section */}
                <div className="cr-basic-section">
                    <div className="cr-info-left">
                        <h3>Basic Information</h3>
                        <div className="cr-basic-inputs">
                            <input 
                                className='cr-input-basic'
                                placeholder='Source (optional)'
                                value={source}
                                disabled={!inputsEnabled}
                                onChange={(e) => setSource(e.target.value)}
                            />
                            <input 
                                className='cr-input-basic'
                                placeholder='Recipe URL (optional)'
                                value={url}
                                disabled={!inputsEnabled}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                        
                        {/* Time and Yield */}
                        <div className="cr-time-yield-grid">
                            <div className="cr-input-group">
                                <label>Prep Time (min)</label>
                                <input 
                                    className='cr-input-small'
                                    type="number"
                                    placeholder='15'
                                    value={prepTime}
                                    disabled={!inputsEnabled}
                                    onChange={(e) => setPrepTime(e.target.value)}
                                />
                            </div>
                            <div className="cr-input-group">
                                <label>Cook Time (min)</label>
                                <input 
                                    className='cr-input-small'
                                    type="number"
                                    placeholder='30'
                                    value={cookTime}
                                    disabled={!inputsEnabled}
                                    onChange={(e) => setCookTime(e.target.value)}
                                />
                            </div>
                            <div className="cr-input-group">
                                <label>Servings</label>
                                <input 
                                    className='cr-input-small'
                                    type="number"
                                    placeholder='4'
                                    value={yieldAmt}
                                    disabled={!inputsEnabled}
                                    onChange={(e) => setYieldAmt(e.target.value)}
                                />
                            </div>
                            <div className="cr-input-group">
                                <label>Calories</label>
                                <input 
                                    className='cr-input-small'
                                    type="number"
                                    placeholder='250'
                                    value={calories}
                                    disabled={!inputsEnabled}
                                    onChange={(e) => setCalories(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="cr-image-section">
                        <h3>Recipe Photo</h3>
                        {imageUrl.length > 0 ? (
                            <div className='cr-image-preview'>
                                <img src={imageUrl} alt="Recipe preview" />
                                <button 
                                    className='cr-remove-image-btn' 
                                    onClick={handleRemoveImage}
                                >
                                    Remove Photo
                                </button>
                            </div>
                        ) : (
                            <div className="cr-image-upload">
                                <button 
                                    className='cr-upload-btn'
                                    disabled={!inputsEnabled}
                                    onClick={getImage}
                                >
                                    📷 Upload Photo
                                </button>
                                <p className="cr-upload-hint">Add a photo to make your recipe more appealing</p>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={inputFile}
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const previewURL = URL.createObjectURL(file);
                                    setImageUrl(previewURL);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Main Content Section */}
                <div className="cr-content-section">
                    {/* Ingredients Column */}
                    <div className='cr-ingredients-column'>
                        <h2>Ingredients</h2>
                        <div className="cr-ingredients-list">
                            {ingredients.map((ingredient, idx) => (
                                <Ingredient 
                                    key={idx}
                                    index={idx}
                                    data={ingredient}
                                    inputsEnabled={inputsEnabled}
                                    onChange={handleIngredientChange}
                                    onAdd={handleAddIngredientRow}
                                    onRemove={() => handleRemoveIngredientRow(idx)}
                                    isLast={idx === ingredients.length - 1}
                                /> 
                            ))}
                        </div>
                    </div>

                    {/* Instructions Column */}
                    <div className='cr-instructions-column'>
                        <h2>Instructions</h2>
                        <div className="cr-instructions-list">
                            {instructions.map((instruction, idx) => (
                                <div key={idx} className="cr-instruction-row">
                                    <span className="cr-step-number">{idx + 1}</span>
                                    <textarea 
                                        className='cr-instruction-textarea'
                                        placeholder={`Describe step ${idx + 1}...`}
                                        value={instruction}
                                        disabled={!inputsEnabled}
                                        onChange={(e) => handleInstructionChange(idx, e.target.value)}
                                    />
                                    {instructions.length > 1 && (
                                        <button 
                                            className="cr-remove-step-btn"
                                            disabled={!inputsEnabled}
                                            onClick={() => handleRemoveInstruction(idx)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            
                            <button 
                                className="cr-add-step-btn"
                                disabled={!inputsEnabled}
                                onClick={handleAddInstruction}
                            >
                                + Add Step
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Section */}
                <div className="cr-categories-container">
                    <h2>Recipe Categories & Labels</h2>
                    
                    <div className="cr-categories-grid">
                        {/* Cuisine Type */}
                        <div className="cr-category-section">
                            <h4>Cuisine Type</h4>
                            <div className="cr-tags-container">
                                {cuisineOptions.map(option => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`cr-tag ${cuisineType.includes(option) ? 'selected' : ''}`}
                                        disabled={!inputsEnabled}
                                        onClick={() => handleMultiSelectChange(setCuisineType, option, cuisineType)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Meal Type */}
                        <div className="cr-category-section">
                            <h4>Meal Type</h4>
                            <div className="cr-tags-container">
                                {mealOptions.map(option => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`cr-tag ${mealType.includes(option) ? 'selected' : ''}`}
                                        disabled={!inputsEnabled}
                                        onClick={() => handleMultiSelectChange(setMealType, option, mealType)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dish Type */}
                        <div className="cr-category-section">
                            <h4>Dish Type</h4>
                            <div className="cr-tags-container">
                                {dishOptions.map(option => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`cr-tag ${dishType.includes(option) ? 'selected' : ''}`}
                                        disabled={!inputsEnabled}
                                        onClick={() => handleMultiSelectChange(setDishType, option, dishType)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Diet Labels */}
                        <div className="cr-category-section">
                            <h4>Diet Labels</h4>
                            <div className="cr-tags-container">
                                {dietOptions.map(option => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`cr-tag diet-tag ${dietLabels.includes(option) ? 'selected' : ''}`}
                                        disabled={!inputsEnabled}
                                        onClick={() => handleMultiSelectChange(setDietLabels, option, dietLabels)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Health Labels */}
                        <div className="cr-category-section">
                            <h4>Health Labels</h4>
                            <div className="cr-tags-container">
                                {healthOptions.map(option => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`cr-tag health-tag ${healthLabels.includes(option) ? 'selected' : ''}`}
                                        disabled={!inputsEnabled}
                                        onClick={() => handleMultiSelectChange(setHealthLabels, option, healthLabels)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cautions */}
                        <div className="cr-category-section">
                            <h4>Allergies & Cautions</h4>
                            <div className="cr-tags-container">
                                {cautionOptions.map(option => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`cr-tag caution-tag ${cautions.includes(option) ? 'selected' : ''}`}
                                        disabled={!inputsEnabled}
                                        onClick={() => handleMultiSelectChange(setCautions, option, cautions)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Button Section */}
                <div className="cr-submit-section">
                    <button
                        className='cr-create-recipe-btn'
                        disabled={!inputsEnabled}
                        onClick={handleCreateRecipe}
                    >
                        🍽️ Create Recipe
                    </button>
                </div>
            </div>
        </>
    )
}