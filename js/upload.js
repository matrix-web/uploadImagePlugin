export default class Upload {
  #buttonOpen = null
  #buttonUpload = null
  #preview = null
  #files = []
  #default = {}

  constructor(selector, options = {}) {
    this.input = this.#setInputFile(selector)
    this.#default = {
      modeView: 'default',
      multi: false,
      accept: ['.png', '.jpg', '.jpeg', '.gif'],
    }

    this.options = Object.assign(this.#default, options)

    this.#preview = this.#createElement('div', ['preview'])

    if (this.options.modeView === 'default') {
      this.#buttonOpen = this.#createElement('button', ['button', 'button--primary'], 'Открыть')
      this.#buttonUpload = this.#createElement('button', ['button', 'button--upload'], 'Загрузить')
      this.#buttonUpload.style.display = 'none'

      this.input.insertAdjacentElement('afterend', this.#preview)
      this.input.insertAdjacentElement('afterend', this.#buttonUpload)
      this.input.insertAdjacentElement('afterend', this.#buttonOpen)

      this.#buttonOpen.addEventListener('click', this.#triggerInput.bind(this))
      this.#buttonUpload.addEventListener('click', this.#uploadHandler.bind(this))
    } else if (this.options.modeView === 'custom') {
    
      if (this.options.hasOwnProperty('previewPos') && this.options.previewPos.hasOwnProperty('selectorPos')) {
        this.#positionElement(this.#preview, this.options.previewPos.selectorPos, this.options.previewPos.pos)
      } else {
        this.input.insertAdjacentElement('afterend', this.#preview)
      }

      if (this.options.hasOwnProperty('buttonOpen')) {
        if (this.options.buttonOpen.el instanceof HTMLElement) {
          this.#buttonOpen = this.options.buttonOpen.el

          this.#buttonOpen.addEventListener('click', this.#triggerInput.bind(this))
        }
      }

      if (this.options.hasOwnProperty('buttonDownLoad') && this.options.buttonDownLoad.hasOwnProperty('el')) {
        if (this.options.buttonDownLoad.el instanceof HTMLElement) {
            this.#buttonUpload = this.options.buttonDownLoad.el
            this.#buttonUpload.style.display = 'none'
        }
      } else {
        this.#buttonUpload = this.#createElement('button', ['button', 'button--upload'], 'Загрузить')
        this.#buttonUpload.style.display = 'none'
        this.input.insertAdjacentElement('afterend', this.#buttonUpload)
      }
      

      this.#buttonUpload.addEventListener('click', this.#uploadHandler.bind(this))
    }

    this.onUpload = options.onUpload ?? (() => {})

    if (this.options.multi) {
      this.input.setAttribute('multiple', true)
    }

    if (this.options.accept && Array.isArray(this.options.accept)) {
      this.input.setAttribute('accept', this.options.accept.join(', '))
    }
    
    this.input.addEventListener('change', this.#changeHandler.bind(this))
    this.#preview.addEventListener('click', this.#removePreview.bind(this))
  }

  bytesToSize(bytes) {
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    if (!bytes) {
      return '0 Byte'
    }

    const i = +Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i]
  }

  #positionElement(el, selectorPos, position) {
    const element = document.querySelector(selectorPos)
    
    if (element) {
      element.insertAdjacentElement(position, el)
    }
  }

  #triggerInput() {
    this.input.click()
  }

  #changeHandler(event) {
    if (!event.target.files.length) {
      return
    }

    this.#files = Array.from(event.target.files)
    this.#preview.innerHTML = ''
    this.#buttonUpload.style.display = 'inline-block'
    this.#renderPreview(this.#preview, this.#files)
  }

  #renderPreview(preview, files) {
    files.forEach(file => {
      if (!file.type.match('image')) {
        return
      }

      const reader = new FileReader()

      reader.onloadstart = event => {
        preview.insertAdjacentHTML('afterbegin', `
          <div class="preview__image"><div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
        `)
      }

      reader.onloadend = event => {
        const loader = document.querySelector('.lds-spinner')
        const parent = loader.parentNode
        loader.remove()
        parent.remove()
      }

      reader.onload = event => {  
        const src = event.target.result
        preview.insertAdjacentHTML('afterbegin', `
          <div class="preview__image">
            <div class="preview__remove" data-name="${file.name}">&times;</div>
            <img src="${src}" alt="${file.name}">
            <div class="preview__info">
              <span>${file.name}</span>
              <span>${this.bytesToSize(file.size)}</span>
            </div>
          </div>
        `)
      }

      reader.readAsDataURL(file)
    })
  }

  /**
   * 
   * @param {Object} options
   * @argument options {
   *  bytesTranferred - количество переданных байтов
   *  totalBytes - общее количество переданных байтов
   * }
   */
  progressLoadToServer(options) {
    const percentage = ((options.bytesTransferred / options.totalBytes) * 100).toFixed(0) + '%'
    const previewInfo = this.#preview.querySelectorAll('.preview__info')
    const fileIndex = options.index

    const progressLine = previewInfo[fileIndex].querySelector('.preview__info-progress')
    progressLine.textContent = percentage
    progressLine.style.width = percentage
  }

  #clearPreview(el) {
    el.style.transform = 'translateY(0)'
    el.innerHTML = `<div class="preview__info-progress"></div>`
  }

  #uploadHandler() {
    this.#preview.querySelectorAll('.preview__remove').forEach(e => e.remove())
    const previewInfo = this.#preview.querySelectorAll('.preview__info')
    previewInfo.forEach(this.#clearPreview)
    this.onUpload(this.#files)
  }

  #removePreview(event) {
    if (!event.target.dataset.name) {
      return
    }

    const { name } = event.target.dataset
    this.#files = this.#files.filter(file => file.name !== name)

    if (!this.#files.length) {
      this.#buttonUpload.style.display = 'none'
    }

    const block = this.#preview.querySelector(`[data-name="${name}"]`).closest('.preview__image')
    block.classList.add('removing')

    setTimeout(() => block.remove(), 300)
  }

  #setInputFile(selector) {
    return document.querySelector(selector)
  }

  #createElement(tag, classes = [], content) {
    const node = document.createElement(tag)

    if (classes.length) {
      node.classList.add(...classes)
    }

    if (content) {
      node.textContent = content
    }

    return node
  }
}