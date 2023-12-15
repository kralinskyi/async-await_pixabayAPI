import './pixabayapi.js';
//!=================================Реалізація з кнопкою <Load more> ============================== //
// import './loadPhotos_Btn.js';

//!==========================================Реалізація з Intersection ============================== //

import PixabayApi from './pixabayapi.js';
import { makeMarkup } from './templates.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';

const searchForm = document.querySelector('.search-form');
const formBtn = searchForm.querySelector('button[type="submit"]');
const gallery = document.querySelector('.gallery');
const target = document.querySelector('.js-intersection-target');

const instance = new SimpleLightbox('.gallery a');
const apiPixabay = new PixabayApi();

searchForm.addEventListener('submit', onSearchBtnClick);

let options = {
  root: null,
  rootMargin: '100px',
};

let observer = new IntersectionObserver(observeMorePhotos, options);

async function onSearchBtnClick(e) {
  e.preventDefault();

  const currentSearchQuery = e.currentTarget.elements.searchQuery.value.trim();

  if (!currentSearchQuery) {
    Notify.warning("Can't search empty value");
    return;
  }

  apiPixabay.resetPage();
  clearGalleryContainer();
  apiPixabay.currentQuery = currentSearchQuery;
  // Видаляємо спостерігача перед повторним запуском

  observer.unobserve(target);
  await fetchMorePhotos();
}

async function fetchMorePhotos() {
  try {
    // Чекаємо на результати запиту по заданому значенню пошуку
    const photosData = await apiPixabay.getPhotos();
    const { hits, totalHits } = photosData;

    if (!hits) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      // observer.unobserve(target);
    }

    if (hits.length < apiPixabay.per_page) {
      Notify.warning('No more such photos');
    }

    Notify.success(`Hooray! We found ${totalHits} images.`);

    formBtn.disabled = true;

    const galleryMarkup = makeMarkup(hits);
    observer.observe(target);

    if (!galleryMarkup) {
      observer.unobserve(target);
    }

    gallery.insertAdjacentHTML('beforeend', galleryMarkup);

    formBtn.disabled = false;
    instance.refresh();
  } catch (error) {
    formBtn.disabled = false;
    console.log(error);
    observer.unobserve(target);
  }
}

function clearGalleryContainer() {
  gallery.innerHTML = '';
}

function observeMorePhotos(entries) {
  console.log(entries);
  entries.forEach(async ({ isIntersecting }) => {
    if (isIntersecting) {
      await fetchMorePhotos();
    }
  });
}
