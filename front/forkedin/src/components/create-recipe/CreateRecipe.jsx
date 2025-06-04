import { useEffect, useState } from 'react';
import { Input } from '@mui/material';
import { Button } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Ingredient from './Ingredient.jsx'; 
// import { Typography } from '@mui/material';

import Header from '../Header.jsx';
import '../../styles/CreateRecipe.css'

export default function CreateRecipe() {
    const [inputsEnabled, setInputsEnabled] = useState(false);
    const [recipeName, setRecipeName] = useState("");
    const [loading, setLoading] = useState(false);
    const [ingredients, setIngredients] = useState([]);
    const [highlightFields, setHighlightFields] = useState(false);

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
    
    const handleCreateRecipe = () => {
        
        console.log("recipe created");
        
    }

    return (
        <> 
            <Header />
                <div className='cr-grid-container'>
                    <input 
                        className='cr-input2'
                        placeholder='Enter a name for your new recipe'
                        onChange={(e) => handleSetRecipeName(e.target.value)}                    
                    />
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
                    </div>
                    <div className='cr-directions-right-container'>
                        <h2 className='cr-h2-directions'>Directions</h2>
                        
                        <button className='cr-image-button'>Add Image</button>
                        <textarea className='cr-input3'></textarea>                 
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