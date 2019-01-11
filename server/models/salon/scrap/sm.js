const path = require('path')
const fs = require('fs')
const download = require('image-downloader')
const osmosis = require('osmosis')
const axios = require('axios')
const cheerio = require('cheerio')
const qs = require('qs')
const diskspace = require('diskspace');
const Salon = require('@models/salon')
const Business = require('@models/business')
const SalonController = require('@controllers/salons')
const UserController = require('@controllers/users')
const {setDefaultPass, millisecondsToMinutes} = require('@models/salon/helpers')
const {sendEmail} = require('@mail')

const formatNumberThousands = value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

/** N.B. Needs some adjustments in controller files (search for 'correct scraping' words in this file) **/

module.exports = {
  scrap: async () => {
    const startPage = 360 // next = current startPage + current pagesNum
    const pagesNum = 7
    const itemsFromPage = 10000 //unlim
    const baseUrl = 'https://salonymoskvy.ru/catalog/'

    for(let i = 0; i < pagesNum; i++) {
      const startTime = new Date()
      let dbSalonsOnStart
      let dbSalonsOnEnd
      let startFreeSpace

      await Salon.count({}, function (err, count) {
        dbSalonsOnStart = count
      })

      await diskspace.check('/', async function (err, result) {
        startFreeSpace = result.free
      })

      /* Scraping */
      await scrapListPage(baseUrl + (startPage + i), itemsFromPage)
      /* Scraping */

      const endTime = new Date()
      const millisecTimeDiff = endTime - startTime
      const timeArr = millisecondsToMinutes(millisecTimeDiff)
      const time = `${timeArr[0]} мин ${timeArr[1]} сек`
      const scrapPage = startPage + i

      await Salon.count({}, async function (err, count) {
        dbSalonsOnEnd = count
        const salonsAdded = dbSalonsOnEnd - dbSalonsOnStart
        const averageTimeArr = millisecondsToMinutes(parseInt(millisecTimeDiff / salonsAdded))
        const averageTime = `${averageTimeArr[0]} мин ${averageTimeArr[1]} сек`

        await diskspace.check('/', async function (err, result) {
          const freeSpace = result.free

          // await sendEmail(
          //   'scrap_report',
          //   'Marat',
          //   'OM',
          //   'zenpatrol@gmail.com',
          //   {
          //     scrapPage,
          //     startTime,
          //     endTime,
          //     time,
          //     dbSalonsOnStart,
          //     dbSalonsOnEnd,
          //     salonsAdded,
          //     averageTime,
          //     scrapSpace: formatNumberThousands(startFreeSpace - freeSpace),
          //     freeSpace: formatNumberThousands(freeSpace),
          //   })

          console.log(`${i + 1}. Заскраплена страница ${scrapPage} (добавлено ${salonsAdded} салонов) за ${time}. В базе ${dbSalonsOnEnd} салонов`)
          console.log('===============')
        })
      })
    }
  },

  scrapPage: async () => {
    const url = 'https://salonymoskvy.ru/salon/studiya-krasoty-beauty-the-city-na-michurinskom-prospekte-1882'

    await getSalonData(url)
  },

  business: async () => {
    const url = 'https://salonymoskvy.ru/specialization'
    await osmosis.get(url)
      .find('h5')
      .set('business')
      .data(async function(listing) {
        const name = listing.business.substr(0, listing.business.indexOf(' ('))
        const business = new Business({
          bid: 0,
          name,
        })

        await business.save()
      })
  },
}

const scrapListPage = async (baseUrl, itemsFromPage) => {
  const urls = []
  await osmosis.get(baseUrl)
    .find(['.ppt-list.list-vw.mb-30.featured .content > a.btn@href'])
    .set('url')
    .data(async listing => {
      if(urls.length < itemsFromPage) {
        urls.push(listing.url)
      }
    })

  // console.log(urls)

  for(const url of urls) {
    await getSalonData(url)
  }
}

