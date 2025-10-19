

function ShoppingList() {
    const plantList = [
    'monstera',
    'ficus lyrata',
    'pothos argenté',
    'yucca',
    'palmier'
];
    return (
        <p className="lmj-shopping-list">
        <ul>
            {plantList.map((plant, index) => (
                <li key={`${plant}-${index}`}>{ plant }</li>
            ))}
            {plantList.map((plant) => (
    <li key={ plant.id }>
        { plant }{plant.isBestSale ? <span>🔥</span> : <span>👎</span>}
    </li>
))}
        </ul>
        </p>
    )
}

export default ShoppingList

