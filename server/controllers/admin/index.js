const path = require('path')
const R = require('ramda')
const axios = require('axios')
const download = require('image-downloader')
const Tree = require('@models/tree')
const User = require('@models/user')
const Salon = require('@models/salon')
const Business = require('@models/business')
const {setDefaultPass, millisecondsToMinutes} = require('@models/salon/helpers')
const {sendEmail, sendSms} = require('@mail/services/sendpulse')
const {metro} = require('./data/MoscowMetro.js')

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1)

module.exports = {
  general: async (req, res, next) => {
    Salon.count({}, function (err, count) {
      console.log('There are %d salons in db', count)
    })

    // await sendEmail(
    //     'sign_up',
    //     'Иван',
    //     'Иванов',
    //     'zenpatrol@gmail.com',
    //     {link: 'http://ya.ru'})

    await sendEmail(
      'salon_offer',
      'Салон',
      // 'studiokselita@mail.ru',
      // 'khromceva69@gmail.com',
      'zenpatrol@gmail.com',
      {
        template: 'notFromDb',
        from: 'От Тани',
      },
    )

    // await createMailsXls()

    res.status(200).json({ok: 1})
  },

  yaDirect: async () => {
    const businessModels = await Business.find()
    const businesses = businessModels.map(item => item.name)

    const businessesFirst = [
      'Салон красоты',
      'Маникюр',
      'Педикюр',
      'Стрижка',
      'Завивка',
      'Наращивание ресниц',
      'Укладка',
      'Эпиляция',
      'Наращивание',
      'Ресницы',
      'Парикмахерская',
      'Прическа',
      'Татуаж',
      'СПА',
      'Салон',
      'Фотоомоложение',
      'Мезотерапия',
      'Брови',
      'Оформление бровей',
      'Ногти',
      'Ногтевой сервис',
      'Волосы',
      'Шелак',
    ]

    const businessesAll = R.uniq(businesses.concat(businessesFirst)).splice(100, 100)
    console.log(businessesAll)

    // const stationsExtra = [
    //   'энтузиастов',
    //   'ильича',
    //   'деловой',
    //   'речной',
    //   'победы',
    //   'водный',
    //   'ботанический',
    //   'мира',
    //   'китай',
    //   'ленинский',
    //   'черемушки',
    //   'теплый',
    //   'рокоссовского',
    //   'преображенская',
    //   'преображенка',
    //   'чистые',
    //   'охотный',
    //   'библиотека',
    //   'воробьевы',
    //   'вернадского',
    //   'революции',
    //   'победы',
    //   'славянский',
    //   'пятницкое',
    //   'филевский',
    //   'александровский',
    //   'цветной',
    //   'нахимовский',
    //   'академика янгеля',
    //   'янгеля',
    //   'донского',
    //   '1905 года',
    //   '1905',
    //   'кузнецкий',
    //   'волгоградский',
    //   'рязанский',
    //   'лермонтовский',
    //   'марьина',
    //   'сретенский',
    //   'крестьянская',
    //   'бунинская',
    //   'горчакова',
    //   'адмирала ушакова',
    //   'ушакова',
    //   'скобелевская',
    //   'старокачаловская',
    //   'битцевский',
    //   'ботанический',
    //   'рокоссовского',
    //   'соколиная',
    //   'энтузиастов',
    //   'котлы',
    //   'гагарина',
    //   'милашенкова',
    //   'кузнецкий',
    //   'академика королёва',
    //   'королёва',
    //   'выставочный',
    //   'эйзенштейна'
    // ]
    // const stations = R.uniq(metro.map(item => item.Name))
    //     .concat(stationsExtra.map(item => capitalizeFirstLetter(item)))
    // const firstChunk = stations.splice(198, 100)
    // const stationsChunks = [firstChunk, stations]

    const stationsUserFriendly = [
      'в Новокосино',
      'в Новогиреево',
      'в Перово',
      'на Шоссе энтузиастов',
      'на Авиамоторной',
      'на Площади Ильича',
      'на Марксистской',
      'на Третьяковской',
      'на Деловой центре',
      'на Парке Победы',
      'на Речном вокзале',
      'на Водном стадионе',
      'на Войковской',
      'на Соколе',
      'на Аэропорте',
      'на Динамо',
      'на Белорусской',
      'на Маяковской',
      'на Тверской',
      'на Театральной',
      'на Новокузнецкой',
      'на Павелецкой',
      'на Автозаводской',
      'на Технопарке',
      'на Коломенской',
      'на Каширской',
      'на Кантемировской',
      'в Царицыно',
      'в Орехово',
      'на Домодедовской',
      'на Красногвардейской',
      'на Алма-Атинской',
      'в Медведково',
      'на Бабушкинской',
      'на Свиблово',
      'на Ботаническом саду',
      'на ВДНХ',
      'на Алексеевской',
      'на Рижской',
      'на Проспекте Мира',
      'на Сухаревской',
      'на Тургеневской',
      'на Китай-городе',
      'на Октябрьской',
      'на Шаболовской',
      'на Ленинском проспекте',
      'на Академической',
      'на Профсоюзной',
      'на Новых Черемушках',
      'на Калужской',
      'в Беляево',
      'в Коньково',
      'в Теплом Стане',
      'в Ясенево',
      'на Новоясеневской',
      'на Бульваре Рокоссовского',
      'на Черкизовской',
      'на Преображенской площади',
      'в Сокольниках',
      'на Красносельской',
      'на Комсомольской',
      'на Красных воротах',
      'на Чистых прудах',
      'на Лубянке',
      'на Охотным ряду',
      'на Библиотеке им.Ленина',
      'на Кропоткинской',
      'на Парке культуры',
      'на Фрунзенской',
      'на Спортивной',
      'на Воробьевых горах',
      'на Университете',
      'на Проспекте Вернадского',
      'на Юго-Западной',
      'в Тропарево',
      'в Румянцево',
      'в Саларьево',
      'на Щелковской',
      'на Первомайской',
      'на Измайловской',
      'на Партизанской',
      'на Семеновской',
      'на Электрозаводской',
      'на Бауманской',
      'на Площади Революции',
      'на Курской',
      'на Арбатской',
      'на Смоленской',
      'на Киевской',
      'на Славянском бульваре',
      'на Кунцевской',
      'на Молодежной',
      'в Крылатском',
      'в Строгино',
      'в Мякинино',
      'на Волоколамской',
      'в Митино',
      'на Пятницком шоссе',
      'на Пионерской',
      'на Филевском парке',
      'на Багратионовской',
      'в Филях',
      'на Кутузовской',
      'на Студенческой',
      'на Александровском саду',
      'на Выставочной',
      'на Международной',
      'в Алтуфьево',
      'в Бибирево',
      'в Отрадном',
      'во Владыкино',
      'на Петровско-Разумовской',
      'на Тимирязевской',
      'на Дмитровской',
      'на Савеловской',
      'на Менделеевской',
      'на Цветном бульваре',
      'на Чеховской',
      'на Боровицкой',
      'на Полянке',
      'на Серпуховской',
      'на Тульской',
      'на Нагатинской',
      'на Нагорной',
      'на Нахимовском проспекте',
      'на Севастопольской',
      'на Чертановской',
      'на Южной',
      'на Пражской',
      'на Улице Академика Янгеля',
      'в Аннино',
      'на Бульваре Дмитрия Донского',
      'на Планерной',
      'на Сходненской',
      'на Тушинской',
      'на Спартаке',
      'на Щукинской',
      'на Октябрьском поле',
      'на Полежаевской',
      'на Беговой',
      'на Улице 1905 года',
      'на Баррикадной',
      'на Пушкинской',
      'на Кузнецком мосту',
      'на Таганской',
      'на Пролетарской',
      'на Волгоградском проспекте',
      'в Текстильщиках',
      'в Кузьминках',
      'на Рязанском проспекте',
      'в Выхино',
      'на Лермонтовском проспекте',
      'в Жулебино',
      'в Котельниках',
      'на Новослободской',
      'на Добрынинской',
      'на Краснопресненской',
      'на Фонвизинской',
      'на Бутырской ',
      'на Марьиной Роща',
      'на Достоевской',
      'на Трубной',
      'на Сретенском бульваре',
      'на Чкаловской',
      'на Римской',
      'на Крестьянской заставе',
      'на Дубровке',
      'на Кожуховской',
      'на Печатники',
      'на Волжской',
      'в Люблино',
      'на Братиславской',
      'в Марьино',
      'в Борисово',
      'на Шипиловской',
      'в Зябликово',
      'на Варшавской',
      'на Каховской',
      'на Бунинской аллее',
      'на Улице Горчакова',
      'на Бульваре Адмирала Ушакова',
      'на Улице Скобелевской',
      'на Улице Старокачаловской',
      'на Лесопарковой',
      'на Битцевском Парке',
      'на Окружной',
      'в Ростокино',
      'на Белокаменной',
      'на Локомотиве',
      'в Измайлово',
      'на Соколиной Гора',
      'на Шоссе Энтузиастов',
      'в Андроновке',
      'на Нижегородской',
      'на Новохохловской',
      'на Угрешской',
      'на ЗИЛе',
      'на Верхних Котлах',
      'на Крымской',
      'на Площади Гагарина',
      'в Лужниках',
      'на Шелепихе',
      'в Хорошево',
      'на Зорге',
      'на Панфиловской',
      'в Стрешнево',
      'на Балтомской',
      'в Коптево',
      'в Лихоборах',
      'на Улице Милашенкова',
      'на Телецентре',
      'на Улице Академика Королёва',
      'на Выставочном центре',
      'на Улице Сергея Эйзенштейна',
      'на Энтузиастов',
      'на Ильича',
      'на Деловой',
      'на Речном',
      'на Победы',
      'на Водном',
      'на Ботаническом',
      'на Мира',
      'на Ленинском',
      'на Черемушках',
      'на Теплом',
      'на Рокоссовского',
      'на Преображенской',
      'на Преображенке',
      'на Чистых',
      'на Охотном',
      'на Библиотеке',
      'на Воробьевх',
      'на Вернадского',
      'на Революции',
      'на Победы',
      'на Славянском',
      'на Пятницком',
      'на Филевском',
      'на Александровском',
      'на Цветном',
      'на Нахимовском',
      'на Академика Янгеля',
      'на Янгеля',
      'на Донского',
      'на 1905 года',
      'на 1905',
      'на Кузнецком',
      'на Волгоградском',
      'на Рязанском',
      'на Лермонтовском',
      'на Марьиной',
      'на Сретенском',
      'на Крестьянской',
      'на Бунинской',
      'на Горчакова',
      'на Адмирала Ушакова',
      'на Ушакова',
      'на Скобелевской',
      'на Старокачаловской',
      'на Битцевском',
      'на Ботаническом',
      'на Рокоссовского',
      'на Соколиной',
      'на Энтузиастов',
      'на Котлах',
      'на Гагарина',
      'на Милашенкова',
      'на Кузнецком',
      'на Академика Королёва',
      'на Королёва',
      'на Выставочном',
      'на Эйзенштейна' ,
    ]

    const stationChunkStart = [0, 200]

    const stationsChunkKey = 0
    const businessesKey = 22

    const firstChunk = stationsUserFriendly.splice(stationChunkStart[stationsChunkKey], 200)
    const stationsChunks = [firstChunk, stationsUserFriendly]

    const stationsChunksKey = 0
    let requests = ''
    for(let i = 0; i < stationsChunks[stationsChunksKey].length; i++) {
      requests += `${capitalizeFirstLetter(businessesFirst[businessesKey])} ${stationsChunks[stationsChunksKey][i]},`
    }

    // console.log(requests)
  },

  salonDefaultPass: (req, res, next) => {
    const pass = setDefaultPass(req.params.phone)

    res.status(200).json({pass})
  },

  userTreeMateIds: async (req, res, next) => {
    const userData = await User.findOne({mateId: req.params.mateId.toUpperCase()})
    const {mateId, uplines} = userData
    uplines.unshift(mateId)
    const treeObject = await Tree.findOne()
    const tree = R.clone(treeObject.tree)
    const userTree = R.reverse(uplines).reduce((treePart, item) => {return treePart[item]}, tree)

    let treeMateIds = []
    function rec(object) {

      if(typeof object === 'object') {
        Object.values(object).forEach(obj => {
          treeMateIds = treeMateIds.concat(Object.keys(obj))

          rec(obj)
        })
      }
    }

    treeMateIds = treeMateIds.concat(Object.keys(userTree))
    rec(userTree)

    const users = await User.find(
      {mateId: {$in: treeMateIds}},
        {mateId: 1, name: 1, surname: 1, avatar: 1, gender: 1})

    res.status(200).json({mateId, treeMateIds, userTree, users})
  },

  imageDownload: async (req, res, next) => {
    const mateId = 's999'
    const url = 'https://salonymoskvy.ru/images/salon/a6d722eed1d92be459e83ff677433c6c.jpg'
    const staticDirectoryPath = '/images/avatars'
    const filesDirectory = path.join(path.dirname(require.main.filename) + '/static' + staticDirectoryPath)
    const fileExtension = url.substring(url.lastIndexOf('.'), url.length)
    const fileName = mateId + fileExtension.toLowerCase()
    const filePath = `${filesDirectory}/${fileName}`

    const downloadOptions = {
      url: url,
      dest: filePath,
    }

    try {
      const { filename, image } = await download.image(downloadOptions)
      console.log(filename) // => /path/to/dest/image.jpg
    } catch (e) {
      console.error(e)
    }

    res.status(200).json({ok: filePath})
  },

  editEntityModels: (req, res, next) => {

    res.status(200).json(Object.keys(User.db.models))
  },

  editEntityModelFields: (req, res, next) => {
    const {name} = req.params

    res.status(200).json(Object.keys(User.db.models[name].schema.tree))
  },

  editEntityData: async (req, res, next) => {
    const {model, field, skip, limit} = req.body
    const Entity = require('@models/' + model.toLowerCase())
    const fieldsToGet = {}
    fieldsToGet[field] = 1

    const data = await Entity.find({}, fieldsToGet).skip(skip).limit(limit)

    res.status(200).json(data)
  },

  editEntitySave: async (req, res, next) => {
    const reqBody = req.body
    const {model, _id} = reqBody
    const Entity = require('@models/' + model.toLowerCase())

    delete reqBody.model
    delete reqBody._id

    await Entity.findByIdAndUpdate(_id, {$set: reqBody}, {new: true}, function(err, doc) {
      if(err){
        res.status(500).json({})

        throw new Error(err)
      }

      res.status(200).json(doc)
    })
  },
}

