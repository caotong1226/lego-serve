import axios, { type AxiosInstance } from 'axios';
import type { Application } from 'egg';
const AXIOS = Symbol('Application#axios');
export default {
  echo(msg: string) {
    const that = this as Application;
    return `hello${msg}${that.config.name}`;
  },
  get axiosInstance(): AxiosInstance {
    if (!this[AXIOS]) {
      this[AXIOS] = axios.create({
        baseURL: 'https://dog.ceo/',
        timeout: 5000,
      });
    }
    return this[AXIOS];
  },
};
