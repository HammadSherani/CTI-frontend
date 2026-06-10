import auth from "./auth";
import config from "./config";
import chat from "./chat";
import notifications from "./notifications"; 
import home from "./home";
import academy from "./academy";
import wishlist from "./wishlist";
import cart from "./cart";

const rootReducer = {
  auth,
  config,
  chat,
  notifications,
  home,
  academy,
  wishlist,
  cart,
};
export default rootReducer;
