const tabBtn = document.querySelectorAll('.tab-btn');
const all_content = document.querySelectorAll('.tab-content-box');


tabBtn.forEach((tab,index) => {
    tab.addEventListener('click', function() {
        tabBtn.forEach((tab) => {
            tab.classList.remove('active');
        })
        tab.classList.add('active');

        all_content.forEach((content) => {
            content.classList.remove('active');
        })
        all_content[index].classList.add('active');
    });
});

//========================================================================

const urlParams = new URLSearchParams(window.location.search);
const pokemonName = urlParams.get('name');

const getAPIData = async (pokemonName) => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        if (!response.ok) {
            throw new Error('Pokemon not found!');
        }
        const data = await response.json();

        const {
            name,
            height,
            weight,
            types,
            sprites: { front_default: frontImage },
            abilities,
            moves,
            stats
        } = data;

        const typesList = types.map(({ type }) => `<li>${type.name}</li>`).join('');
        const abilitiesList = abilities.map(({ability}) => `<li>${ability.name}</li>`).join('');
        const movesList = moves.map(({move}) => `<li>${move.name}</li>`).join('');
        const statsList = stats.map(({stat,base_stat}) => `<li>${stat.name} : ${base_stat}</li>`).join('');

        const rightInfoText = `
            <p>Name: ${name}</p>
            <p>Height: ${height}</p>
            <p>Weight: ${weight}</p>
            <p>Type:</p>
            <ul>${typesList}</ul>
        `;

        const leftImg = `<img src="${frontImage}" alt="">`;

        const abilitiesText = `
            <ul>${abilitiesList}</ul>
        `;

        const movesText = `
            <ul>${movesList}</ul>
        `;

        const statsText = `
            <ul>${statsList}</ul>
        `;

        updateDOM('.right-info-text', rightInfoText);
        updateDOM('.left-img', leftImg);
        updateDOM('.abilities-box', abilitiesText);
        updateDOM('.moves-box', movesText);
        updateDOM('.stats-box', statsText);

    } catch (error) {
        console.error('Error fetching Pokemon data:', error.message);
    }
};

const updateDOM = (selector, content) => {
    const element = document.querySelector(selector);
    if (element) {
        element.innerHTML = content;
    } else {
        console.error(`Element with selector "${selector}" not found.`);
    }
};


// function calls =========================================
getAPIData(pokemonName);