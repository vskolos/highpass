// Burger Menu

const openBurgerMenuBtn = document.querySelector('.js-open-burger')
const closeBurgerMenuBtn = document.querySelector('.js-close-burger')
const burgerMenu = document.querySelector('.header__bottom')

const toggleBurgerMenu = () => burgerMenu.classList.toggle('bottom--opened')

openBurgerMenuBtn.addEventListener('click', toggleBurgerMenu)
closeBurgerMenuBtn.addEventListener('click', toggleBurgerMenu)

// Search

const openSearchBtn = document.querySelector('.js-open-search')
const closeSearchBtn = document.querySelector('.js-close-search')
const searchBox = document.querySelector('.top__searchbox')

const toggleSearchBox = () => searchBox.classList.toggle('searchbox--opened')

openSearchBtn.addEventListener('click', toggleSearchBox)
closeSearchBtn.addEventListener('click', toggleSearchBox)
