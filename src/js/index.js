import { PixabayApi } from './pixabayapi.js';
import createGalleryCards from './../templates/card-gallery.hbs';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchFormEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
// const loadMoreBtn = document.querySelector('.load-more');
const targetEl = document.querySelector('.js-target-element');

const pixabayApi = new PixabayApi();

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 350,
});

searchFormEl.addEventListener('submit', onSearchForm);
// loadMoreBtn.addEventListener('click', onLoadMoreBtn);

async function onSearchForm(e) {
  e.preventDefault();

  pixabayApi.page = 1;
  pixabayApi.searchQuery = e.target.elements.searchQuery.value.trim();

  try {
    if (pixabayApi.searchQuery === '') {
      galleryEl.innerHTML = '';
      observer.unobserve(targetEl);

      Notiflix.Notify.info(
        'Please, type the name of images you would like to find.',
        {
          clickToClose: true,
          timeout: 2500,
        }
      );
      return;
    }

    const response = await pixabayApi.fetchPhotos();
    const { data } = response;

    if (data.hits.length === 0) {
      galleryEl.innerHTML = '';

      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        {
          clickToClose: true,
          timeout: 2500,
        }
      );
      return;
    }

    if (data.hits.length < pixabayApi.per_page) {
      galleryEl.innerHTML = createGalleryCards(data.hits);
      lightbox.refresh();

      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results.",
        {
          clickToClose: true,
          timeout: 2500,
        }
      );
      return;
    }

    galleryEl.innerHTML = createGalleryCards(data.hits);
    lightbox.refresh();
    observer.observe(targetEl);

    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`, {
      clickToClose: true,
      timeout: 2500,
    });
  } catch (error) {
    console.log(error);
  }
}

const observer = new IntersectionObserver(
  async (entries, observer) => {
    if (entries[0].isIntersecting) {
      pixabayApi.page += 1;

      try {
        const response = await pixabayApi.fetchPhotos();
        const { data } = response;

        galleryEl.insertAdjacentHTML(
          'beforeend',
          createGalleryCards(data.hits)
        );

        lightbox.refresh();

        if (data.hits.length === pixabayApi.page) {
          observer.unobserve(targetEl);
        }
        // console.log(pixabayApi.page);
        // console.log(Math.ceil(data.totalHits / pixabayApi.per_page));
        if (
          pixabayApi.page === Math.ceil(data.totalHits / pixabayApi.per_page)
        ) {
          Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results.",
            {
              clickToClose: true,
              timeout: 2500,
            }
          );
          return;
        }
      } catch (err) {
        console.log(err);
      }
    }
  },
  {
    root: null,
    rootMargin: '0px 0px 500px 0px',
    threshold: 1,
  }
);