const getSalonData = async url => {
  // console.log(url)

  let companyId = 1
  let salon = {}
  const html = await axios(url)
  const $ = cheerio.load(html.data)

  const addressEl = $('.information-block li').eq(1).find('span a')
  const address = addressEl.html() ? addressEl.html(addressEl.html().replace('<br>', ' ')).text() : 'нет информации'

  let metro = $('.information-block li').eq(2).find('span').text()
  metro = metro && metro.toString().length > 2 ? metro : 'нет информации'

  let site = $('.information-block li').eq(2).find('span a').attr('href')
  site = site && site.toString().length > 2 ? site : 'нет информации'

  let schedule = $('.information-block li').last().find('span').text()
  schedule = schedule && schedule.toString().length > 2 ? schedule : 'нет информации'

  let description = $('.row.mb-40').eq(1).find('p').text()
  description = description && description.toString().length > 2 ? description : 'нет информации'

  const listing = {
    name: $('h1').text(),
    company_id: $('.org_phone_link a').data('company_id'),
    avatar: $('.gallery img').attr('src'),
    address,
    metro,
    site,
    schedule,
    description,
    businesses: $('.amenities li').map(function() {
      return $(this).text()
    }).get(),
  }

  $('.information-block li').each(function() {
    if($(this).text().indexOf('Рейтинг') !== -1) {
      listing.sm_rating = $(this).find('span').text()
    }
  })

  if(listing.name) {
    let cutName = listing.name.substr(0, listing.name.indexOf(' на '))
    if (!cutName) {
      cutName = listing.name.substr(0, listing.name.indexOf(' в '))
    }
    if (!cutName) {
      cutName = listing.name
    }

    listing.name = cutName
  }

  listing.sm_link = url
  listing.sm_name = listing.name
  if(listing.metro) {
    listing.metro = listing.metro.indexOf('(') !== -1 ? listing.metro.substr(0, listing.metro.indexOf('(')).trim() : listing.metro
  }
  if(listing.description) {
    listing.description = listing.description.trim()
  }
  listing.address = `г Москва, ${listing.address}`
  companyId = listing.company_id
  salon = listing

  const showPhone = await axios.post(`https://salonymoskvy.ru/company/ajax/show_fone`, qs.stringify({company_id: companyId}))
  if(showPhone.data.success && showPhone.data.success.phone) {
    const phone = showPhone.data.success.phone
    salon.phone = phone.indexOf('+') === -1 ? `+${phone}` : phone
  }
  else {
    console.log(`Salon at ${url} has no phone number. Skipping.`)
    return
  }

  if(salon.businesses) {
    salon.businesses = salon.businesses.filter(item => item.trim() !== '' && item.indexOf('items') === -1)
  }
  salon.connected = false

  const userData = {
    city: "Москва",
    country: "Россия",
    dob: "Mon Jan 01 2018 00:00:00 GMT+0300 (Москва, стандартное время)",
    email: `${companyId}@podruzhki.online`,
    gender: true,
    name: salon.name,
    surname: salon.name,
    newsSubscribed: true,
    password: salon.phone ? setDefaultPass(salon.phone) : "11111111",
    phone: salon.phone,
  }

  // console.log(userData)
  // console.log('===============')
  // console.log(salon)

  /* UserController.signUp changes for correct scraping
    const savedUser = await newUser.save()
    return savedUser
  */
  const savedUser = await UserController.signUp({value: {body: userData}}, {})

  delete salon.company_id
  const salonData = {
    user_id: savedUser._id,
    adminMid: savedUser.mateId,
    email: `${companyId}@podruzhki.online`,
    ...salon,
  }

  /* SalonController.add changes for correct scraping
    /not crucial - only promises handling/

    return savedSalon
  */
  const savedSalon = await SalonController.add({value: {body: salonData}}, {})

  if(salon.avatar) {
    await avatarSave(savedUser, savedSalon)
  }

  return salon
}

const avatarSave = async (user, salon) => {
  const url = salon.avatar
  const staticDirectoryPath = '/images/avatars'
  const filesDirectory = path.join(path.dirname(require.main.filename) + '/static' + staticDirectoryPath)
  let fileExtension = url.substring(url.lastIndexOf('.'), url.length).toLowerCase()
  fileExtension = fileExtension === 'jpeg' ? 'jpg' : fileExtension
  const fileName = user.mateId + fileExtension
  const filePath = `${filesDirectory}/${fileName}`

  const downloadOptions = {
    url: url,
    dest: filePath,
  }

  try {
    await download.image(downloadOptions)
    const nameForDb = path.join(staticDirectoryPath, fileName)

    user.avatar = nameForDb
    user.email = `${user.mateId}@podruzhki.online`
    user.active = true
    user.emailVerified = true
    user.verifyLink.used = true
    await user.save()

    salon.avatar = nameForDb
    salon.email = `${user.mateId}@podruzhki.online`
    await salon.save()
  } catch (e) {
    console.error(e)
  }
}
