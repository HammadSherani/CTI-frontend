import auth from "./auth";
import config from "./config";
import chat from "./chat";
import notifications from "./notifications"; 
import home from "./home";
const rootReducer = {
  auth,
  config,
  chat,
  notifications,
  home
};
export default rootReducer;
