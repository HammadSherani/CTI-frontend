import auth from "./auth";
import config from "./config";
import chat from "./chat";
import notifications from "./notifications"; 
import home from "./home";
import academy from "./academy";
import wishlist from "./wishlist";
import cart from "./cart";
import refurbishedWishlist from "./refurbishedWishlist";
import refurbishedCart from "./refurbishedCart";

const rootReducer = {
  auth,
  config,
  chat,
  notifications,
  home,
  academy,
  wishlist,
  cart,
  refurbishedWishlist,
  refurbishedCart,
};
export default rootReducer;
