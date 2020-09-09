import config from "../config";

export function debug(msg) {

  if (config.DEBUG){
    console.log("### " + msg);
  }
}