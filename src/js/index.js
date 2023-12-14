import './pixabayapi.js';
//!=================================Реалізація з кнопкою <Load more> ============================== //
// import './loadPhotos_Btn.js';

//!=================================Реалізація з Intersection ============================== //

import PixabayApi from './pixabayapi.js';
import { makeMarkup } from './templates.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';

const searchForm = document.querySelector('.search-form');
const formBtn = searchForm.querySelector('button[type="submit"]');
const gallery = document.querySelector('.gallery');
const target = document.querySelector('.js-intersection-target');

searchForm.addEventListener('submit', onFindPhotosClick);

let isObserverSet = false;

let options = {
  root: null,
  rootMargin: '100px',
};

let observer = new IntersectionObserver(moreLoadOnScroll, options);

function moreLoadOnScroll(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      fetchMorePhotosWithObserver();
    }
  });
}

const instance = new SimpleLightbox('.gallery a');

const apiPixabay = new PixabayApi();

async function onFindPhotosClick(e) {
  e.preventDefault();

  const { searchQuery } = e.currentTarget.elements;

  if (!searchQuery.value.trim()) return;
  if (searchQuery.value.trim()) formBtn.disabled = false;

  apiPixabay.currentQuery = searchQuery.value.trim();
  apiPixabay.resetPage();

  clearGalleryContainer();

  if (!isObserverSet) {
    observer.observe(target);
    isObserverSet = true;
  }

  // Видаляємо спостерігача перед повторним запуском
  observer.unobserve(target);

  fetchMorePhotosWithObserver();
}

async function fetchMorePhotosWithObserver() {
  try {
    const photosData = await apiPixabay.getPhotos();
    formBtn.disabled = true;

    const { hits } = photosData;

    handleRequestStatus(photosData);

    const galleryMarkup = makeMarkup(hits);

    gallery.insertAdjacentHTML('beforeend', galleryMarkup);

    formBtn.disabled = false;
    instance.refresh();
    observer.observe(target);
  } catch (error) {
    formBtn.disabled = false;
    console.log(error);
  }
}

function clearGalleryContainer() {
  gallery.innerHTML = '';
}

function handleRequestStatus({ hits, totalHits }) {
  let message = '';
  let notificationType = '';

  if (!hits.length) {
    message =
      'Sorry, there are no images matching your search query. Please try again.';
    notificationType = 'failure';
  } else {
    message = `Hooray! We found ${totalHits} images.`;
    notificationType = 'success';
  }

  if (hits.length < apiPixabay.per_page) {
    message = 'No more such photos';
    notificationType = 'warning';
  }

  Notify[notificationType](message);
}
