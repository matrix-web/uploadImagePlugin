import Upload from './upload.js'

const customUpload = new Upload('#file', {
  modeView: 'custom',
  buttonDownLoad: {
    el: document.querySelector('[data-button-download]'),
  },
  buttonOpen: {
    el: document.querySelector('[data-button-open]')
  },
  previewPos: {
    selectorPos: '[data-button-download]',
    pos: 'beforebegin'
  },
  accept: ['.png', '.jpg', '.jpeg', '.gif'],
  onUpload(files) {
    console.log(files)
  }
})

const uploadFile = new Upload('#file-upload', {
  modeView: 'default',
  multi: true,
  accept: ['.png', '.jpg', '.jpeg', '.gif'],
  onUpload(files) {

    files.forEach((file, index) => {
      const ref = storage.ref(`images/${file.name}`)
      const task = ref.put(file)

      task.on('state_changed', snapshot => {

        this.progressLoadToServer({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          index
        })
      }, error => {

      }, () => {
        task.snapshot.ref.getDownloadURL().then(url => {
          console.log('Download URL', url)
        })
      })
    })
  }
})

