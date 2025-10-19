import auth from "./auth";
import config from "./config";
import chat from "./chat";
import notifications from "./notifications"; 
const rootReducer = {
  auth,
  config,
  chat,
  notifications
};
export default rootReducer;
