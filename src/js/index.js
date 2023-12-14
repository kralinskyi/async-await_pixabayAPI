import './pixabayapi.js';
import PixabayApi from './pixabayapi.js';
import { makeMarkup } from './templates.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';

const searchForm = document.querySelector('.search-form');
const formBtn = searchForm.querySelector('button[type="submit"]');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

searchForm.addEventListener('submit', onFindPhotosClick);
loadMoreBtn.addEventListener('click', onFetchPhotosClick);
const instance = new SimpleLightbox('.gallery a');

const apiPixabay = new PixabayApi();

async function onFindPhotosClick(e) {
  e.preventDefault();

  const { searchQuery } = e.currentTarget.elements;

  if (!searchQuery.value.trim()) return;
  if (searchQuery.value.trim()) formBtn.disabled = false;

  apiPixabay.q = searchQuery.value.trim();
  apiPixabay.resetPage();
  loadMoreBtn.hidden = true;
  clearGalleryContainer();

  // ===========================================================  same function!!!!
  onFetchPhotosClick();
}

async function onFetchPhotosClick() {
  try {
    const photosData = await apiPixabay.getPhotos();
    formBtn.disabled = true;

    const { hits } = photosData;

    ifLogic(photosData);

    loadMoreBtn.disable = true;
    loadMoreBtn.textContent = 'LOADING>>>';

    const galleryMarkup = makeMarkup(hits);

    gallery.insertAdjacentHTML('beforeend', galleryMarkup);

    loadMoreBtn.disable = false;
    loadMoreBtn.textContent = 'Load more';
    formBtn.disabled = false;
    instance.refresh();
  } catch (error) {
    loadMoreBtn.hidden = true;
    formBtn.disabled = false;

    console.log(error);
  }
}

function clearGalleryContainer() {
  gallery.innerHTML = '';
}

function ifLogic({ hits, total, totalHits }) {
  if (total > hits.length || hits.length * apiPixabay.page < total || !total) {
    loadMoreBtn.hidden = false;
  }

  if (!hits.length) {
    loadMoreBtn.hidden = true;

    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    throw new Error('bad request - no such photos');
  } else {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }

  if (hits.length < apiPixabay.per_page) {
    loadMoreBtn.hidden = true;
    Notify.warning('No more such photos');
  }
}