const changeFolderFilenams = () => {
  const fs = require('fs')
  const testFolder = '/app/server/static/images/420/'

  fs.readdirSync(testFolder).forEach(file => {
    const fileName = file.substring(0, file.lastIndexOf('.')).toUpperCase()
    const fileExtension = file.substring(file.lastIndexOf('.'), file.length).toLowerCase()

    fs.rename(testFolder + file, testFolder + fileName + fileExtension, function(err) {
      if ( err ) console.log('ERROR: ' + err)
    })
    console.log(file)
  })
}

const createMailsXls = async () => {
  const XLSX = require('xlsx')

  const sites = await Salon.find({site: {$regex: /^((?!salonymoskvy).)*$/gm, $exists: true, $ne: ''}, blocked: false},{_id: 0, sid: 1, site: 1}).limit(100)
  const sitesData = []

  for(let i = 0; i < sites.length; i++) {
    const site = sites[i]

    if (site.site.indexOf('instagram') === -1) {
      try {
        const page = await axios(site.site)

        if (page && page.data) {
          page.data.indexOf('zoon') !== -1 ? console.log(site.site, 'zoon') : console.log(site.site)
          if (page.data.indexOf('zoon') === -1) {
            sitesData.push(Object.values(site.toObject()))
          }
        }
      }
      catch (err) {
        throw Error(err)
      }
    }
  }

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([
    [ '#', 'Site', 'Email'],
    ...sitesData,
  ])

  XLSX.utils.book_append_sheet(wb, ws, 'Mails')
  XLSX.writeFile(wb, 'server/mails.xls')
}
