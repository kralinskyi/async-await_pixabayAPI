'use strict';

import axios from 'axios';

export class PixabayApi {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '34842285-9ef26a99ee49cc306160c27d8';

  constructor() {
    this.page = null;
    this.per_page = 40;
    this.searchQuery = null;
  }

  fetchPhotos() {
    const searchParams = {
      params: {
        key: this.#API_KEY,
        q: this.searchQuery,
        page: this.page,
        per_page: this.per_page,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
      },
    };

    return axios.get(`${this.#BASE_URL}/`, searchParams);
  }
}
