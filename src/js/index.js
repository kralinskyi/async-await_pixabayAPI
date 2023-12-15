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

    // Якщо результатів немає - жаль.
    if (!hits) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    // Якщо результати є - починаємо спостерігати за таргетом.

    observer.observe(target);
    // у випадку коли результатів меньше, ніж вміщається на сторінку - знімаємо обсервер, бо буде подвійний запит до API
    if (hits.length < apiPixabay.per_page) {
      Notify.warning('No more such photos');
      observer.unobserve(target);
    }

    Notify.success(`Hooray! We found ${totalHits} images.`);
    formBtn.disabled = true;
    const galleryMarkup = makeMarkup(hits);

    // Якщо після успішних запитів спробуємо пошукати щось нове, що не матиме результатів  - знімаємо обсервер, щоб не було подвійного запиту до API, так як після очищення <UL> isIntersecting буде true.
    if (!galleryMarkup) {
      observer.unobserve(target);
    }

    // Малюємо галерею
    gallery.insertAdjacentHTML('beforeend', galleryMarkup);

    formBtn.disabled = false;
    // Оновлюємо екземпляр SimpleLightbox
    instance.refresh();
  } catch (error) {
    formBtn.disabled = false;
    console.log(error);
    // В разі fail знімаємо обсервер
    observer.unobserve(target);
  }
}

function clearGalleryContainer() {
  gallery.innerHTML = '';
}

function observeMorePhotos(entries) {
  entries.forEach(async ({ isIntersecting }) => {
    if (isIntersecting) {
      await fetchMorePhotos();
    }
  });
}
