import { useEffect, useState } from 'react';
import { Input } from '@mui/material';
import { Button } from '@mui/material';
import { createTheme } from '@mui/material/styles';
// import { Typography } from '@mui/material';

import Header from './Header.jsx';
import '../styles/CreateRecipe.css'

export default function CreateRecipe() {
    const [inputsEnabled, setInputsEnabled] = useState(false);

    const handleClick = () => {
        console.log("click");
    }

    return (
        <> 
            <Header />
                <div className='cr-grid-container'>
                    <input 
                        className='cr-input2'
                        placeholder='Enter a name for your new recipe'                    
                    />
                    <div className='cr-directions-left-container'>
                        <h2 className='cr-h2-ingredients'>Ingredients</h2>
                          <div className='cr-ingredient-row'>
                            <input className='cr-input-ingredient' placeholder='Ingredient' disabled={!inputsEnabled}/>
                            <input className='cr-input-qty' placeholder='QTY.' disabled={!inputsEnabled}/>
                            <input className='cr-input-units' placeholder='Unit' disabled={!inputsEnabled}/>
                            <input className='cr-input-note' placeholder='Note' disabled={!inputsEnabled}/>
                            <button className='cr-add-ingredient-button' disabled={!inputsEnabled}>+</button>
                        </div>
                    </div>
                    <div className='cr-directions-right-container'>
                        <h2 className='cr-h2-directions'>Directions</h2>
                        
                        <button className='cr-image-button'>Add Image</button>
                        <textarea className='cr-input3'></textarea>                 
                        <button
                            className='cr-create-button'
                            onClick={handleClick}
                        >
                            +
                        </button>
                    </div>
                    {console.log("hi")}
                </div>
        </>
    )
}