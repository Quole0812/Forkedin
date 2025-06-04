import e from 'cors';
import { useEffect, useState } from 'react';

export default function Ingredient({ index, inputsEnabled, data, 
    onChange, onAdd, onRemove, isLast}) {
    const handleChange = (field, value) => {
        onChange(index, field, value)
    }
    

    return (
        <>
            {console.log("im in the Ingredient component")}
            <div className='cr-ingredient-row'> 
                <input 
                    value={data.name}
                    className='cr-input-ingredient' 
                    placeholder='Ingredient' 
                    disabled={!inputsEnabled}
                    onChange={(e) => handleChange("name", e.target.value)}
                />
                <input 
                    value={data.qty}
                    className='cr-input-qty' 
                    placeholder='QTY.' 
                    disabled={!inputsEnabled}
                    onChange={(e) => handleChange("qty", e.target.value)}
                />
                <input 
                    value={data.unit}
                    className='cr-input-units' 
                    placeholder='Unit' 
                    disabled={!inputsEnabled}
                    onChange={(e) => handleChange("unit", e.target.value)}
                />
                <input 
                    value={data.note}
                    className='cr-input-note' 
                    placeholder='Note' disabled={!inputsEnabled}
                    onChange={(e) => handleChange("note", e.target.value)}
                />
                {/* Show + for new/empty rows, - for already filled rows */}
                {isLast ? (
                    <button 
                        className='cr-add-ingredient-button' 
                        disabled={!inputsEnabled} 
                        onClick={onAdd}>
                        +
                    </button>
                ) : (
                    <button 
                        className='cr-remove-ingredient-button' 
                        disabled={!inputsEnabled} 
                        onClick={onRemove}>
                        -
                    </button>
                )}
                
            </div>
        </>
    )
}