"use babel";
const Imgur = require("imgur-anonymous-uploader");
import ImgurUploaderView from "./imgur-uploader-view";
import { CompositeDisposable } from "atom";
const uploader = new Imgur(atom.config.get("imgurClientId"));
export default {
  imgurUploaderView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.imgurUploaderView = new ImgurUploaderView(
      state.imgurUploaderViewState
    );
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.imgurUploaderView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "imgur-uploader:toggle": () => this.toggle()
      })
    );
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.imgurUploaderView.destroy();
  },

  serialize() {
    return {
      imgurUploaderViewState: this.imgurUploaderView.serialize()
    };
  },

  toggle() {
    console.log("ImgurUploader was toggled!");
    let clipboard = require("electron").clipboard;
    let editor = atom.workspace.getActiveTextEditor();
    //if (editor.getPath().substr(-3) !== '.md') {console.log("not a md file");return}
    console.log("TestImg was toggled!");

    var fs = require("fs");

    let tempFilePath = null;
    let removeFile = () => tempFilePath && fs.unlinkSync(tempFilePath);
    try {
      if (clipboard.readImage().isEmpty()) return; // not image
      //if is image the start to upload
      //first insert text to md
      let placeHolderText = `uploading...`;
      // add placeholder
      editor.insertText(`${placeHolderText}`, editor);
      let suffix = clipboard.readText().replace(/(.*)+(?=\.)/, "");

      // electron clipboard can not supports gifs
      let buffer = null;
      switch (suffix) {
        case ".jpg":
        case ".jpeg":
          buffer = clipboard.readImage().toJpeg(100);
          break;
        case ".png":
        default:
          buffer = clipboard.readImage().toPNG();
      }
      let randomFileName =
        ((Math.random() * 1e6) | 0).toString(32) + (suffix || ".png");
      tempFilePath = __dirname + randomFileName;

      fs.writeFileSync(tempFilePath, Buffer.from(buffer));

      const path = tempFilePath;

      console.log("start");
      uploader
        .upload(path)
        .then(response => {
          console.log(response);
          editor.scan(new RegExp(placeHolderText), tools =>
            tools.replace(response.url)
          );
        })
        .catch(e => {
          console.log(e);
          editor.scan(new RegExp(placeHolderText), tools =>
            tools.replace(`Upload Error\n\nError dump:\n${e}`)
          );
        });
    } catch (e) {
      editor.scan(new RegExp(placeHolderText), tools =>
        tools.replace(`Upload Error\n\nError dump:\n${e}`)
      );
    }
  },
  config: {
    imgurClientId: {
      type: "string",
      description: "Enter Imgur Client ID",
      default: ""
    }
  }
};
