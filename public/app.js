document.getElementById('search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const pokemonName = document.getElementById('pokemon-name').value.toLowerCase();
    fetchPokemonData(pokemonName);
});

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

            // Fetch the species URL to get the evolution chain
            if (data.species && data.species.url) {
                return fetch(data.species.url);
            } else {
                throw new Error('Species data not available');
            }
        })
        .then(response => response.json())
        .then(speciesData => {
            return fetch(speciesData.evolution_chain.url);  // Fetch the evolution chain URL
        })
        .then(response => response.json())
        .then(evolutionData => {
            displayEvolutionChain(evolutionData);  // Show evolution chain directly
        })
        .catch(error => {
            document.getElementById('pokemon-info').innerHTML = `<p>${error.message}</p>`;
        });
}

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

const displayPokemonData = (data) => {
    const pokemonInfo = document.getElementById('pokemon-info');
    const movesDataPromises = data.moves.map(move => fetchMoveData(move.move.url));

    Promise.all(movesDataPromises).then(movesData => {
        pokemonInfo.innerHTML = `
            <div class="pokemon-card">
                <h2>${data.name}</h2>
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <img src="${data.sprites.back_default}" alt="${data.name}">
                <p><strong>Number:</strong> ${data.id}</p>
                <p><strong>Weight:</strong> ${data.weight}</p>
                <p><strong>Type(s):</strong> ${data.types.map(type => type.type.name).join(', ')}</p>
                <p><strong>Abilities:</strong> ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
            </div>

            <div class="pokemon-card-shiny">
                <h3>Shiny Version:</h3>
                <img src="${data.sprites.front_shiny}" alt="${data.name}">
                <img src="${data.sprites.back_shiny}" alt="${data.name}">
            </div>

            <div class="tab-container">
                <button class="tab" onclick="toggleTab('moves-tab')">Moves</button>
                <button class="tab" onclick="toggleTab('stats-tab')">Stats</button>
                <button class="tab" onclick="toggleTab('evolution-tab')">Evolution</button>

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
                <div id="evolution-tab" class="tab-content">
                    <!-- Evolution content will be added here -->
                </div>
            </div>
        `;
    }).catch(error => {
        pokemonInfo.innerHTML = `<p>Error loading moves: ${error.message}</p>`;
    });
}

const displayEvolutionChain = (evolutionData) => {
    const evolutionChain = [];
    let currentEvolution = evolutionData.chain;

    while (currentEvolution) {
        const pokemonName = currentEvolution.species.name;
        const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
        const evolutionLevel = currentEvolution.evolution_details.length > 0 ? 
            (currentEvolution.evolution_details[0].min_level || 'N/A') : 'N/A';
        evolutionChain.push({ name: pokemonName, url: pokemonUrl, level: evolutionLevel });

        currentEvolution = currentEvolution.evolves_to[0];
    }

    // Remove existing evolution chain if any
    const existingEvolutionContainer = document.getElementById('evolution-container');
    if (existingEvolutionContainer) {
        existingEvolutionContainer.remove();
    }

    const evolutionContainer = document.createElement('div');
    evolutionContainer.id = 'evolution-container';
    evolutionContainer.innerHTML = '<h3>Línea Evolutiva</h3>';

    const evolutionPromises = evolutionChain.map(pokemon => 
        fetch(pokemon.url).then(response => response.json())
    );

    Promise.all(evolutionPromises).then(pokemonDataArray => {
        pokemonDataArray.forEach((pokemonData, index) => {
            const pokemon = evolutionChain[index];
            const evolutionElement = document.createElement('div');
            evolutionElement.innerHTML = `
                <p><strong>${pokemon.name}</strong> (Level: ${pokemon.level})</p>
                <img src="${pokemonData.sprites.front_default}" alt="${pokemon.name}">
            `;
            evolutionContainer.appendChild(evolutionElement);
        });

        document.getElementById('evolution-tab').appendChild(evolutionContainer);
        toggleTab('active'); // Automatically show the Evolution tab
    }).catch(error => {
        document.getElementById('evolution-tab').innerHTML += `<p>Error loading evolution data: ${error.message}</p>`;
    });
}

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
