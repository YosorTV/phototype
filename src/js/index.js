import LazyLoad from "vanilla-lazyload";
import ScrollReveal from 'scrollreveal';
import gsap, {TimelineMax, Power2, Power1, Back} from 'gsap';
gsap.registerPlugin();

const tl = new TimelineMax();
const API_KEY = "563492ad6f91700001000001b07baf596d4c46b38ea8f526e3410871";
const gallery = document.querySelector('.gallery');
const logo = document.querySelector('#logo');
const searchInput = document.querySelector('.search-input');
const form = document.querySelector('.search-form');
const buttonMore = document.querySelector('.more');

let page = 1;
let searchValue;
let currentSearch;
let fetchLink;

const LazyLoadInstance = new LazyLoad({ elements_selector: ".lazy" })

const fetchApi = async (api, key) => {
  const dataFetch = await fetch(api, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: key
      },
    },
  );
  const data = await dataFetch.json();
  return data;
};

const generatePicture = ({ photos }) => {
  photos.forEach(({ src, photographer }) => {
    const galleryImg = document.createElement('figure');
      galleryImg.classList.add('gallery-img');
      galleryImg.innerHTML = `
        <figcaption class="gallery-info"> 
          <p>${photographer}</p>
          <a href=${src.original}>
            <i class="fa fa-download" aria-hidden="true"></i>
          </a>
        </figcaption>
        <img class="lazy" data-src=${src.large}></img>`;
          gallery.append(galleryImg);

          ScrollReveal().reveal(galleryImg, {
            origin:'bottom', 
            delay: 250, easing:'ease-in-out', 
            opacity:0,
            duration: 1000,
            reset: true
          });
  });
};

const clearScreen = () => {
  gallery.innerHTML = "";
  searchInput.value = "";
}

// get photos
const curatedPhotos = async () => {
  fetchLink = `https://api.pexels.com/v1/curated?per_page=15&page=1`;
  const data = await fetchApi(fetchLink, API_KEY);
  generatePicture(data);
  LazyLoadInstance.update();
}
// search photo
const searchPhotos = async (query) => {
  if (!query) return;
  fetchLink = `https://api.pexels.com/v1/search?query=${query}+query&per_page=15&page=1`;
  const data = await fetchApi(fetchLink, API_KEY);
  clearScreen();
  generatePicture(data);
  LazyLoadInstance.update();
};

const loadMore = async () => {
  page++;
    if(currentSearch) {
      fetchLink = `https://api.pexels.com/v1/search?query=${currentSearch}+query&per_page=15&page=${page}`;
    } else {
      fetchLink = `https://api.pexels.com/v1/curated?per_page=15&page=${page}`;
    }
    const data = await fetchApi(fetchLink, API_KEY);
    generatePicture(data);
    LazyLoadInstance.update();
}

const updateInput = (({ target }) => searchValue = target.value);
// Event listener
searchInput.addEventListener('input', updateInput);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  currentSearch = searchValue;
  searchPhotos(searchValue, API_KEY);
});

buttonMore.addEventListener('click', loadMore);

// Animations 
document.addEventListener("DOMContentLoaded", ()=> {
  tl.fromTo(logo, .5, {delay:.5, opacity:0}, {ease:Power2.easeIn, opacity:1}, 'next');
  tl.fromTo(form, 1, {opacity:0}, {ease:Power2.easeIn, y:0, opacity:1}, 'next');
  tl.fromTo(buttonMore, 1.5, {opacity:0}, {ease:Power2.easeIn, y:0, opacity:1}, 'next');
  tl.fromTo(gallery, 1, {y:100, opacity:0}, {ease:Power2.easeIn, y:0, opacity:1}, '-=.5');
})
curatedPhotos();