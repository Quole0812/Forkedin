import { useEffect, useState, useRef } from 'react';
import Ingredient from './Ingredient.jsx'; 
import axios from 'axios';

import Header from '../Header.jsx';
import '../../styles/CreateRecipe.css'

export default function CreateRecipe() {
    const [inputsEnabled, setInputsEnabled] = useState(false);
    const [recipeName, setRecipeName] = useState("");
    const [loading, setLoading] = useState(false);
    const [ingredients, setIngredients] = useState([{ name: "", qty: "", unit: "", note: "" }]);
    const [highlightFields, setHighlightFields] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [directions, setDirections] = useState("");
    const [yieldAmt, setYieldAmt] = useState("");
    const [calories, setCalories] = useState("");
    const inputFile = useRef(null);

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

    const handleCreateRecipe = async () => {
        const formData = new FormData();
        const file = inputFile.current.files[0];

        formData.append("name", recipeName);
        formData.append("calories", calories);
        formData.append("yieldAmt", yieldAmt);
        formData.append("directions", directions);
        formData.append("ingredients", JSON.stringify(ingredients));
        if (file) {
            formData.append("image", file);
        }

        try {
            await axios.post("http://localhost:5001/create", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
        } catch (err) {
            console.error("Error uploading recipe:", err);
        }
};

    return (
        <> 
            <Header />
                <div className='cr-grid-container'>
                    {/* check for existing recipeName before enabling input */}
                    <div className='cr-top-row-container'>
                        <input 
                            className='cr-input2'
                            placeholder='Enter a name for your new recipe'
                            onChange={(e) => handleSetRecipeName(e.target.value)}         
                        />
                        { imageUrl.length > 0 ? (
                            <>
                                
                                <div className='cr-image-card'>
                                    <button 
                                    className='cr-remove-image-button' 
                                    onClick={handleRemoveImage}
                                >
                                    x
                                </button>
                                    
                                    <img src={imageUrl} alt="preview" style={{ width: "100%", height: "100%", borderRadius: "8px" }} />
                                    
                                </div>
                            </>
                        ) : 
                            <>

                            </>
                        }
                    </div>
                    <div className='cr-directions-left-container'>
                        <h2 className='cr-h2-ingredients'>Ingredients</h2>
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
                        {/* cr-ingredient-row and everything in it should probably just be its own component */}
                          {/* <div className='cr-ingredient-row'> 
                            <input 
                                className='cr-input-ingredient' 
                                placeholder='Ingredient' 
                                disabled={!inputsEnabled}
                            
                            />
                            <input 
                                className='cr-input-qty' 
                                placeholder='QTY.' 
                                disabled={!inputsEnabled}
                                
                            />
                            <input 
                                className='cr-input-units' 
                                placeholder='Unit' 
                                disabled={!inputsEnabled}
                                
                            />
                            <input 
                                className='cr-input-note' 
                                placeholder='Note' disabled={!inputsEnabled}
                                />
                            <button className='cr-add-ingredient-button' disabled={!inputsEnabled} onClick={handleSetIngredient}>+</button>
                        </div> */}
                        <div className='cr-total-row'> 
                            <h3 className='cr-h3-totals'>Makes</h3>
                            <input 
                                className='cr-input-ingredient' 
                                placeholder='yield' 
                                disabled={!inputsEnabled}
                                onChange={(e) => setYieldAmt(e.target.value)}
                            />
                            <h3 className='cr-h3-totals'>Calories</h3>
                            <input 
                                className='cr-input-note' 
                                placeholder='Cals' 
                                disabled={!inputsEnabled}
                                onChange={(e) => setCalories(e.target.value)}
                            />
                        </div>
                        
                    </div>
                    <div className='cr-directions-right-container'>
                        <h2 className='cr-h2-directions'>Directions</h2>
                        
                        <button 
                            className='cr-image-button'
                            onClick={getImage}
                        >
                            Add Image
                        </button>
                        <input
                            type="file"
                            ref={inputFile}
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                    if (file) {
                                        const previewURL = URL.createObjectURL(file);
                                        setImageUrl(previewURL);
                                        console.log("Selected file:", file);
                                    }
                                }}
                            />
                        <textarea 
                            className='cr-input3'
                            placeholder='Enter your directions here...'
                            onChange={(e) => setDirections(e.target.value)}
                        />                 
                        <button
                            className='cr-create-button'
                            onClick={handleCreateRecipe}
                        >
                            +
                        </button>
                    </div>
                    
                    {console.log("hi")}
                </div>
        </>
    )
}