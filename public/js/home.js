const homeContainer = document.getElementById('home-container');
const cardContainer = document.querySelector(".card-container");
const prevBtn = document.querySelector(".prev-btn");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("search-btn");
const clearBtn = document.getElementById("clear-btn");
const cards = document.querySelectorAll(".cards");
const pageCount = document.querySelector(".page-count");
const favCardContainer = document.querySelector('.favroite-card');
const openFavList = document.querySelector('.fav-btn')
const closeFavList = document.querySelector('.fav-close--btn')
const overlayDiv = document.querySelector('.overlay')
const clearAllFavList = document.querySelector('.fav-clear--btn');
const selectLimit = document.getElementById('limit');


let currentPage = 1;
let currentLimit = 10; //default value of limit

// Fetch data function=============================================================================================================================
const getAPIData = async (page,limit) => {
  currentPage = page;
  updatePageCount(currentPage);// updates page count

  try {
    const templimit = limit ? limit : currentLimit;
    const offset = templimit * (page - 1);
    console.log(`in get api ${templimit} ${offset}`);
    const response1 = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${templimit}&offset=${offset}`
    );
    const data = await response1.json();
    const { results } = data;

    cardContainer.innerHTML = ""; // Clear previous cards

    results.forEach(async (pokemon, index) => {
      const response2 = await fetch(pokemon.url);
      const imgUrl = await response2.json();
      const { sprites } = imgUrl;
      const dummyresult = {
        name: pokemon.name,
        imgUrl: sprites.front_default
      };

      const htmlTemp = `
        <div class="card-wrapper">
            <i class="fa-regular fa-heart"></i>
                <a href="info.html?name=${pokemon.name}">
                    <div class="cards">
                        <img src="${sprites.front_default}" alt="" />
                    <p>${pokemon.name}</p>
                </div>
                </a>
        </div>
            `;

      cardContainer.innerHTML += htmlTemp;

      results[index] = [pokemon, dummyresult];

      
      document.querySelectorAll('.fa-heart').forEach((heartIcon, index) => {
        heartIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent card click event from firing

            // Toggle the 'favorite' class on the clicked heart icon
            heartIcon.classList.toggle('fa-regular');
            heartIcon.classList.toggle('fa-solid');

            //calling add to fav function
            console.log(results[index]);
            addToFavroites(results[index][1]);
            console.log(`clicked index: ${index}`);
        });
    });
  });
  } catch (error) {
    console.log(error.message);
  }
};

// paggination====================================================================================================================================
const goToPreviousPage = () => {
  if (currentPage > 1) {
    currentPage--;
    getAPIData(currentPage,currentLimit);
    updatePageCount(currentPage);
  }
  if (currentPage === 1) {
    prevBtn.style.visibility = "hidden";
    prevPage.disabled = true; // Disable previous button on first page
    updatePageCount(currentPage);
  }
};

const goToNextPage = () => {
  prevBtn.style.visibility = "visible";
  currentPage++;
  prevPage.disabled = false;
  getAPIData(currentPage,currentLimit);
  updatePageCount(currentPage);
};

prevPage.addEventListener("click", goToPreviousPage);
nextPage.addEventListener("click", goToNextPage);

const updatePageCount = function (count) {
  pageCount.innerHTML = `<p>Page ${count}</p>`;
};

//search implementation====================================================================================================================
searchBox.addEventListener("keyup", async (e) => {
  if (e.key === "Enter") {
    await searchPokemon();
  }
});

searchBtn.addEventListener("click", async () => {
  await searchPokemon();
});

async function searchPokemon() {
  try {
    const value = searchBox.value.trim().toLowerCase();
    if (!value) return;

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${value}`);
    if (!response.ok) {
      throw new Error("Pokemon not found!");
    }

    const data = await response.json();
    const { name, sprites } = data;
    const frontDefault = sprites?.front_default || "No image available";

    cardContainer.innerHTML = `
    <div class="card-wrapper">
        <a href="info.html?name=${name}">
            <div class="cards">
                <img src="${frontDefault}" alt="" />
            <p>${name}</p>
        </div>
      </a>
    </div>
        `;
    searchBox.value = "";
  } catch (error) {
    cardContainer.innerHTML = `<div class="error">${error.message}</div>`;
  }
}

clearBtn.addEventListener("click", function () {
  cardContainer.innerHTML = "";
  searchBox.value = "";
  getAPIData(1);
});


//Select Limit ============================================================================================================================
selectLimit.addEventListener('change', function() {
  currentLimit = parseInt(selectLimit.value);
  getAPIData(currentPage,currentLimit);
})

// open & close fav pokemon list============================================================================================================
openFavList.addEventListener('click', function() {
    favCardContainer.classList.add('active');
    overlayDiv.style.display = 'block';
    homeContainer.style.filter = 'blur(2px)';
    renderFavList();
});

closeFavList.addEventListener('click', function() {
  favCardContainer.classList.remove('active');
  overlayDiv.style.display = 'none';
  homeContainer.style.filter = 'blur(0px)';
})

clearAllFavList.addEventListener('click', function() {
  clearStorage();
  renderFavList();
});

// add to favroite==============================================================================================================================
const addToFavroites = function(data) {
  console.log(data);
    // Check if localStorage is available
    if (typeof(Storage) !== "undefined") {
      let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

      if(!favorites.some((item) => JSON.stringify(item) === JSON.stringify(data))) {
        favorites.push(data);
        localStorage.setItem("favorites", JSON.stringify(favorites));      
        console.log("Added to favorites:", data);
      } else {
        console.log('Data is already present');
      }
    } else {
      console.log("Local storage is not supported.");
    }
}

//render fav pokemon list==========================================================================================================================
const renderFavList = function() {
        //render fav list 
        const favContainerList = document.querySelector('.fav-list');
        favContainerList.innerHTML = '';
        
        const favListData = JSON.parse(localStorage.getItem("favorites"));
        if(favListData != null)
        {
          favListData.forEach(favorite => {
            const item = document.createElement('div');
            item.classList.add('items');
            item.innerHTML = `
              <img src="${favorite.imgUrl}" alt="">
              <p>${favorite.name}</p>
            `;
    
            favContainerList.appendChild(item);
          });
        }
        else {
          return;
        }
}

//clear fav list==============================================================================================================================
const clearStorage = function() {
  localStorage.clear();
}

// function calls==============================================================================================================================
getAPIData(currentPage);
renderFavList();


