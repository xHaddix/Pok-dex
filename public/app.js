document.getElementById('search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const pokemonName = document.getElementById('pokemon-name').value.toLowerCase(); // Usar .value
    fetchPokemonData(pokemonName); // Llamar a fetchPokemonData con el nombre del Pokémon
});

const fetchPokemonData = (name) => { // Usar función flecha
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se encontró el Pokémon');
            }
            return response.json();
        })
        .then(data => {
            displayPokemonData(data); // Llamar a displayPokemonData con los datos obtenidos
        })
        .catch(error => {
            document.getElementById('pokemon-info').innerHTML = `<p>${error.message}</p>`;
        });
}

const displayPokemonData = (data) => { // Usar función flecha
    const pokemonInfo = document.getElementById('pokemon-info');
    pokemonInfo.innerHTML = `
        <img src="${data.sprites.front_default}" alt="${data.name}">
        <p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>Número:</strong> ${data.id}</p>
        <p><strong>Tipo:</strong> ${data.types.map(type => type.type.name).join(', ')}</p>
    `;
}
