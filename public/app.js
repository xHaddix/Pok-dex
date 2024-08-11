// Handling the search form
document.getElementById('search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const pokemonName = document.getElementById('pokemon-name').value.toLowerCase();
    fetchPokemonData(pokemonName);
});

// Function to fetch Pokémon data
const fetchPokemonData = (name) => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Pokémon not found');
            }
            return response.json();
        })
        .then(data => {
            displayPokemonData(data);
        })
        .catch(error => {
            document.getElementById('pokemon-info').innerHTML = `<p>${error.message}</p>`;
        });
}

// Function to fetch move data
const fetchMoveData = (moveUrl) => {
    return fetch(moveUrl)
        .then(response => response.json())
        .then(moveData => ({
            name: moveData.name,
            type: moveData.type.name,
            power: moveData.power || 'Status Move',
            accuracy: moveData.accuracy || 'N/A',
            pp: moveData.pp || 'N/A'
        }));
}

// Function to display Pokémon data
const displayPokemonData = (data) => {
    const pokemonInfo = document.getElementById('pokemon-info');
    const movesDataPromises = data.moves.map(move => fetchMoveData(move.move.url));

    Promise.all(movesDataPromises).then(movesData => {
        pokemonInfo.innerHTML = `
            <div class="pokemon-card">
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Number:</strong> ${data.id}</p>
                <p><strong>Type(s):</strong> ${data.types.map(type => type.type.name).join(', ')}</p>
                <p><strong>Abilities:</strong> ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
            </div>
            <div class="tab-container">
                <button class="tab" onclick="toggleTab('moves-tab')">Moves</button>
                <button class="tab" onclick="toggleTab('stats-tab')">Stats</button>
                <div id="moves-tab" class="tab-content">
                    <h2>Moves</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Move</th>
                                <th>Type</th>
                                <th>Power</th>
                                <th>Accuracy</th>
                                <th>PP</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${movesData.map(move => `
                                <tr>
                                    <td>${move.name}</td>
                                    <td>${move.type}</td>
                                    <td>${move.power}</td>
                                    <td>${move.accuracy}</td>
                                    <td>${move.pp}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div id="stats-tab" class="tab-content">
                    <h2>Stats</h2>
                    ${data.stats.map(stat => `
                        <div class="stats-bar">
                            <span style="width: ${stat.base_stat}%">${stat.stat.name}: ${stat.base_stat}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).catch(error => {
        pokemonInfo.innerHTML = `<p>Error loading moves: ${error.message}</p>`;
    });
}

// Function to toggle tabs
const toggleTab = (tabId) => {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        if (tab.id === tabId) {
            tab.classList.toggle('active');
        } else {
            tab.classList.remove('active');
        }
    });
}
