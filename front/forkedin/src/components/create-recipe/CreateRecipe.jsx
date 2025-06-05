import { useEffect, useState } from 'react';

import { Input } from '@mui/material';
import { Button } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Ingredient from './Ingredient.jsx'; 
import axios from 'axios';
// import { Typography } from '@mui/material';

import Header from '../Header.jsx';
import '../../styles/CreateRecipe.css'
import { ConstructionOutlined } from '@mui/icons-material';

export default function CreateRecipe() {
    const [inputsEnabled, setInputsEnabled] = useState(false);
    const [recipeName, setRecipeName] = useState("");
    const [loading, setLoading] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [highlightFields, setHighlightFields] = useState(false);
    const [image, setImage] = useState("");
    const [directions, setDirections] = useState("");
    const [yieldAmt, setYieldAmt] = useState("");
    const [calories, setCalories] = useState("");

    useEffect(() => {
        const isValid = recipeName.trim().length > 0;
        setInputsEnabled(isValid);
        if (isValid && ingredients.length === 0) {
            setIngredients([{ name: "", qty: "", unit: "", note: ""}]);
        }
    }, [recipeName])

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

    const handleImageUploadToS3 = (blob) => {
        console.log("opening file explorer");
        console.log(`uploading ${blob} to S3`);
        setImage("lol");
        console.log("setting image link");
    }

    const handleCreateRecipe = async () => {
        const updated = [...ingredients];
        updated.splice(updated.length - 1, 1);

        try {
            await axios.post('http://localhost:5001/create', {
                calories,
                ingredients: updated,
                name: recipeName,
                yieldAmt,
                directions,
                image
            });

            // toastify dat DOM 
        }
        catch (error) {
            console.error("Error from CreateRecipe.jsx when attempting POST:", error);
        }

        // trim empty object at end of array
        
        console.log(`${recipeName} recipe created.`);
        console.log("Ingredients:", updated);
        console.log("Directions:", directions);
        console.log("Yield:", yieldAmt);
        console.log("Calories:", calories);
        console.log("Image:", image);
    }

    return (
        <> 
            <Header />
                <div className='cr-grid-container'>
                    {/* check for existing recipeName before enabling input */}
                    <input 
                        className='cr-input2'
                        placeholder='Enter a name for your new recipe'
                        onChange={(e) => handleSetRecipeName(e.target.value)}         
                    />
                    { image.length > 0 ? (
                        <div className='cr-input2'>
                            lol
                        </div>
                    ) : 
                        <>

                        </>
                    }
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
                            onClick={handleImageUploadToS3}
                        >
                            Add Image
                        </button>
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