import { myAxios } from "./helper";
export const signUp=(user)=>{
    return myAxios
     .post('/api/student/add')
     .then((response )=>response.josn)
};