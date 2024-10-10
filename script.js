async function getPokemon() {
    const pokemonName = document.getElementById('pokemonNameInput').value.toLowerCase(); // Obtenemos el nombre ingresado
    const pokemonContainer = document.getElementById('pokemonContainer');
    
    // Limpiar el contenedor antes de mostrar nueva información
    pokemonContainer.innerHTML = '';

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        if (!response.ok) {
            throw new Error('No se encontró el Pokémon');
        }

        const data = await response.json();
        
        // Obtener información adicional como la especie
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        
        // Obtener la URL de la cadena de evolución
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        
        // Obtener la primera aparicion
        // const versionGroup = await fetch(data.forms.url)
        // const versionData = await versionGroup.json()
        // console.log(versionData);
        
        // Obtener los tipos del Pokémon en español
        const typesInSpanish = await Promise.all(
            data.types.map(async (typeInfo) => {
                const typeResponse = await fetch(typeInfo.type.url);
                const typeData = await typeResponse.json();
                const typeInSpanish = typeData.names.find(name => name.language.name === 'es');
                return typeInSpanish.name;
            })
        );
        
        // Obtener las habilidades en español
        const abilitiesInSpanish = await Promise.all(
            data.abilities.map(async (abilityInfo) => {
                const abilityResponse = await fetch(abilityInfo.ability.url);
                const abilityData = await abilityResponse.json();
                const abilityInSpanish = abilityData.names.find(name => name.language.name === 'es');
                return abilityInSpanish.name;
            })
        )
        
        // Obtener descripcion
        const descSpanish = speciesData.flavor_text_entries.find(flavorInfo => flavorInfo.language.name === 'es').flavor_text;
        
        // Mostrar los datos del Pokémon
        displayPokemon(data, speciesData.genera[5].genus, typesInSpanish, abilitiesInSpanish, descSpanish);
        
        // Mostrar la cadena de evolución
        displayEvolutionChain(evolutionData.chain);

        // console.log(data);
        // console.log(speciesData);
        
    } catch (error) {
        pokemonContainer.innerHTML = `<p>${error.message}</p>`;
    }
}

function displayPokemon(data, genus, typesInSpanish, abilitiesInSpanish, descSpanish) {
    const pokemonContainer = document.getElementById('pokemonContainer');

    // Crear el contenido para mostrar la información del Pokémon
    pokemonContainer.innerHTML = `
        <h1 class='nombre'>${data.name.toUpperCase()}</h1>
        <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}">
        <p><strong>N°:</strong> ${data.order}</p>
        <p><strong>Tipo:</strong> ${typesInSpanish.join(', ')}</p> <!-- Mostrar tipos en español -->
        <p><strong>Genus:</strong> ${genus}</p>
        <p><strong>Habilidades:</strong> ${abilitiesInSpanish.join(', ')}</p>
        <p><strong>Descripción:</strong> ${descSpanish}</p>
        `;
        // <p><strong>Primera aparición:</strong> ${version}</p>
    
    // Añadir clase 'show' para animación suave
    pokemonContainer.classList.add('show');
}

// Función para mostrar la cadena de evolución
function displayEvolutionChain(evolutionChain) {
    const pokemonContainer = document.getElementById('pokemonContainer');
    
    let evolutionNames = [];

    // Función recursiva para recorrer la cadena de evolución
    function getEvolutions(chain) {
        evolutionNames.push(chain.species.name);
        if (chain.evolves_to.length > 0) {
            chain.evolves_to.forEach(evolution => getEvolutions(evolution));
        }
    }

    getEvolutions(evolutionChain);

    // Mostrar la cadena de evolución en el contenedor
    pokemonContainer.innerHTML += `
        <p><strong>Cadena de Evolución:</strong> ${evolutionNames.join(' → ')}</p>
    `;
}
