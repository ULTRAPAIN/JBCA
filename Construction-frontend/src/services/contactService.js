import api from './api';

class ContactService {
  constructor() {
    this.baseURL = '/contact';
  }

  async submitContactForm(contactData) {
    try {
      const response = await api.post(this.baseURL, contactData);
      return response.data;
    } catch (error) {
      console.error('ContactService: Error submitting contact form:', error);
      throw error;
    }
  }

  async getContactInfo() {
    try {
      const response = await api.get(`${this.baseURL}/info`);
      return response.data;
    } catch (error) {
      console.error('ContactService: Error fetching contact info:', error);
      throw error;
    }
  }
}

export default new ContactService();
