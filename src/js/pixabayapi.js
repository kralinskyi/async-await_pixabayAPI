import axios from 'axios';

export default class PixabayApi {
  constructor() {
    this.page = 1;
    this.per_page = 40;
    this.query = '';
    this.image_type = 'photo';
    this.orientation = 'horizontal';
    this.safesearch = true;
    this.API_KEY = '34842285-9ef26a99ee49cc306160c27d8';
    this.baseURL = `https://pixabay.com/api/`;
  }

  async getPhotos() {
    try {
      const params = {
        key: this.API_KEY,
        q: this.query,
        image_type: this.image_type,
        orientation: this.orientation,
        safesearch: this.safesearch,
        per_page: this.per_page,
        page: this.page,
      };

      const response = await axios.get(this.baseURL, { params });
      this.page += 1;

      return response.data;
    } catch (error) {
      console.error(error);
    }
    throw error;
  }

  resetPage() {
    this.page = 1;
  }

  get currentQuery() {
    return this.query;
  }

  set currentQuery(newQuery) {
    this.query = newQuery;
  }
}
