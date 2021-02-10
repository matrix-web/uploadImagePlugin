# Плагин для загрузки изображений

Для сборки проекта использовался упаковщик для web-приложений [Parcel](https://ru.parceljs.org/)

Для запуска сборки необходимо:
* Скачать плагин к себе на локальный компьютер командой ```git clone```
* Перейти в папку с плагином командой ```cd uploadImagePlugin```
* И запустить сборку командой ```npm run serve```

В плагине есть два режима отображения:
* По умолчанию default, который использует свои стили и настройки по умолчанию
* И режим custom, в котором можно указать свои элементы и их положение

Для инициализации плагина используется класс `Upload(id, options)`.

id - id элемента input c типом file, 
options - объект с настройками, в котором можно указать следующие настройки:

options:
* modeView default или custom. Режим по умолчанию или настраиваемый.
* multi булево значение true или false. Указывает можно ли выбирать множество файлов, по умолчанию равен false.
* accept массив расширений файлов, которы могут быть выбраны
* opUpload функция, которая позволяет обрабатывать файлы
* Для modeView 'custom' можно указать
  * buttonDownLoad
    * el поле в котором размещается html - элемент с вашей кнопкой 'Загрузить'. Данный параметр можно не указывать будет использоваться кнопка по умолчанию.
    * selectorPos - селектор элемента, в который будует помещена кнопка
    * pos - позация куда необходимо разместить кнопку 'beforebegin', 'beforeend', 'afterbegin', 'afterend', относительно элемента с селектором selectorPos
  * buttonOpen
    * el поле в котором размещается html - элемент с вашей кнопкой 'Открыть'
  * previewPos можно указать:
    * selectorPos - селектор элемента в который следует разместить блок с preview изображения
    * pos позиция указывающая куда следует разместить элемент, можно указывать следующие позиции:
      * 'beforebegin' - элемент будет расположен перед элементом с селектором указанным в `selectorPos`
      * 'beforeend' - элемент будет помещен внутрь и конец элемента с селектором указанным в `selectorPos`
      * 'afterbegin' - элемент будет помещен внутрь и в начало элемента с селектором указанным в `selectorPos`
      * 'afterend' - элемент будет размещен после элемента с селектором указанным в `selectorPos`

Использование режима default:
```
const uploadFile = new Upload('#file-upload', {
  modeView: 'default', // Режим отображения по умолчанию
  multi: true, // Возможность загрузки множества файлов
  accept: ['.png', '.jpg', '.jpeg', '.gif'], // типы файлов, которые доступны для загрузки
  onUpload(files) { // Функция которая принимает в качестве параметров набор файлов. Внутри данной функции можно отправлять файлы на сервер.
    // В данном примере файлы загружаются в хранилище firebase
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
        // Функция для обработки ошибок
      }, () => {
        task.snapshot.ref.getDownloadURL().then(url => {
          console.log('Download URL', url)
        })
      })
    })
  }
})```

Использование режима custom:
const customUpload = new Upload('#file', {
  modeView: 'custom',
  buttonDownLoad: {
    el: document.querySelector('[data-button-download]'), // Пользовательская кнопка Загрузки
    selectorPos: 'selector',
    pos: 'beforeend'
  },
  buttonOpen: {
    el: document.querySelector('[data-button-open]') // Пользовательская кнопка Открыть
  },
  previewPos: {
    selectorPos: '[data-button-download]', // Селектор указывающий где будет расположен блок с preview изображения
    pos: 'beforebegin' // Позиция куда он будет расположен
  },
  accept: ['.png', '.jpg', '.jpeg', '.gif'],
  onUpload(files) {
    // ...Код для обработки файлов
  }
})```