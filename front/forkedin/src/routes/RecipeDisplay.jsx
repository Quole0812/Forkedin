import { useState } from "react"
import "../styles/RecipeDisplay.css"



export default function RecipeDisplay() {










    return (
        <>
        <div className="header-container">
            <input type="text" className="search-bar" placeholder="Search" />
            <button className="button-orange" />
            <button className="button-green" />
        </div>
        <div className="grid-container">
      {Array(8).fill().map((_, i) => (
        <div className="card" key={i}>
          <div className="image-placeholder" />
          <div className="card-name">Name</div>
          <div className="card-info">
            <div><strong>#</strong> calories</div>
            <div>
              <div># serving size</div>
              <div># ingredients</div>
            </div>
          </div>
        </div>
      ))}
    </div>

        </>
    )
}