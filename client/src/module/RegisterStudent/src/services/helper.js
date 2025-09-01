import axios from "axios";

export const BASE_URL='https://backend-hostel-module-production.up.railway.app/';
export const myAxios=axios.create({
    baseUrl:BASE_URL
});