const ACCESS = "aurora.accessToken";
const REFRESH = "aurora.refreshToken";
const USER = "aurora.user";


export const storage = {
get tokens() {
return {
access: localStorage.getItem(ACCESS),
refresh: localStorage.getItem(REFRESH),
};
},
saveSession({ accessToken, refreshToken, user }: any, remember = true) {
const storage = remember ? localStorage : sessionStorage;
// move everything to chosen store
storage.setItem(ACCESS, accessToken);
if (refreshToken) storage.setItem(REFRESH, refreshToken);
storage.setItem(USER, JSON.stringify(user));
if (!remember) {
// ensure localStorage cleared
localStorage.removeItem(ACCESS);
localStorage.removeItem(REFRESH);
localStorage.removeItem(USER);
} else {
// ensure sessionStorage cleared
sessionStorage.removeItem(ACCESS);
sessionStorage.removeItem(REFRESH);
sessionStorage.removeItem(USER);
}
},
clear() {
localStorage.removeItem(ACCESS);
localStorage.removeItem(REFRESH);
localStorage.removeItem(USER);
sessionStorage.removeItem(ACCESS);
sessionStorage.removeItem(REFRESH);
sessionStorage.removeItem(USER);
},
};