import auth from "./auth";
import config from "./config";
import chat from "./chat";
import notifications from "./notifications"; 
import home from "./home";
import academy from "./academy";
const rootReducer = {
  auth,
  config,
  chat,
  notifications,
  home,
  academy,
};
export default rootReducer;
