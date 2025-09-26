const ACCESS = "aurora.accessToken";
const REFRESH = "aurora.refreshToken";
const USER = "aurora.user";

<<<<<<< HEAD
export const storage = {
  get tokens() {
    // önce localStorage, yoksa sessionStorage
    const access = localStorage.getItem(ACCESS) ?? sessionStorage.getItem(ACCESS);
    const refresh = localStorage.getItem(REFRESH) ?? sessionStorage.getItem(REFRESH);
    return { access, refresh };
  },
  saveSession({ accessToken, refreshToken, user }: any, remember = true) {
    const s = remember ? localStorage : sessionStorage; // hedef mağaza
    s.setItem(ACCESS, accessToken);
    if (refreshToken) s.setItem(REFRESH, refreshToken);
    s.setItem(USER, JSON.stringify(user));

    // Diğer mağazayı temizle (çakışmayı önlemek için)
    const other = remember ? sessionStorage : localStorage;
    other.removeItem(ACCESS);
    other.removeItem(REFRESH);
    other.removeItem(USER);
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
=======

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
>>>>>>> ffcb4278176d55c38840c162d432d16f57abc477
