'use babel';

import ImgurUploaderView from './imgur-uploader-view';
import { CompositeDisposable } from 'atom';

export default {

  imgurUploaderView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.imgurUploaderView = new ImgurUploaderView(state.imgurUploaderViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.imgurUploaderView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'imgur-uploader:toggle': () => this.toggle()
    }));
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
    console.log('ImgurUploader was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
